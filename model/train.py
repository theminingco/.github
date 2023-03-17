"""The training module of the perceptron."""
from argparse import ArgumentParser
from time import time
from functools import partial
from torch import device, tensor, Tensor, float32, no_grad
from torch.nn import MSELoss, Module
from torch.nn.utils import clip_grad_norm_
from torch.optim import Optimizer
from torch.optim.lr_scheduler import ReduceLROnPlateau
from torch.utils.data import Dataset
from tqdm import tqdm
from data.prepare import DataFrame
from model.load import load_model
from model.spec import init_loss, init_optimizer
from util.device import best_device

def _trn_step(model: Module, optimizer: Optimizer, loss: MSELoss, batch: Tensor) -> Tensor:
    """Run a single training steps."""
    optimizer.zero_grad()
    pred = model(batch[0])
    loss_value = loss(pred, batch[1])
    loss_value.backward()
    clip_grad_norm_(model.parameters(), 0.5)
    optimizer.step()
    return loss_value

def _val_step(model: Module, loss: MSELoss, batch: Tensor) -> Tensor:
    """Run a single validation steps."""
    with no_grad():
        pred = model(batch[0])
        loss_value = loss(pred, batch[1])
    return loss_value

def _run_steps(model: Module, steps: int, data: Dataset, optimizer: Optimizer, loss: MSELoss, train: bool, d: str) -> Tensor:
    """Run a bunch of training or validation steps."""
    specifier_func = model.train if train else model.eval
    specifier_func()
    step_func = partial(_trn_step, model, optimizer, loss) if train else partial(_val_step, model, loss)
    desc = "Training" if train else "Validating"
    total_loss = tensor(0, device=d, dtype=float32)
    progress_bar = tqdm(range(steps), desc=desc, leave=False)
    for k in progress_bar:
        total_loss += step_func(next(data))
        average_loss = total_loss / (k+1)
        params = { "loss": f"{average_loss:.3g}" }
        progress_bar.set_postfix(params)
    return average_loss

def train_model(path: str, iterations: int, batch_size: int, trn_dataset: str, val_dataset: str) -> None:
    """The entrypoint of the train module."""
    d = device(best_device())
    print(f"Training model on {d}")

    trn_data = DataFrame(trn_dataset, batch_size, True, d)
    val_data = DataFrame(val_dataset, batch_size, True, d)

    checkpoints = max(10, iterations // 100)
    trn_steps = iterations // checkpoints
    val_steps = max(trn_steps // 10, 1)

    model = load_model(path).to(d)
    loss = init_loss().to(d)
    optimizer = init_optimizer(model)
    scheduler = ReduceLROnPlateau(optimizer, patience=1)

    for n in range(checkpoints):
        start_time = time()
        lr = optimizer.param_groups[0]["lr"]
        print(f"Checkpoint {n+1}/{checkpoints} [lr: {lr:.1g}]")
        trn_loss = _run_steps(model, trn_steps, trn_data, optimizer, loss, True, d)
        val_loss = _run_steps(model, val_steps, val_data, optimizer, loss, False, d)
        model.save(path)
        scheduler.step(val_loss)
        elapsed_time = int(time() - start_time)
        print(f"Checkpoint completed in {elapsed_time}s [loss: {val_loss:.3g}, delta: {abs(trn_loss - val_loss):.3g}]")

if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("-m", "--model", type=str, default=".tmp/model.pt")
    parser.add_argument("-n", "--iterations", type=int, default=8192)
    parser.add_argument("-b", "--batch-size", type=int, default=128)
    parser.add_argument("--trn-dataset", type=str, default=".tmp/data/trn")
    parser.add_argument("--val-dataset", type=str, default=".tmp/data/val")
    args = parser.parse_args()

    train_model(args.model, args.iterations, args.batch_size, args.trn_dataset, args.val_dataset)
