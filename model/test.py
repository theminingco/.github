"""The test module of the perceptron package."""
from argparse import ArgumentParser
from torch import Tensor, no_grad, sqrt, tensor, float32
from tqdm import tqdm
from data.prepare import DataFrame
from model.load import load_model
from model.spec import init_loss

def evaluate_model(path: str, batch_size: int, dataset: str) -> Tensor:
    """The entrypoint of the test module."""
    data = DataFrame(dataset, batch_size, False)

    model = load_model(path)
    model.eval()
    loss = init_loss()

    total_loss = tensor(0, dtype=float32)
    steps = len(data.loader)
    progress_bar = tqdm(range(steps), leave=False)
    with no_grad():
        for _ in progress_bar:
            batch = next(data)
            pred = model(batch[0])
            total_loss += loss(pred, batch[1])

    return total_loss / steps

if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("-m", "--model", type=str, default=".tmp/model.pt")
    parser.add_argument("-b", "--batch-size", type=int, default=128)
    parser.add_argument("-d", "--dataset", type=str, default=".tmp/data/tst")
    args = parser.parse_args()

    avg_loss = evaluate_model(args.model, args.batch_size, args.dataset)
    print(f"SE: {sqrt(avg_loss):.2%}")