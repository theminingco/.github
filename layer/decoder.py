"""A transformer decoder module."""
from argparse import ArgumentParser
from torch import Tensor
from torch import ones, tril, ones_like, rand
from torch.nn import Module
from torch.nn import TransformerDecoder, TransformerDecoderLayer
from torch.nn.init import xavier_normal_

class Decoder(Module):
    """A transformer decoder module."""

    def __init__(self, nfeatures: int, nhid: int, nhead: int, nlayers: int, dropout: float = 0.1) -> None:
        super().__init__()
        decoder_layer = TransformerDecoderLayer(nfeatures, nhead, nhid, dropout, batch_first=True)
        self.decoder = TransformerDecoder(decoder_layer, nlayers)

        for p in self.parameters():
            if p.dim() > 1:
                xavier_normal_(p)

    def _mem(self, x: Tensor) -> Tensor:
        """Create an empty memory tensor."""
        return ones_like(x)

    def _nopeek(self, x: Tensor) -> Tensor:
        """Create a nopeek mask for tensor x."""
        size = x.size(1)
        nopeek = ones(size, size, device=x.device)
        return tril(nopeek) == 0

    def forward(self, x: Tensor) -> Tensor:
        """Propagate through the model."""
        return self.decoder(
            x,
            self._mem(x),
            tgt_mask=self._nopeek(x)
        )

if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("--nfeatures", type=int, default=256)
    parser.add_argument("--nhid", type=int, default=8)
    parser.add_argument("--nhead", type=int, default=8)
    parser.add_argument("--nlayers", type=int, default=2)
    parser.add_argument("--dropout", type=float, default=0.1)

    args = parser.parse_args()

    model = Decoder(args.nfeatures, args.nhid, args.nhead, args.nlayers, args.dropout)
    model_input = rand(32, 16, args.nfeatures)
    model_output = model(model_input)
    print(f"{model_input.size()} -> {model_output.size()}")

# MARK: TESTS

def test_model_forward() -> None:
    """Test whether a codel can be created and propagated through."""
    test_model = Decoder(nfeatures=8, nhid=8, nhead=8, nlayers=2)
    test_input = rand(32, 16, 8)
    test_output = test_model(test_input)
    assert test_input.size() == test_output.size()
