"""A module for hashing strings."""
from argparse import ArgumentParser
from zlib import crc32

def cyclic_redundancy_check(data: str) -> float:
    """The entrypoint of the hash module."""
    data = data.encode("utf8")
    digest = crc32(data) & 0xffffffff
    return float(digest) / 2**32

if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("input", type=str, default="this_is_a_sample_str", nargs="?")
    args = parser.parse_args()

    hashed = cyclic_redundancy_check(args.input)
    print(f"\"{args.input}\" -> {hashed}")

# MARK: - Tests

def test_sample_string() -> None:
    """Test the cyclic_redundancy_check function."""
    assert cyclic_redundancy_check("this_is_a_sample_str") == 0.7228845162317157

def test_space_string() -> None:
    """Test the cyclic_redundancy_check function with spaces."""
    assert cyclic_redundancy_check("           ") == 0.9004537472501397

def test_symbols_string() -> None:
    """Test the cyclic_redundancy_check function with symbols."""
    assert cyclic_redundancy_check("0-01-aw\\]`oijia") == 0.8126492546871305

def test_long_string() -> None:
    """Test the cyclic_redundancy_check function with a long string."""
    assert cyclic_redundancy_check("this_is_a_sample_str" * 100) == 0.18811320699751377

def test_empty_string() -> None:
    """Test the cyclic_redundancy_check function with an empty string."""
    assert cyclic_redundancy_check("") == 0.0
