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
kw_extractor = yake.KeywordExtractor(n=1)
window = SlidingWindowLeaderboard(300)
queue = asyncio.Queue()
model = KeyBERT('distilbert-base-nli-mean-tokens')
connected_clients = set()  # WebSocket clients

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

            kws = model.extract_keywords(text)[:1]
            for kw in kws:
                window.append(kw[0], text, kw[1])

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


async def start_server():
    config = uvicorn.Config(app, host="0.0.0.0", port=8000)
    server = uvicorn.Server(config)
    await server.serve()

async def main():
    """Run both WebSocket server and data processing."""
    await asyncio.gather(start_server(), fetch_data(), process_data())

if __name__ == "__main__":
    asyncio.run(main())  # Properly run all tasks