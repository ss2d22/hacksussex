import asyncio
from websockets.asyncio.client import connect
import json

async def hello():
    async with connect("wss://jetstream2.us-east.bsky.network/subscribe?wantedCollections=app.bsky.feed.post") as websocket:
        while True:
            message = await websocket.recv()
            json_message = json.loads(message)
            try:
                print(json_message["commit"]["record"]["text"])
                print(json_message)
            except KeyError:
                pass


if __name__ == "__main__":
    asyncio.run(hello())
