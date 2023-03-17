from argparse import ArgumentParser
from math import log
from torch import tensor, Tensor
from torch import arange, exp, sin, cos, equal, zeros, rand
from torch import round as round_tensor
from torch.nn import Module, Dropout

class Positional(Module):
    """Encode positional information into an a tensor."""

    def __init__(self, nfeatures: int, dropout: float = 0.1, max_len: int = 4096) -> None:
        super().__init__()
        self.dropout = Dropout(p=dropout)

        position = arange(max_len).unsqueeze(1)
        div_term = exp(arange(0, nfeatures, 2) * (-log(10000.0) / nfeatures))
        pe = zeros(max_len, nfeatures)
        pe[:, 0::2] = sin(position * div_term)
        pe[:, 1::2] = cos(position * div_term)
        self.register_buffer('pe', pe)

    def forward(self, x: Tensor) -> Tensor:
        """Propagate through the model."""
        x = x + self.pe[:x.size(1)]
        return self.dropout(x)

if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("--nfeatures", type=int, default=256)
    parser.add_argument("--dropout", type=float, default=0.1)
    args = parser.parse_args()

    model = Positional(args.nfeatures, args.dropout)
    model_input = rand(32, 16, args.nfeatures)
    model_output = model(model_input)
    print(f"{model_input.size()} -> {model_output.size()}")

# MARK: - Tests

def test_positional_layer() -> None:
    """Test whether positional embedding is generated properly."""
    test_model = Positional(1)
    test_model.eval()
    test_input = zeros(1, 4, 1)
    test_output = round_tensor(test_model(test_input).squeeze(), decimals=4)
    expected_output = round_tensor(tensor([0.0000, 0.8415, 0.9093, 0.1411]), decimals=4)
    assert equal(test_output, expected_output)
