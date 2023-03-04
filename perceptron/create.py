"""This module contains all the code related loading models from file."""
from os import makedirs
from os.path import dirname
from importlib import import_module
from torch import Tensor, load, save
from torch.nn import Module

class Model(Module):
    """A generic module that contains an internal submodule."""

    def __init__(self, name: str, genesis: dict, state: dict = None) -> None:
        super().__init__()
        self.name = f"model.{name}"
        provider = import_module(self.name)
        self.genesis = provider.create_genesis(**genesis)
        self.internal = provider.create_model(**self.genesis)
        if state is not None:
            self.internal.load_state_dict(state)

    @classmethod
    def create(cls, name: str, genesis: dict, **_):
        """Create a new model."""
        return cls(name, genesis)

    @classmethod
    def load(cls, path: str, **_):
        """Load a model from a `.pt` file."""
        spec = load(path)
        return cls(spec["name"], spec["genesis"], spec["parameters"])

    def save(self, path: str) -> None:
        """Save a model to a `.pt` file."""
        makedirs(dirname(args.path), exist_ok=True)
        state = {
            "name": self.name,
            "genesis": self.genesis,
            "parameters": self.internal.state_dict()
        }
        save(state, path)

    def forward(self, *nargs, **kwargs) -> Tensor:
        """Propagate through the model."""
        return self.internal.forward(nargs, kwargs)

if __name__ == "__main__":
    from argparse import ArgumentParser

    parser = ArgumentParser()
    parser.add_argument("-p", "--path", type=str, default="tmp/model.pt")
    parser.add_argument("-n", "--name", type=str, default="fox")
    parser.add_argument("-g", "--genesis", type=dict, default={})
    args = parser.parse_args()

    model = Model.create(**vars(args))
    model.save(args.path)
    print(f"Saved {args.name} model to {args.path}")
