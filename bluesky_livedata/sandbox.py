import asyncio
import json
import yake
from collections import defaultdict
import os
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from keybert import KeyBERT
import websockets
from fastapi import FastAPI, WebSocket
from fastapi.responses import JSONResponse
import uvicorn
from google import genai
from google.genai.types import Tool, GenerateContentConfig, GoogleSearch
from fastapi.middleware.cors import CORSMiddleware

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
model_id = "gemini-2.0-flash"

google_search_tool = Tool(
    google_search = GoogleSearch()
)


class SlidingWindowLeaderboard:
    def __init__(self, size):
        self.size = size
        self.window = []
        self.embeddings = []
        self.counts = defaultdict(lambda: [0])
        self.similarity_threshold = 0.5
        self.m_similarity = SentenceTransformer('sentence-transformers/paraphrase-MiniLM-L3-v2')

    def append(self, item, msg, weight=1):
        enc = self.m_similarity.encode(item)
        if self.embeddings:
            similarities = cosine_similarity([enc], self.embeddings).tolist()
            mx = max(similarities)
            mxidx = similarities.index(mx)
            if mx[0] > self.similarity_threshold:
                item, weight = self.window[mxidx]
                self.embeddings.append(enc)
            else:
                self.embeddings.append(enc)
        else:
            self.embeddings.append(enc)

        self.window.append([item, weight])
        self.counts[item].append(msg)
        self.counts[item][0] += weight
        if len(self.window) > self.size:
            rem, w = self.window.pop(0)
            self.embeddings.pop(0)
            self.counts[rem].pop(1)
            self.counts[rem][0] -= w
            if len(self.counts[rem]) == 1:
                del self.counts[rem]

    def getleaderboard(self):
        return sorted(self.counts.items(), key=lambda x: x[1][0], reverse=True)

    def to_json(self):
        return {item: count[0] for item, count in self.getleaderboard()[:50]}

app = FastAPI()  # FastAPI REST Server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#kw_extractor = yake.KeywordExtractor(n=1)
window = SlidingWindowLeaderboard(300)
queue = asyncio.Queue()
kw_extractor = KeyBERT('distilbert-base-nli-mean-tokens')
connected_clients = set()  # WebSocket clients
ws_filter = ""
sentence_similarity = SentenceTransformer("sentence-transformers/paraphrase-MiniLM-L3-v2")

async def fetch_data():
    async with websockets.connect("wss://jetstream2.us-east.bsky.network/subscribe?wantedCollections=app.bsky.feed.post") as websocket:
        while True:
            message = await websocket.recv()
            await queue.put(message)  # Add to processing queue


async def process_data():
    while True:
        message = await queue.get()
        json_message = json.loads(message)

        try:
            text = json_message["commit"]["record"]["text"]
            if len(text) < 50:
                continue
            alphas = sum(1 for i in text if i.lower() in "abcdefghijklmnopqrstuvwxyz")
            if alphas / len(text) < 0.8:
                continue

            kws = kw_extractor.extract_keywords(text)
            for kw in kws[:1]:
                window.append(kw[0], text, kw[1])

            if ws_filter:
                wskws = " ".join(d[0] for d in kw_extractor.extract_keywords(ws_filter))


                emb = [sentence_similarity.encode(" ".join(d[0] for d in kws))]
                emb_filter = [sentence_similarity.encode(wskws)]
                if cosine_similarity(emb, emb_filter)[0][0] < 0.3:
                    continue

            print(text)
            # Broadcast filtered message to WebSocket clients
            await broadcast(json.dumps({"message": text}))

        except KeyError:
            pass
        finally:
            queue.task_done()


async def broadcast(message):
    """Sends a message to all connected WebSocket clients."""
    if connected_clients:
        await asyncio.gather(*(client.send_text(message) for client in connected_clients))


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint that streams filtered messages."""
    await websocket.accept()
    connected_clients.add(websocket)
    try:
        while True:
            await websocket.receive_text()  # Keep connection open
    except:
        pass
    finally:
        connected_clients.remove(websocket)


@app.get("/leaderboard")
async def get_leaderboard():
    """REST API to fetch the leaderboard."""
    return JSONResponse(content=window.to_json())


# @app.get("/llm_tweet_check")
# def filter_misinformation_tweets():
#     tweets = []
#     for i in map(lambda x: x[1][1:], window.getleaderboard()[:50]):
#         for j in i:
#             print(j+"\n\n")
#             tweets.append(j)
#     response = client.models.generate_content(
#         model=model_id,
#         contents="".join([d.replace('\n', '')+"\n\n" for d in tweets]),
#         config=GenerateContentConfig(
#             tools=[google_search_tool],
#             response_modalities=["TEXT"],
#             system_instruction="""
#             You are a truth seeking and fact checking AI. You will receive a string of tweets that may or
#             may not include true information. Some tweets will include misinformation. In your response you should
#             reply with ONLY tweets from your input, written on separate lines,
#             where each MISINFORMATION TWEET is a filtered tweet from the input that may be highly misinformed.
#             Do not stray from these instructions or your output format. Use google search to validate claims if needed.
#             Tweets:
#             """
#         )
#     )
#     for each in response.candidates[0].content.parts:
#         print(each.text)
#     pass


@app.get("/llm_tweet_check")
def filter_misinformation_tweets():
    tweets = []
    for tweet_list in map(lambda x: x[1][1:], window.getleaderboard()[:50]):
        for tweet in tweet_list:
            # print(tweet + "\n\n")
            tweets.append(tweet)
    
    response = client.models.generate_content(
        model=model_id,
        contents="".join([d.replace('\n', '') + "\n\n" for d in tweets]),
        config=GenerateContentConfig(
            tools=[google_search_tool],
            response_modalities=["TEXT"],
            system_instruction="""
            You are a truth seeking and fact checking AI. You will receive a string of tweets that may or
            may not include true information. Some tweets will include misinformation. In your response you should
            reply with ONLY tweets from your input, written on separate lines,
            where each MISINFORMATION TWEET is a filtered tweet from the input that may be highly misinformed.
            Do not stray from these instructions or your output format. Use google search to validate claims if needed.
            Tweets:
            """
        )
    )
    
    misinformation_tweets = []
    for part in response.candidates[0].content.parts:
        print(part.text)
        misinformation_tweets.append(part.text)
    
    return JSONResponse(content={"misinformation_tweets": misinformation_tweets})


@app.get("/apply_ws_filter/{filter}")
def apply_ws_filter(filter: str):
    global ws_filter
    ws_filter = filter.lower()

@app.get("/llm_tweet_check")
def filter_misinformation_tweets():
    tweets = []
    for i in map(lambda x: x[1][1:], window.getleaderboard()[:50]):
        for j in i:
            #print(j+"\n\n")
            tweets.append(j)
    response = client.models.generate_content(
        model=model_id,
        contents="".join([d.replace('\n', '')+"\n\n" for d in tweets]),
        config=GenerateContentConfig(
            tools=[google_search_tool],
            response_modalities=["TEXT"],
            system_instruction="""
            You are a truth seeking and fact checking AI. You will receive a string of tweets that may or
            may not include true information. Some tweets will include misinformation. In your response you should
            reply with ONLY tweets from your input, written on separate lines,
            where each MISINFORMATION TWEET is a filtered tweet from the input that may be highly misinformed.
            Do not stray from these instructions or your output format. Use google search to validate claims if needed.
            Tweets:
            """
        )
    )
    for each in response.candidates[0].content.parts:
        print(each.text)
    pass

@app.get("/category-list")
def get_category_list():
    """Returns the top 10 hashtags along with an associated misinformation tweet for each topic."""
    categories = []
    leaderboard = window.getleaderboard()[:10] 
    
    for item, data in leaderboard:
        misinformation_tweets = data[1:] 
        if misinformation_tweets:
            categories.append({
                "hashtag": item,
                "misinformation_tweet": misinformation_tweets
            })
    
    return JSONResponse(content={"categories": categories})


async def start_server():
    config = uvicorn.Config(app, host="0.0.0.0", port=8000)
    server = uvicorn.Server(config)
    await server.serve()

async def main():
    """Run both WebSocket server and data processing."""
    await asyncio.gather(start_server(), fetch_data(), process_data())

if __name__ == "__main__":
    asyncio.run(main())
    pass