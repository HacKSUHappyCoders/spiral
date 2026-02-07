.PHONY: make

parse:
	uv run parser.py tests/00003.c
	gcc instrumented_00003.c -o exe
	./exe > Untitled-2.txt

normalize:
	./exe | uv run normalize.py > Untitled-3.txt