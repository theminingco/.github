"""This module contains all the code related to running an inference api."""
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
    """Run inference on a sample using a trained model"""
    return {"Hello": "World"}


def main(args):
    """The entrypoint of the api module."""
    log_level = "trace" if args.verbose else "info"
    port = args.port if hasattr(args, "port") else 2000
    run(
        "api.main:app",
        host="0.0.0.0",
        port=port,
        log_level=log_level,
        reload=args.watch
    )

if __name__ == "__main__":
    from argparse import ArgumentParser
    parser = ArgumentParser()
    parser.add_argument("-v", "--verbose", action="store_true")
    parser.add_argument("-w", "--watch", action="store_true")
    parser.add_argument("-p", "--port", type=int)
    main(parser.parse_args())
