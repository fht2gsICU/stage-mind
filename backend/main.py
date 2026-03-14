from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="StageMind API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers (uncomment as you build each)
# from api.v1 import story, dialogue, branch
# app.include_router(story.router, prefix="/api/v1")
# app.include_router(dialogue.router, prefix="/api/v1")
# app.include_router(branch.router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok"}
