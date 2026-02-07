class SymbolTable:
    """Language-agnostic variable → type mapping."""

    def __init__(self):
        self.var_types: dict[str, str] = {}

    def register(self, var_name: str, var_type: str):
        self.var_types[var_name] = var_type

    def get_type(self, var_name: str, default: str | None = None) -> str | None:
        return self.var_types.get(var_name, default)


def get_text(node, code_bytes: bytes) -> str:
    """Extract source text for a tree-sitter node."""
    return code_bytes[node.start_byte : node.end_byte].decode("utf-8")


def extract_var_name(node, code_bytes: bytes) -> str | None:
    """Recursively find the first ``identifier`` node and return its text."""
    if node.type == "identifier":
        return get_text(node, code_bytes)
    for child in node.children:
        result = extract_var_name(child, code_bytes)
        if result:
            return result
    return None
