"""This module contains all the code related to running inference with a model."""
from argparse import ArgumentParser
from torch import Tensor
from perceptron.create import Transformer

def infer(model: str, address: str = None, transaction: str = None, **_) -> Tensor:
    """Run inferernce on a new sample."""
    assert address is not None or transaction is not None, "one of `address` and `transaction` should be provided."
    model = Transformer.load(model)
    model.eval()
    return model([])[0]

if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("-a", "--address", type=int, default="13AM4VW2dhxYgXeQepoHkHSQuy6NgaEb94")
    parser.add_argument("-t", "--transaction", type=int, default=None)
    parser.add_argument("-m", "--model", type=str, default=".tmp/model.pt")
    args = parser.parse_args()

    prediction = infer(**vars(args))
    print(prediction.numpy())
