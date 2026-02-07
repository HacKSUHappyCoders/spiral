from abc import ABC, abstractmethod

from .core import SymbolTable


class LanguageSupport(ABC):
    """Contract that every language backend must implement.

    To add a new language:
      1. Create ``languages/<lang>.py``
      2. Subclass ``LanguageSupport``
      3. Decorate with ``@register``
      4. Import it in ``languages/__init__.py``
    """

    name: str
    extensions: frozenset[str]

    @abstractmethod
    def get_ts_language(self):
        """Return the tree-sitter ``Language`` object."""

    @abstractmethod
    def analyze_types(self, ts_parser, code_bytes) -> SymbolTable:
        """Walk the AST and build a symbol table of variable types."""

    @abstractmethod
    def collect_metadata(self, ts_parser, code_bytes, source_file) -> dict:
        """Return a dict of metadata about the source file."""

    @abstractmethod
    def instrument(self, ts_parser, code_bytes, symbol_table, metadata) -> str:
        """Return the instrumented source code as a string."""
