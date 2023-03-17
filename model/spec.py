from argparse import ArgumentParser
from os import getenv
from torch.nn import Module, Identity, Sequential, MSELoss
from torch.optim import Optimizer, Adam
from layer.decoder import Decoder
from layer.positional import Positional

_name = getenv("MODEL", "fox").lower()

def init_model() -> Module:
    """Create a new model."""
    if _name == "fox":
        return Sequential(Positional(8), Decoder(8, 512, 8, 8))
    return Identity()

def init_loss() -> Module:
    """Create a new loss function."""
    if _name == "fox":
        return MSELoss()
    return Identity()

def init_optimizer(model: Module) -> Optimizer:
    """Create a new optimizer."""
    if _name == "fox":
        return Adam(model.parameters(), lr=1e-3)
    return Identity()

if __name__ == "__main__":
    parser = ArgumentParser()
    args = parser.parse_args()

    print(f"Model: {_name}")
