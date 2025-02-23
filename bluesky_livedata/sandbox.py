import asyncio
from websockets.asyncio.client import connect
import json
import yake
from collections import defaultdict
import os # debug purposes
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from keybert import KeyBERT


class SlidingWindowLeaderboard:
    def __init__(self, size):
        self.size = size
        self.window = []
        self.embeddings = []
        self.counts = defaultdict(lambda: [0])
        self.similarity_threshold = 0.5

        self.m_similarity = SentenceTransformer('sentence-transformers/paraphrase-MiniLM-L3-v2')

    def append(self, item, msg, weight=1):
        # first check if post is similar
        enc = self.m_similarity.encode(item)
        if self.embeddings:
            similarities = cosine_similarity([enc], self.embeddings).tolist()
            mx = max(similarities)
            mxidx = similarities.index(mx)
            if mx[0] > self.similarity_threshold:
                item,weight = self.window[mxidx]
                self.embeddings.append(enc)
            else:
                self.embeddings.append(enc)
        else:
            self.embeddings.append(enc)

        self.window.append([item,weight])
        self.counts[item].append(msg)
        self.counts[item][0] += weight
        if len(self.window) > self.size:
            rem, w = self.window.pop(0)
            self.embeddings.pop(0)
            self.counts[rem].pop(1)
            self.counts[rem][0] -= w
            if len(self.counts[rem]) == 1:
                del self.counts[rem]


    def get_keyword_tweets(self, q: str):
        enc = self.m_similarity.encode(q)
        similarities = cosine_similarity([enc], self.embeddings).tolist()
        mx = max(similarities)
        mxidx = similarities.index(mx)
        if mx[0] > self.similarity_threshold:
            return self.counts[self.window[mxidx]]
        else:
            return ["no tweets for this tag"]

    def getwindow(self):
        return self.window

    def getleaderboard(self):
        return sorted(self.counts.items(), key=lambda x: x[1][0], reverse=True)

    def __len__(self):
        return len(self.window)

    def __repr__(self):
        out = ""
        pos = 1
        for item, count in self.getleaderboard()[:50]:
            out += f"({pos})\t{item}: {count[0]}  : \t {[d[:50] for d in count[1:10]]}\n"
            #out += f"({pos})\t{item}: {count[0]}\n"
            pos += 1
        return out


# kw_extractor = yake.KeywordExtractor()
# window = SlidingWindowLeaderboard(1000)
#
#
# async def stream():
#     async with connect("wss://jetstream2.us-east.bsky.network/subscribe?wantedCollections=app.bsky.feed.post") as websocket:
#         queue = []
#         while True:
#             message = await websocket.recv()
#             json_message = json.loads(message)
#             try:
#                 text = json_message["commit"]["record"]["text"]
#                 if len(text) < 20: continue
#                 alphas = 0
#                 for i in text:
#                     if i.lower() in "abcdefghijklmnopqrstuvwxyz":
#                         alphas += 1
#                 if alphas/len(text) < 0.8:
#                     continue
#
#                 queue.append(text)
#
#                 if len(queue) > 10:
#                     for i in range(10):
#                         text = queue[i]
#                         kws = kw_extractor.extract_keywords(text)
#                         kws = [kw[0] for kw in kws][:3]
#                         for kw in kws:
#                             window.append(kw, text)
#
#                     os.system("clear")
#                     print(window)
#                     queue = []
#
#             except KeyError:
#                 pass
#             # print("get message from tag")
#             # query = input("enter query: ").strip()
#             # if query:
#             #     print("hohouh")
#             #     print(window.get_keyword_tweets(query))
#
#
# if __name__ == "__main__":
#     asyncio.run(stream())


kw_extractor = yake.KeywordExtractor(n=1)
window = SlidingWindowLeaderboard(300)
queue = asyncio.Queue()
model = KeyBERT('distilbert-base-nli-mean-tokens')

async def fetch_data():
    async with connect("wss://jetstream2.us-east.bsky.network/subscribe?wantedCollections=app.bsky.feed.post") as websocket:
        while True:
            message = await websocket.recv()
            await queue.put(message)  # Add message to queue

async def process_data():
    while True:
        message = await queue.get()  # Get message from queue
        json_message = json.loads(message)

        try:
            text = json_message["commit"]["record"]["text"]
            if len(text) < 50:
                continue
            alphas = sum(1 for i in text if i.lower() in "abcdefghijklmnopqrstuvwxyz")
            if alphas / len(text) < 0.8:
                continue

            #kws = [kw[0] for kw in kw_extractor.extract_keywords(text)][:1]
            kws = model.extract_keywords(text)[:1]
            for kw in kws:
                window.append(kw[0], text, kw[1])

            os.system("clear")
            print(window)

        except KeyError:
            pass
        finally:
            queue.task_done()  # Mark task as done

async def main():
    await asyncio.gather(fetch_data(), process_data())

if __name__ == "__main__":
    asyncio.run(main())