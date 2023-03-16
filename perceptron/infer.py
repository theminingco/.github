"""Inference script for the model."""
from argparse import ArgumentParser
from torch import Tensor
from torch.nn.functional import pad
from data.sticks import get_candle_sticks
from perceptron.create import Transformer

def infer(model: str, symbol: str = "BTCUSDT", interval: str = "15m", limit: int = 512) -> Tensor:
    """Run inferernce on a new sample."""
    model = Transformer.load(model)
    model.eval()
    batch = get_candle_sticks(symbol, interval, limit)
    true = batch[-1]
    inp = pad(batch[:-1], (0, 0, 0, 1))
    pred = model(inp.unsqueeze(0)).squeeze(0)[-1]
    return pred, true

if __name__ == "__main__":
    interval_choices = ["1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1M"]
    parser = ArgumentParser()
    parser.add_argument("-m", "--model", type=str, default=".tmp/model.pt")
    parser.add_argument("-s", "--symbol", type=str, default="BTCUSDT")
    parser.add_argument("-i", "--interval", type=str, choices=interval_choices, default="15m")
    parser.add_argument("-n", "--limit", type=int, default=512)
    args = parser.parse_args()

    prediction, ground_truth = infer(args.model, args.symbol, args.interval, args.limit)
    pred_perc = prediction[2] - prediction[1]
    true_perc = ground_truth[2] - ground_truth[1]
    print(f"{pred_perc:.2%} vs {true_perc:.2%}")
