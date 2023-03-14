"""This module contains all the code related to finding the most efficient torch device."""
from argparse import ArgumentParser
from torch import device
from torch.cuda import is_available as has_cuda
from torch.backends.cudnn import is_available as has_cudnn
from torch.backends.mps import is_available as has_metal
from torch.backends.mkl import is_available as has_mkl
from torch.backends.mkldnn import is_available as has_mkldnn
from torch.backends.openmp import is_available as has_openmp
from torch.backends.opt_einsum import is_available as has_opt_einsum

def best_device() -> str:
    """The entrypoint of the device module."""
    if has_cuda():
        return "cuda"
    if has_cudnn():
        return "cudnn"
    if has_metal():
        return "mps"
    if has_mkl():
        return "mkl"
    if has_mkldnn():
        return "mkldnn"
    if has_openmp():
        return "openmp"
    if has_opt_einsum():
        return "opt_einsum"
    return "cpu"

if __name__ == "__main__":
    parser = ArgumentParser()
    args = parser.parse_args()

    d = device(best_device())
    print(d)

def test_best_device():
    """Test the best_device function."""
    assert best_device() in ["cuda", "cudnn", "mps", "mkl", "mkldnn", "openmp", "opt_einsum", "cpu"]
