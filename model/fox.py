"""This module contains all the code related to the fox dnn."""
from torch.nn import Sequential, Linear, ReLU, Dropout, Softmax

def create_model(ninput, nhidden, noutput, dropout, **_) -> Sequential:
    """Create a Fox model"""
    fox_model = Sequential(
        Linear(ninput, nhidden),
        ReLU(),
        Linear(nhidden, noutput),
        Dropout(dropout),
        Softmax()
    )

    return fox_model

def create_genesis(ninput=128, nhidden=256, noutput=32, dropout=0.1, **_):
    """Create a genesis dict for the fox model"""
    return {
        "ninput": ninput,
        "nhidden": nhidden,
        "noutput": noutput,
        "dropout": dropout
    }

if __name__ == "__main__":
    from argparse import ArgumentParser
    parser = ArgumentParser()
    parser.add_argument("--ninput", type=int)
    parser.add_argument("--nhidden", type=int)
    parser.add_argument("--noutput", type=int)
    parser.add_argument("--dropout", type=float)
    args = parser.parse_args()
    genesis = create_genesis(**vars(args))
    model = create_model(**genesis)
    print(f"[None, {args.ninput}] -> [None, {args.noutput}]")
    print(model)
