"""This module contains all the code related to running an inference api."""
from fastapi import FastAPI
from fastapi.openapi.docs import get_redoc_html
from uvicorn import run

app = FastAPI(
    title="jewl-ai",
    version="docs",
    docs_url=None,
    redoc_url=None
)

@app.get("/", include_in_schema=False)
def redoc():
    """Return the redoc documentation page."""
    return get_redoc_html(
        openapi_url="/openapi.json",
        title="jewl.app",
        redoc_favicon_url="https://jewl.app/favicon-32x32.png"
    )

@app.post("/v1/infer")
def run_inference():
    """Run inference on a sample using a trained model."""
    return {"Hello": "World"}


def main(args):
    """The entrypoint of the api module."""
    log_level = "trace" if args.verbose else "info"
    port = 2000 if args.port is None else args.port
    print(port)
    run(
        "api:app",
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
