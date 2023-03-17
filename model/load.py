from argparse import ArgumentParser
from torch import load
from torch.nn import Module
from model.spec import init_model

def load_model(path: str = None) -> Module:
    """Load a model from disk."""
    model = init_model()
    if path is not None and path != "":
        model.load_state_dict(load(path))
    return model

if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("-p", "--path", type=str, default=".tmp/model.pt")
    args = parser.parse_args()

    loaded_model = load_model(args.path)
    print(loaded_model)
