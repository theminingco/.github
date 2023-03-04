"""This module contains the btc feature provider."""

def get_features(address: str = None, transaction: str = None) -> None:
    """Get features for an address or transaction on the btc chain."""
    assert address is not None or transaction is not None, "one of `address` and `transaction` should be provided."
    print("a")


if __name__ == "__main__":
    from argparse import ArgumentParser

    parser = ArgumentParser()
    parser.add_argument("-a", "--address", type=int, default="13AM4VW2dhxYgXeQepoHkHSQuy6NgaEb94")
    parser.add_argument("-t", "--transaction", type=int, default=None)
    args = parser.parse_args()

    get_features(**vars(args))
