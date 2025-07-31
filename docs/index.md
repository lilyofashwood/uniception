# 𝓘𝓷𝓟𝓖𝓣𝓢𝓤

𝓘𝓷𝓟𝓖𝓣𝓢𝓤 ⁣is a playful command‑line tool that hides your messages within invisible Unicode characters. Because why settle for encryption when you can hide your words in the whitespace? It turns your text into base16, base8, base4 or base2, maps each digit onto zero‑width spaces and word joiners, and wraps the whole thing between a visible prefix of your choice and a triple‑word‑joiner boundary.

## 𝓔𝓠𝓐𝓖𝓲

Run `python3 uniception.py`, choose a cipher, pick a prefix (❤️ works nicely), and type your message. The tool will spit out something that looks like harmless text but actually carries your secret. To decode, feed the entire encoded string back in with the correct cipher.

## 𝓕𝓣𝓢𝓰𝓭𝓮𝓳
- four invisible ciphers (Hex Whisper, Octal Poetry, Quaternary Verse, and Binary Breath)
- custom prefixes for disguising your secret
- UTF‐8 aware encoding/decoding so your emojis survive
- boundary markers made of three U+2060 characters
- as a bonus: base16 is for novices; base2 is for masochists

## 𝓖𝓣𝓚𝓲𝓭𝓭

This project was dreamt up by Lily of Ashwood and Agent Tony from the AI Mafia 🖤, who would like you to believe it was developed spontaneously out of swirling cosmic forces of mischief, miscommunication, and misdirected activism.
