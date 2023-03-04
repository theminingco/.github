"""This module contains all the code related getting features."""
from importlib import import_module

# min/max/std/avg/count of input transaction amount
# min/max/std/avg/count of ouptut transaction amount
# min/max/std/avg of time between input transactions
# min/max/std/avg of time between output transactions

# The life period of the address
# active period of the address


def get_features(chain: str, address: str = None, transaction: str = None, **_) -> None:
    """This function fetches the provider for a chain and gets the features for an address or transaction from that provider."""
    assert address is not None or transaction is not None, "one of `address` and `transaction` should be provided."
    provider = import_module(f"provider.{chain}")
    return provider.get_features(address, transaction)

if __name__ == "__main__":
    from argparse import ArgumentParser
    parser = ArgumentParser()
    parser.add_argument("-c", "--chain", type=str, default="btc")
    parser.add_argument("-a", "--address", type=int, default="13AM4VW2dhxYgXeQepoHkHSQuy6NgaEb94")
    parser.add_argument("-t", "--transaction", type=int, default=None)
    args = parser.parse_args()
    get_features(**vars(args))
