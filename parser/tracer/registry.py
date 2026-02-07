from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .base import LanguageSupport

_languages: dict[str, LanguageSupport] = {}


def register(cls):
    """Class decorator — registers a LanguageSupport subclass by its extensions."""
    instance = cls()
    for ext in instance.extensions:
        _languages[ext] = instance
    return cls


def get_language(extension: str) -> LanguageSupport | None:
    return _languages.get(extension)


def supported_extensions() -> set[str]:
    return set(_languages.keys())
