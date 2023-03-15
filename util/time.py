"""Time-related utility functions."""
from argparse import ArgumentParser
from datetime import timedelta

seconds_per_unit = { "s": 1, "m": 60, "h": 3600, "d": 86400, "w": 604800, "M": 2592000 }

def parse_time(time: str) -> timedelta:
    """Parse a time string into a timedelta object."""
    if time is None:
        return timedelta()
    if isinstance(time, int) or time.isdigit():
        return timedelta(seconds=int(time))
    unit = time[-1]
    number = time[:-1]
    if not number.isdigit():
        raise ValueError(f"Invalid number: {number}")
    if unit not in seconds_per_unit:
        raise ValueError(f"Invalid time unit: {unit}")
    return timedelta(seconds=int(number) * seconds_per_unit[unit])

if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("input", type=str, default="5m", nargs="?")
    args = parser.parse_args()

    parsed = parse_time(args.input)
    print(parsed)

# MARK: - Tests

def test_seconds() -> None:
    """Test the parse_time function with seconds."""
    assert parse_time("5s") == timedelta(seconds=5)

def test_minutes() -> None:
    """Test the parse_time function with minutes."""
    assert parse_time("5m") == timedelta(minutes=5)

def test_hours() -> None:
    """Test the parse_time function with hours."""
    assert parse_time("5h") == timedelta(hours=5)

def test_days() -> None:
    """Test the parse_time function with days."""
    assert parse_time("5d") == timedelta(days=5)

def test_weeks() -> None:
    """Test the parse_time function with weeks."""
    assert parse_time("5w") == timedelta(weeks=5)

def test_months() -> None:
    """Test the parse_time function with months."""
    assert parse_time("5M") == timedelta(days=5 * 30)

def test_without_unit() -> None:
    """Test the parse_time function without specifier."""
    assert parse_time("5") == timedelta(seconds=5)

def test_integer() -> None:
    """Test the parse_time function with an integer."""
    assert parse_time(5) == timedelta(seconds=5)

def test_zero() -> None:
    """Test the parse_time function with zero."""
    assert parse_time("0") == timedelta()

def test_none() -> None:
    """Test the parse_time function with None."""
    assert parse_time(None) == timedelta()

def test_invalid_unit() -> None:
    """Test the parse_time function with an invalid unit."""
    try:
        parse_time("5z")
        assert False, "Expected ValueError"
    except ValueError:
        pass

def test_invalid_double_unit() -> None:
    """Test the parse_time function with an invalid double unit."""
    try:
        parse_time("5ss")
        assert False, "Expected ValueError"
    except ValueError:
        pass

def test_invalid_number() -> None:
    """Test the parse_time function with an invalid number."""
    try:
        parse_time("z5s")
        assert False, "Expected ValueError"
    except ValueError:
        pass
