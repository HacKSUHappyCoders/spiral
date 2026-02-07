import argparse
import os
import sys

from tree_sitter import Parser

from .registry import get_language, supported_extensions

# Import languages so they register themselves.
from . import languages  # noqa: F401


def main():
    ap = argparse.ArgumentParser(description="Instrument source code for tracing.")
    ap.add_argument("input_file", help="Path to the source file")
    ap.add_argument("-o", "--output", help="Path to the output file")
    args = ap.parse_args()

    if not os.path.exists(args.input_file):
        print(f"Error: '{args.input_file}' not found.")
        sys.exit(1)

    ext = os.path.splitext(args.input_file)[1]
    lang = get_language(ext)
    if not lang:
        exts = ", ".join(sorted(supported_extensions()))
        print(f"Error: unsupported extension '{ext}'. Supported: {exts}")
        sys.exit(1)

    with open(args.input_file, "rb") as f:
        code_bytes = f.read()

    ts_parser = Parser()
    ts_parser.language = lang.get_ts_language()

    symbol_table = lang.analyze_types(ts_parser, code_bytes)
    metadata = lang.collect_metadata(ts_parser, code_bytes, args.input_file)
    result = lang.instrument(ts_parser, code_bytes, symbol_table, metadata)

    output_path = args.output or "instrumented_" + os.path.basename(args.input_file)
    with open(output_path, "w") as f:
        f.write(result)

    print(f"Instrumented code written to {output_path}")


if __name__ == "__main__":
    main()
