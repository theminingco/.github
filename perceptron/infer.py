"""This module contains all the code related to running inference with a model."""
from torch import Tensor
from data.feature import get_features
from perceptron.create import Transformer

def infer(chain: str, model: str, address: str = None, transaction: str = None, **_) -> Tensor:
    """Run inferernce on a new sample."""
    assert address is not None or transaction is not None, "one of `address` and `transaction` should be provided."
    model = Transformer.load(model)
    model.eval()
    features = get_features(chain, address, transaction)
    return model(features)[0]

if __name__ == "__main__":
    from argparse import ArgumentParser

    parser = ArgumentParser()
    parser.add_argument("-c", "--chain", type=str, default="btc")
    parser.add_argument("-a", "--address", type=int, default="13AM4VW2dhxYgXeQepoHkHSQuy6NgaEb94")
    parser.add_argument("-t", "--transaction", type=int, default=None)
    parser.add_argument("-m", "--model", type=str, default=".tmp/model.pt")
    args = parser.parse_args()

    prediction = infer(**vars(args))
    print(prediction.numpy())
