import asyncio
from websockets.asyncio.client import connect
import json
import yake
from collections import defaultdict
import os # debug purposes


class SlidingWindowLeaderboard:
    def __init__(self, size):
        self.size = size
        self.window = []
        self.counts = defaultdict(int)

    def append(self, item):
        self.window.append(item)
        self.counts[item] += 1
        if len(self.window) > self.size:
            rem = self.window.pop(0)
            self.counts[rem] -= 1
            if(self.counts[rem] == 0):
                del self.counts[rem]

    def getwindow(self):
        return self.window

    def getleaderboard(self):
        return sorted(self.counts.items(), key=lambda x: x[1], reverse=True)

    def __len__(self):
        return len(self.window)

    def __repr__(self):
        out = ""
        for item, count in self.getleaderboard()[:20]:
            out += f"{item}: {count}\n"
        return out


kw_extractor = yake.KeywordExtractor()
window = SlidingWindowLeaderboard(10000)

async def stream():
    async with connect("wss://jetstream2.us-east.bsky.network/subscribe?wantedCollections=app.bsky.feed.post") as websocket:
        while True:
            message = await websocket.recv()
            json_message = json.loads(message)
            try:
                kws = kw_extractor.extract_keywords(json_message["commit"]["record"]["text"])
                kws = [kw[0] for kw in kws]
                for kw in kws:
                    window.append(kw)
                os.system("clear")
                print(window)
            except KeyError:
                pass


if __name__ == "__main__":
    asyncio.run(stream())
