INPUT  ?= tests/00001.c
OUTPUT := instrumented_$(notdir $(INPUT))

.PHONY: all clean

make:
	@echo "Targets:"
	@echo "all   - Instrument the input C file, compile, and run to generate trace_output.txt"
	@echo "clean - Remove generated files"

all: $(OUTPUT)
	gcc $(OUTPUT) -o exe
	./exe > trace_output.txt

$(OUTPUT): $(INPUT)
	uv run python -m tracer $< -o $@

clean:
	rm -f instrumented_*.c exe trace_output.txt
