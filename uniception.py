#!/usr/bin/env python3
"""
Uniception – a terminal‑based tool for hiding and revealing messages in plain sight.

This script takes your ordinary text, converts it into a series of numbers using
different bases (base16, base8, base4 or base2), and then maps those digits
onto an alphabet of invisible Unicode characters such as zero‑width spaces and
word joiners. The resulting string is sandwiched between three word joiners
acting as a boundary and a visible prefix of your choice. To the casual eye
nothing appears out of the ordinary, yet the message lives on in the gaps.

It also allows you to decode such messages, provided you know which cipher
was used. Messages are converted and reconstructed via UTF‑8 bytes, ensuring
support for a wide range of characters and emoji. There are no external
dependencies – everything is contained in this file. Sarcastic commentary
included at no extra charge.
"""

import math
import sys
from typing import Dict, List, Tuple


# Mapping from cipher names to their invisible alphabets. The user sees
# descriptive names; under the hood we convert these U+ codes to real
# characters. The order of the list corresponds to digit values 0 through
# base‑1.
cipher_codepoints: Dict[str, List[str]] = {
    "Hex Whisper (base16)": [
        "U+200B",
        "U+200C",
        "U+200D",
        "U+2060",
        "U+2009",
        "U+200A",
        "U+202F",
        "U+205F",
        "U+2061",
        "U+2062",
        "U+2063",
        "U+2064",
        "U+2002",
        "U+2004",
        "U+2005",
        "U+2006",
    ],
    "Octal Poetry (base8)": [
        "U+200B",
        "U+200C",
        "U+200D",
        "U+2060",
        "U+2009",
        "U+200A",
        "U+202F",
        "U+205F",
    ],
    "Quaternary Verse (base4)": [
        "U+200B",
        "U+200C",
        "U+200D",
        "U+2060",
    ],
    "Binary Breath (base2)": [
        "U+200B",
        "U+200C",
    ],
}


def build_cipher_maps() -> Dict[str, List[str]]:
    """Convert the U+XXXX code strings into actual Unicode characters."""
    cipher_maps: Dict[str, List[str]] = {}
    for name, codes in cipher_codepoints.items():
        mapping: List[str] = []
        for code in codes:
            # remove 'U+' prefix and parse as hex
            hex_value = code[2:]
            mapping.append(chr(int(hex_value, 16)))
        cipher_maps[name] = mapping
    return cipher_maps


# Precompute the actual character mappings for each cipher name.
cipher_maps = build_cipher_maps()

# The boundary marker is three occurrences of U+2060 (WORD JOINER).
boundary_char = chr(0x2060)
BOUNDARY = boundary_char * 3


def digits_per_byte(base: int) -> int:
    """Determine how many digits are required to encode one byte in a given base.

    For example, base16 (hex) requires 2 digits per byte, base8 requires 3,
    base4 requires 4 and base2 requires 8. We compute this by taking the
    ceiling of 8 divided by the log2 of the base.
    """
    return int(math.ceil(8 / math.log2(base)))


def to_base_digits(number: int, base: int, width: int) -> List[int]:
    """Convert an integer to a list of digits in the specified base.

    The resulting list is padded on the left with zeros so that its length is
    exactly `width`. This function is used for encoding bytes, where each
    byte (0–255) becomes a fixed‑width list of digits.
    """
    digits: List[int] = [0] * width
    idx = width - 1
    n = number
    while n > 0 and idx >= 0:
        digits[idx] = n % base
        n //= base
        idx -= 1
    return digits


def encode_bytes(data: bytes, cipher_name: str) -> str:
    """Encode a bytes object into a string of invisible characters.

    The given cipher determines both the base and the alphabet used for
    representing digits. Each byte is converted to a fixed number of base‑N
    digits and then mapped to the corresponding invisible characters.
    """
    mapping = cipher_maps[cipher_name]
    base = len(mapping)
    width = digits_per_byte(base)
    encoded_chars: List[str] = []
    for byte in data:
        digits = to_base_digits(byte, base, width)
        for d in digits:
            encoded_chars.append(mapping[d])
    return "".join(encoded_chars)


def decode_to_bytes(encoded: str, cipher_name: str) -> bytes:
    """Decode a string of invisible characters back into bytes.

    This performs the reverse of `encode_bytes`: characters are mapped to
    digit values, grouped into chunks corresponding to the number of digits per
    byte, then converted back to integers and assembled into a bytes object.
    """
    mapping = cipher_maps[cipher_name]
    base = len(mapping)
    width = digits_per_byte(base)
    # Build a lookup table for performance
    lookup: Dict[str, int] = {char: idx for idx, char in enumerate(mapping)}
    digits: List[int] = []
    for ch in encoded:
        if ch not in lookup:
            raise ValueError(
                f"Unexpected character {repr(ch)} encountered during decoding with cipher '{cipher_name}'."
            )
        digits.append(lookup[ch])
    if len(digits) % width != 0:
        raise ValueError(
            "Encoded data length is not divisible by the expected digits per byte."
        )
    result_bytes = bytearray()
    for i in range(0, len(digits), width):
        value = 0
        for d in digits[i : i + width]:
            value = value * base + d
        result_bytes.append(value)
    return bytes(result_bytes)


def parse_encoded_message(message: str) -> Tuple[str, str, str]:
    """Extract the prefix, encoded portion, and suffix from a full encoded message.

    Messages follow the structure:
        [visible prefix][BOUNDARY][encoded data][BOUNDARY]

    If the format is invalid, an exception is raised. The function returns a
    tuple `(prefix, encoded_data, suffix)` where `suffix` contains any
    characters that follow the second boundary (though typically nothing)."""
    if not message:
        raise ValueError("Empty message provided for decoding.")
    # The prefix is the first character in the string
    prefix = message[0]
    # Find the first boundary after the prefix
    first_boundary_pos = message.find(BOUNDARY, 1)
    if first_boundary_pos == -1:
        raise ValueError("No boundary found after prefix; cannot decode.")
    start_encoded = first_boundary_pos + len(BOUNDARY)
    second_boundary_pos = message.find(BOUNDARY, start_encoded)
    if second_boundary_pos == -1:
        raise ValueError("No closing boundary found; cannot decode.")
    encoded_data = message[start_encoded:second_boundary_pos]
    suffix = message[second_boundary_pos + len(BOUNDARY) :]
    return prefix, encoded_data, suffix


def choose_cipher() -> str:
    """Prompt the user to choose a cipher from the available list."""
    print("\nAvailable ciphers:")
    names = list(cipher_maps.keys())
    for idx, name in enumerate(names, 1):
        print(f"  {idx}. {name}")
    while True:
        choice = input("Pick your cipher by number (or 'q' to cancel): ").strip()
        if choice.lower().startswith("q"):
            return ""
        if choice.isdigit():
            num = int(choice)
            if 1 <= num <= len(names):
                return names[num - 1]
        print("Invalid selection. Please try again, human.")


def get_prefix_char() -> str:
    """Ask the user to provide a visible Unicode character to prefix messages."""
    while True:
        raw = input(
            "Enter a visible Unicode character code (e.g. U+2764) or the actual character itself: "
        ).strip()
        if not raw:
            print("You didn't type anything. Try again.")
            continue
        if raw.upper().startswith("U+"):
            hex_part = raw[2:]
            try:
                codepoint = int(hex_part, 16)
                if 0 <= codepoint <= sys.maxunicode:
                    return chr(codepoint)
                else:
                    print("That codepoint is out of range for Unicode. Try another.")
            except ValueError:
                print("I couldn't parse that hexadecimal value. Try again.")
        else:
            # Use the first character from the input
            return raw[0]


def interactive() -> None:
    """Run the interactive command‑line interface.

    Presents the user with options to encode or decode messages using the
    invisible ciphers. Provides snarky commentary where appropriate.
    """
    print(
        "Welcome, human, to Uniception — the lair of invisible poetry and questionable humor."
    )
    while True:
        print("\nWhat would you like to do?")
        print("  1. Encode a message")
        print("  2. Decode a message")
        print("  3. Exit")
        choice = input("Enter your choice (1/2/3): ").strip()
        if choice == "1":
            cipher_name = choose_cipher()
            if not cipher_name:
                print("Cipher selection cancelled. Returning to main menu.")
                continue
            prefix = get_prefix_char()
            message = input("Enter the message to encode: ")
            if not message:
                print("Nothing to encode. Returning to main menu.")
                continue
            encoded_data = encode_bytes(message.encode("utf-8"), cipher_name)
            full = prefix + BOUNDARY + encoded_data + BOUNDARY
            print(
                "\nHere is your encoded masterpiece. Paste it anywhere and relish the confusion it brings:"
            )
            print(full)
        elif choice == "2":
            cipher_name = choose_cipher()
            if not cipher_name:
                print("Cipher selection cancelled. Returning to main menu.")
                continue
            encoded_message = input(
                "Enter the entire encoded string (including prefix and boundaries): "
            )
            if not encoded_message:
                print("You didn't provide anything to decode. Returning to main menu.")
                continue
            try:
                prefix, encoded_part, suffix = parse_encoded_message(encoded_message)
                decoded_bytes = decode_to_bytes(encoded_part, cipher_name)
                decoded = decoded_bytes.decode("utf-8")
                print("\nDecoded message:")
                print(decoded)
            except Exception as exc:
                print(f"\nOops! Something went wrong while decoding: {exc}")
        elif choice == "3":
            print(
                "Leaving already? Fine. Go, and remember: the best secrets live between the word joiners."
            )
            break
        else:
            print(
                "That wasn't 1, 2 or 3. Try again, and maybe pay attention this time."
            )


if __name__ == "__main__":
    try:
        interactive()
    except KeyboardInterrupt:
        print("\nInterrupted. Goodbye, human.")
