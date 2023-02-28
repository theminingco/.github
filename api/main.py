from fastapi import FastAPI
from uvicorn import run

app = FastAPI(
    title="jewl.app",
    version="1",
    docs_url=None,
    redoc_url="/"
)

@app.post("/infer")
def run_inference():
    return {"Hello": "World"}

def main(args):
    log_level = "trace" if args.verbose else "info"
    port = args.port if hasattr(args, "port") else 2000
    run(
        "api.main:app",
        host="0.0.0.0",
        port=port,
        log_level=log_level,
        reload=args.watch
    )
