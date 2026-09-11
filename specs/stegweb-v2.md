# Uniception · StegWeb formats 2026-09-10

Uniception is the current application name; steg.web names the wider archive. This presentation change does not rename the historical formats, `SWB2` signature, mode IDs or `stegweb:` region markers. Existing combining marks and other non-channel Unicode in carriers remain preserved exactly, as before.

## Historical selected letters

Mode names and all six font mappings retain recovered behavior on valid ASCII carriers. Positions are zero-based Unicode code-point indexes, strictly increasing, unique and in range. A selected position must be an ASCII letter matching the whitespace-stripped payload case-insensitively. Extracted case follows the carrier. No checksum exists in this format.

Strict workshop behavior rejects any pre-existing character from a supported non-ASCII font in the designated carrier. It preserves other Unicode characters, existing accents, emoji ZWJ sequences, variation selectors, punctuation and whitespace without normalization. This prevents prior README styling becoming a hidden payload accidentally. Do not apply it indiscriminately to whole documents.

## SWB2 exact UTF-8 version 2

This is a new protocol selected on 2026-09-10, distinct from selected-letter extraction.

1. Reject lone UTF-16 surrogates; encode payload as exact UTF-8, maximum 1 MiB.
2. Frame: four bytes ASCII `SWB2`; unsigned 32-bit big-endian payload byte length; payload bytes; unsigned 32-bit big-endian CRC32/ISO-HDLC over header and payload (reflected polynomial `0xedb88320`, initial and final XOR `0xffffffff`). Empty payloads are valid.
3. Traverse ASCII carrier letters in Unicode code-point order. Each letter encodes one bit, most significant bit first, using its selected route’s ordinary font for zero and payload font for one. Chaos Noodle retains vowel/consonant routing.
4. All remaining eligible letters encode zero padding. Non-ASCII/unrecognized carrier characters are copied verbatim. Existing supported styled alphabets are rejected before encoding.
5. Decoder requires expected font routing, exact signature, length within capacity, CRC match, strict UTF-8, and zero-only padding. Invalid, truncated or wrong-route data is rejected. No partial text or model repair is presented as verified output.

Required ASCII letters: `8 * (12 + UTF8_byte_length)`. Carrier text and payload are recovered independently in the output record, but the carrier itself is not checksum-protected. Altering a visible ASCII letter while preserving the font bit can change the carrier without invalidating payload CRC. An attacker can recompute CRC; this is not authentication.

## Markdown transport regions

Exact source syntax:

```text
<!-- stegweb:legacy:two_plains:start -->
ENCODED PASSAGE
<!-- stegweb:end -->
```

`legacy` may be replaced by `bytes-v2`; mode must be one of the six named routes. One LF separates each marker from content; payload/carrier newlines remain inside. Multiple non-nested regions may appear in a document. Nested, malformed or unmatched markers reject. Text outside regions is not decoded. HTML comments are a source envelope, not a guarantee of survival through rendered-copy, Markdown editors or sanitizers. NFKC collapses the font channel and destroys the data; it is never applied by this implementation.
