import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pytest  # noqa: E402

from uniception import (  # noqa: E402
    BOUNDARY,
    cipher_maps,
    decode_to_bytes,
    encode_bytes,
    parse_encoded_message,
)

sample_texts = [
    'hello',
    'world! \u2764',
    'unicode \u2603 snowman',
]


def encode_decode(cipher_name, text):
    encoded = encode_bytes(text.encode('utf-8'), cipher_name)
    decoded = decode_to_bytes(encoded, cipher_name).decode('utf-8')
    assert decoded == text


@pytest.mark.parametrize('cipher_name', list(cipher_maps.keys()))
@pytest.mark.parametrize('text', sample_texts)
def test_roundtrip(cipher_name, text):
    encode_decode(cipher_name, text)


def test_parse_encoded_message():
    cipher_name = list(cipher_maps.keys())[0]
    prefix = 'X'
    text = 'secret message'
    encoded = encode_bytes(text.encode('utf-8'), cipher_name)
    message = prefix + BOUNDARY + encoded + BOUNDARY
    p, encoded_part, suffix = parse_encoded_message(message)
    assert p == prefix
    assert encoded_part == encoded
    assert suffix == ''
