"""This module contains all the code related loading models from file."""
from argparse import ArgumentParser
from os import makedirs
from os.path import dirname
from math import log
from torch import tensor, Tensor, load, save
from torch import arange, exp, sin, cos, equal
from torch import round as round_tensor
from torch import ones, triu, zeros_like, rand, zeros
from torch.nn import Module, Dropout
from torch.nn import TransformerDecoder, TransformerDecoderLayer
from torch.nn.init import xavier_normal_

class Transformer(Module):
    """A simple Transformer Decoder model."""

    def __init__(self, nfeatures: int, nhid: int, nhead: int, nlayers: int, dropout: float) -> None:
        super().__init__()

        self.positional = Positional(nfeatures, dropout)
        decoder_layer = TransformerDecoderLayer(nfeatures, nhead, nhid, dropout)
        self.decoder = TransformerDecoder(decoder_layer, nlayers)

        for p in self.parameters():
            if p.dim() > 1:
                xavier_normal_(p)

    @classmethod
    def create(cls, nfeatures=256, nhid=8, nhead=8, nlayers=2, dropout=0.1, **_):
        """Create a new model."""
        return cls(nfeatures, nhid, nhead, nlayers, dropout)

    @classmethod
    def load(cls, path: str, **_):
        """Load a model from a `.pt` file."""
        spec = load(path)
        instance = cls(**spec["parameters"])
        instance.load_state_dict(spec["state"])
        return instance

    def save(self, path: str) -> None:
        """Save a model to a `.pt` file."""
        makedirs(dirname(args.path), exist_ok=True)
        spec = {
            "parameters": self.genesis,
            "state": self.internal.state_dict()
        }
        save(spec, path)

    def _nopeek(self, x: Tensor) -> Tensor:
        nopeek = x.size()[0]
        nopeek = ones(nopeek, nopeek)
        nopeek = triu(nopeek).transpose(0, 1)
        return nopeek.masked_fill(nopeek == 0, float('-inf')).masked_fill(nopeek == 1, float(0.0))

    def forward(self, x: Tensor) -> Tensor:
        """Propagate through the model."""
        nopeek_msk = self._nopeek(x)
        msk = zeros_like(x)
        return self.decoder(x, msk, tgt_mask=nopeek_msk)

class Positional(Module):
    """Encode positional information into an a tensor."""

    def __init__(self, nfeatures: int, dropout=0.1, max_len=5000) -> None:
        super().__init__()
        self.dropout = Dropout(p=dropout)

        position = arange(max_len).unsqueeze(1)
        div_term = exp(arange(0, nfeatures, 2) * (-log(10000.0) / nfeatures))
        pe = zeros(max_len, 1, nfeatures)
        pe[:, 0, 0::2] = sin(position * div_term)
        pe[:, 0, 1::2] = cos(position * div_term)
        self.register_buffer('pe', pe)

    def forward(self, x: Tensor) -> Tensor:
        """Propagate through the model."""
        x = x + self.pe[:x.size(0)]
        return self.dropout(x)


if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("-p", "--path", type=str)
    parser.add_argument("--nfeatures", type=int, default=256)
    parser.add_argument("--nhid", type=int, default=8)
    parser.add_argument("--nhead", type=int, default=8)
    parser.add_argument("--nlayers", type=int, default=2)
    parser.add_argument("--dropout", type=float, default=0.1)

    args = parser.parse_args()

    model = Transformer.create(**vars(args))

    if args.path is not None:
        makedirs(dirname(args.path), exist_ok=True)
        model.save(args.path)
        print(f"Saved {args.name} model to {args.path}")

    model.eval()
    model_input = rand(32, 32, args.nfeatures)
    model_output = model(model_input)
    print(f"{model_input.size()} -> {model_output.size()}")


# MARK: TESTS

def test_create_model() -> None:
    """Test whether a codel can be created and propagated through."""
    test_model = Transformer.create(nfeatures=8)
    test_input = rand(32, 32, 8)
    test_output = test_model(test_input)
    assert test_input.size() == test_output.size(), f"{test_input.size()} != {test_output.size()}"

def test_positional() -> None:
    """Test whether positional embedding is generated properly."""
    test_model = Positional(1)
    test_model.eval()
    test_input = zeros(4, 1, 1)
    test_output = round_tensor(test_model(test_input).squeeze(), decimals=4)
    expected_output = round_tensor(tensor([0.0000, 0.8415, 0.9093, 0.1411]), decimals=4)
    assert equal(test_output, expected_output), f"{test_output} != {expected_output}"
