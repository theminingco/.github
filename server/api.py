"""This module contains all the code related to running an inference api."""
from os import getenv
from typing import List
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordBearer
from fastapi.openapi.docs import get_redoc_html
from uvicorn import run
from data.feature import get_features
from perceptron.create import Transformer

model_path = getenv("MODEL_PATH")
model = None if model_path is None else Transformer.load(model_path)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def api_key_auth(supplied: str = Depends(oauth2_scheme)) -> None:
    """Compare the supplied auth key to one specified in the env variables."""
    required = getenv("AUTH_KEY")
    if hash(supplied) is not hash(required):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Forbidden")

app = FastAPI(
    title="jewl-ai",
    version="docs",
    docs_url=None,
    redoc_url=None
)

@app.get("/", include_in_schema=False, dependencies=[Depends(api_key_auth)])
def redoc() -> HTMLResponse:
    """Return the redoc documentation page."""
    return get_redoc_html(
        openapi_url="/openapi.json",
        title="⛏ The Mining Company",
        redoc_favicon_url="https://⛏ The Mining Company/favicon-32x32.png"
    )

@app.get("/v1/address/{chain}/{address}", dependencies=[Depends(api_key_auth)])
@app.get("/v1/transaction/{chain}/{transaction}", dependencies=[Depends(api_key_auth)])
def get_risk_profile(chain: str, address: str | None, transaction: str | None) -> List[float]:
    """Run inference on a sample using a trained model."""
    features = get_features(chain, address, transaction)
    prediction = model(features)[0]
    return prediction.numpy()


def start_api(verbose: bool, port: int | None, watch: bool) -> None:
    """The entrypoint of the api module."""
    log_level = "trace" if verbose else "info"
    port = int(getenv("PORT"))
    port = 2000 if port is None else port
    run(
        "server.api:app",
        host="0.0.0.0",
        port=port,
        log_level=log_level,
        reload=watch
    )

if __name__ == "__main__":
    from argparse import ArgumentParser

    parser = ArgumentParser()
    parser.add_argument("-v", "--verbose", action="store_true")
    parser.add_argument("-w", "--watch", action="store_true")
    args = parser.parse_args()

    start_api(**vars(args))
