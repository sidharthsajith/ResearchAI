from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app import ai_search as process_query, ai_search_stream as process_stream
from pydantic import BaseModel
import json

app = FastAPI()

# Configure CORS (same as before)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str

class OutputResponse(BaseModel):
    answer: str

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            try:
                query_data = json.loads(data)
                query = query_data.get('query')
                
                if not query:
                    await websocket.send_text(json.dumps({"error": "Query is required"}))
                    continue

                # Stream chunks one by one
                try:
                    for chunk in process_stream(query):
                        await websocket.send_text(json.dumps({"answer": chunk}))
                except Exception as e:
                    await websocket.send_text(json.dumps({"error": str(e)}))
                
            except Exception as e:
                await websocket.send_text(json.dumps({"error": str(e)}))
                
    except WebSocketDisconnect:
        print("Client disconnected")

@app.post("/process", response_model=OutputResponse)
def process_query_endpoint(query_data: QueryRequest):
    try:
        result = process_query(query_data.query)
        return OutputResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))