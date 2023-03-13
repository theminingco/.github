"""This module contains all the code related to running an inference api."""
from argparse import ArgumentParser
from os import getenv
from os.path import exists
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordBearer
from fastapi.openapi.docs import get_redoc_html
from uvicorn import run
from torch.nn import Identity
from perceptron.create import Transformer

model_path = getenv("MODEL_PATH")
model = Identity()
if model_path is not None and exists(model_path):
    model = Transformer.load(model_path)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
api_key = getenv("AUTH_KEY")

def _api_key_auth(supplied_key: str = Depends(oauth2_scheme)) -> None:
    """Compare the supplied auth key to one specified in the env variables."""
    if hash(supplied_key) is not hash(api_key):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

app = FastAPI(
    title="jewl-ai",
    version="docs",
    docs_url=None,
    redoc_url=None
)

@app.get("/", include_in_schema=False)
def redoc() -> HTMLResponse:
    """Return the redoc documentation page."""
    return get_redoc_html(
        openapi_url="/openapi.json",
        title="⛏ The Mining Company",
        redoc_favicon_url="https://avatars.githubusercontent.com/u/118801889?s=32"
    )


def start_api(verbose: bool, watch: bool, port: int = 2000) -> None:
    """The entrypoint of the api module."""
    log_level = "trace" if verbose else "info"
    run(
        "server.api:app",
        host="0.0.0.0",
        port=port,
        log_level=log_level,
        reload=watch
    )

if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("-v", "--verbose", action="store_true")
    parser.add_argument("-w", "--watch", action="store_true")
    parser.add_argument("-p", "--port", type=int, default=2000)
    args = parser.parse_args()

    start_api(args.verbose, args.watch, args.port)
