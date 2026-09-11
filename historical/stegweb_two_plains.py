#!/usr/bin/env python3
"""
steg.web — Two Plains reference implementation

Cipher system: Lily of Ashwood, 2026
Profile preserved: Two Plains / Corridor Lamp

Selected carrier letters are mapped from ASCII Latin to Mathematical
Sans-Serif Regular. Unselected text remains unchanged.
"""

from __future__ import annotations

import argparse
import json
import string
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


ASCII_UPPER = ord("A")
ASCII_LOWER = ord("a")
SS_REG_UPPER = 0x1D5A0
SS_REG_LOWER = 0x1D5BA


@dataclass(frozen=True)
class DecodeResult:
    plaintext: str
    secret: str

    def to_dict(self) -> dict[str, str]:
        return {"plaintext": self.plaintext, "secret": self.secret}


def _to_font(char: str, upper_base: int, lower_base: int) -> str:
    if char in string.ascii_uppercase:
        return chr(upper_base + ord(char) - ASCII_UPPER)
    if char in string.ascii_lowercase:
        return chr(lower_base + ord(char) - ASCII_LOWER)
    return char


def _from_font(char: str, upper_base: int, lower_base: int) -> str | None:
    cp = ord(char)
    if upper_base <= cp < upper_base + 26:
        return chr(ASCII_UPPER + cp - upper_base)
    if lower_base <= cp < lower_base + 26:
        return chr(ASCII_LOWER + cp - lower_base)
    return None


def normalize_payload(payload: str) -> str:
    normalized = "".join(c for c in payload if not c.isspace())
    invalid = [c for c in normalized if c not in string.ascii_letters]
    if invalid:
        rendered = ", ".join(repr(c) for c in invalid)
        raise ValueError(f"Payload contains unsupported characters: {rendered}")
    return normalized


def find_letter_positions(
    carrier_text: str,
    payload: str,
    *,
    case_sensitive: bool = False,
) -> list[int]:
    """Find payload letters as an ordered subsequence of carrier_text."""
    normalized = normalize_payload(payload)
    positions: list[int] = []
    search_from = 0

    for target in normalized:
        target_cmp = target if case_sensitive else target.lower()

        for index in range(search_from, len(carrier_text)):
            candidate = carrier_text[index]
            candidate_cmp = candidate if case_sensitive else candidate.lower()

            if candidate_cmp == target_cmp:
                positions.append(index)
                search_from = index + 1
                break
        else:
            raise ValueError(
                f"Carrier cannot host payload: no {target!r} found after "
                f"character index {search_from - 1}."
            )

    return positions


def encode_at_positions(carrier_text: str, positions: Iterable[int]) -> str:
    selected = set(positions)
    if any(index < 0 or index >= len(carrier_text) for index in selected):
        raise IndexError("At least one payload position is outside the carrier.")

    return "".join(
        _to_font(char, SS_REG_UPPER, SS_REG_LOWER)
        if index in selected
        else char
        for index, char in enumerate(carrier_text)
    )


def encode(carrier_text: str, payload: str) -> tuple[str, list[int]]:
    positions = find_letter_positions(carrier_text, payload)
    return encode_at_positions(carrier_text, positions), positions


def decode(encoded_text: str) -> DecodeResult:
    plaintext: list[str] = []
    secret: list[str] = []

    for char in encoded_text:
        decoded = _from_font(char, SS_REG_UPPER, SS_REG_LOWER)
        if decoded is None:
            plaintext.append(char)
        else:
            plaintext.append(decoded)
            secret.append(decoded)

    return DecodeResult("".join(plaintext), "".join(secret))


def validate(carrier_text: str, payload: str, encoded_text: str) -> dict[str, object]:
    result = decode(encoded_text)
    expected_secret = normalize_payload(payload)

    checks = {
        "plaintext_round_trip": result.plaintext == carrier_text,
        "secret_round_trip_casefolded": (
            result.secret.casefold() == expected_secret.casefold()
        ),
        "length_preserved": len(encoded_text) == len(carrier_text),
    }

    return {
        "valid": all(checks.values()),
        "checks": checks,
        "decoded": result.to_dict(),
        "expected_secret": expected_secret,
    }


EXAMPLE_PAYLOAD = "thedoorremembers"
EXAMPLE_CARRIER = (
    "At the end of the corridor, Mara found a lamp burning in an empty office. "
    "The building had been closed for years, yet the bulb gave off a patient "
    "amber light. On the desk lay a maintenance ledger with one fresh line: "
    "Please return what the walls remembered. She read it twice before the "
    "radiator clicked behind her."
)


def _read_text(value: str | None, file_path: str | None) -> str:
    if value is not None:
        return value
    if file_path is not None:
        return Path(file_path).read_text(encoding="utf-8")
    raise ValueError("Provide inline text or a UTF-8 text file.")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Encode and decode steg.web Two Plains text."
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    encode_parser = subparsers.add_parser("encode")
    encode_group = encode_parser.add_mutually_exclusive_group(required=True)
    encode_group.add_argument("--carrier")
    encode_group.add_argument("--carrier-file")
    encode_parser.add_argument("--payload", required=True)

    decode_parser = subparsers.add_parser("decode")
    decode_group = decode_parser.add_mutually_exclusive_group(required=True)
    decode_group.add_argument("--text")
    decode_group.add_argument("--text-file")

    subparsers.add_parser("demo")
    return parser


def main() -> int:
    args = build_parser().parse_args()

    if args.command == "encode":
        carrier = _read_text(args.carrier, args.carrier_file)
        encoded, positions = encode(carrier, args.payload)
        report = validate(carrier, args.payload, encoded)
        print(encoded)
        print(json.dumps({"positions": positions, **report}, indent=2))
        return 0 if report["valid"] else 1

    if args.command == "decode":
        encoded = _read_text(args.text, args.text_file)
        print(json.dumps(decode(encoded).to_dict(), ensure_ascii=False, indent=2))
        return 0

    encoded, positions = encode(EXAMPLE_CARRIER, EXAMPLE_PAYLOAD)
    report = validate(EXAMPLE_CARRIER, EXAMPLE_PAYLOAD, encoded)
    print(encoded)
    print()
    print(json.dumps({"positions": positions, **report}, ensure_ascii=False, indent=2))
    return 0 if report["valid"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
