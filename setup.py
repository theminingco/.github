"""A setuptools based setup module."""
from setuptools import setup

setup(
    name="theminingco",
    version="0.0.1",
    scripts=["tmc"],
    py_modules=[],
    install_requires=[
        "binance-connector==2.0.0",
        "python-dotenv==1.0.0",
        "pylint==2.17.2",
        "torch==2.0.0",
        "tqdm==4.65.0"
    ]
)
