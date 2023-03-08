"""This module contains all the code related loading models from file."""
from os import makedirs
from os.path import dirname
from math import log
from torch import load, save, zeros, arange, exp, sin, cos, float32
from torch.nn import Module, Linear, Dropout
from torch.nn import TransformerEncoder, TransformerEncoderLayer
from torch.nn import TransformerDecoder, TransformerDecoderLayer
from torch.nn.init import xavier_normal_

class Transformer(Module):
    """A simple Transformer AutoEncoder model."""

    def __init__(self, nembed: int, nhid: int, nhead: int, nlayers: int, dropout: float):
        super().__init__()

        self.positional = Positional(nembed, dropout)
        encoder_layer = TransformerEncoderLayer(nembed, nhead, nhid, dropout)
        self.encoder = TransformerEncoder(encoder_layer, nlayers)
        decoder_layer = TransformerDecoderLayer(nembed, nhead, nhid, dropout)
        self.decoder = TransformerDecoder(decoder_layer, nlayers)
        self.linear = Linear(nembed, 1)

        for p in self.parameters():
            if p.dim() > 1:
                xavier_normal_(p)

    @classmethod
    def create(cls, nembed=256, nhid=8, nhead=8, nlayers=2, dropout=0.1, **_):
        """Create a new model."""
        return cls(nembed, nhid, nhead, nlayers, dropout)


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

    def encode(self, src, scr_msk):
        """Propagate through the encoder."""
        src = self.positional(src)
        src = self.encoder(src, src_key_padding_mask=scr_msk)
        return src

    def decode(self, tgt, tgt_msk, nopeek_msk, mem, mem_msk):
        """Propagate through the decoder."""
        tgt = self.positional(tgt)
        tgt = self.decoder(tgt, mem, tgt_mask=nopeek_msk, tgt_key_padding_mask=tgt_msk, memory_key_padding_mask=mem_msk)
        return tgt

    def forward(self, src, src_msk, tgt, tgt_msk, nopeek_msk):
        """Propagate through the model."""
        enc = self.encode(src, src_msk)
        dec = self.decode(tgt, tgt_msk, nopeek_msk, enc, src_msk)
        return self.linear(dec)

class Positional(Module):
    """Encode positional information into an a tensor."""

    def __init__(self, nhid, dropout=0.1, max_len=5000):
        super().__init__()
        self.dropout = Dropout(p=dropout)

        pe = zeros(max_len, nhid)
        position = arange(0, max_len, dtype=float32).unsqueeze(1)
        div_term = exp(arange(0, nhid, 2).float() * (-log(10000.0) / nhid))
        pe[:, 0::2] = sin(position * div_term)
        pe[:, 1::2] = cos(position * div_term)
        pe = pe.unsqueeze(0).transpose(0, 1)
        self.register_buffer('pe', pe)
        self.factor = nhid

    def forward(self, inp):
        """Propagate through the model."""
        oup = inp * self.factor + self.pe[:inp.size(0), :]
        return self.dropout(oup)


if __name__ == "__main__":
    from argparse import ArgumentParser
    from torch import rand

    parser = ArgumentParser()
    parser.add_argument("-p", "--path", type=str)
    parser.add_argument("--nembed", type=int, default=256)
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
    model_input = rand([32, args.nembed])
    model_output = model(model_input)
    print(f"{model_input.size()} -> {model_output.size()}")


# MARK: TESTS

def test_create_model():
    """Test whether a codel can be created and propagated through."""
    test_model = Transformer.create()
    test_input = rand(64, 640)
    test_output = test_model(input)
    assert test_input.size() == test_output.size(), f"{test_input.size()} != {test_output.size()}"
