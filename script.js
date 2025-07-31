const encodeBtn = document.getElementById('encode-btn');
const decodeBtn = document.getElementById('decode-btn');
const encodeArea = document.getElementById('encode-area');
const decodeArea = document.getElementById('decode-area');
const encodeInput = document.getElementById('encode-input');
const decodeInput = document.getElementById('decode-input');
const cipherSelect = document.getElementById('cipher-select');
const prefixInput = document.getElementById('prefix-input');
const resultBox = document.getElementById('result');

const BOUNDARY = '\u2060\u2060\u2060';

const cipherMaps = {
    'Hex Whisper (default)': [
        '\u200B','\u200C','\u200D','\u2060','\u2009','\u200A','\u202F','\u205F',
        '\u2061','\u2062','\u2063','\u2064','\u2002','\u2004','\u2005','\u2006'
    ],
    'Octal Poetry': [
        '\u200B','\u200C','\u200D','\u2060','\u2009','\u200A','\u202F','\u205F'
    ],
    'Quaternary Verse': [
        '\u200B','\u200C','\u200D','\u2060'
    ],
    'Binary Breath': [
        '\u200B','\u200C'
    ]
};

function digitsPerByte(base) {
    return Math.ceil(8 / Math.log2(base));
}

function toBaseDigits(number, base, width) {
    const digits = new Array(width).fill(0);
    let n = number;
    let idx = width - 1;
    while (n > 0 && idx >= 0) {
        digits[idx] = n % base;
        n = Math.floor(n / base);
        idx -= 1;
    }
    return digits;
}

function encodeBytes(data, cipherName) {
    const mapping = cipherMaps[cipherName];
    const base = mapping.length;
    const width = digitsPerByte(base);
    const encoded = [];
    for (const byte of data) {
        const digits = toBaseDigits(byte, base, width);
        for (const d of digits) {
            encoded.push(mapping[d]);
        }
    }
    return encoded.join('');
}

function decodeToBytes(encoded, cipherName) {
    const mapping = cipherMaps[cipherName];
    const base = mapping.length;
    const width = digitsPerByte(base);
    const lookup = {};
    mapping.forEach((ch, idx) => lookup[ch] = idx);
    const digits = [];
    for (const ch of Array.from(encoded)) {
        if (!(ch in lookup)) {
            throw new Error(`Unexpected character ${ch}`);
        }
        digits.push(lookup[ch]);
    }
    if (digits.length % width !== 0) {
        throw new Error('Encoded length invalid');
    }
    const bytes = [];
    for (let i = 0; i < digits.length; i += width) {
        let value = 0;
        for (const d of digits.slice(i, i + width)) {
            value = value * base + d;
        }
        bytes.push(value);
    }
    return new Uint8Array(bytes);
}

function parseEncodedMessage(message) {
    if (!message) throw new Error('Empty message');
    const prefix = message[0];
    const first = message.indexOf(BOUNDARY, 1);
    if (first === -1) throw new Error('No boundary found');
    const start = first + BOUNDARY.length;
    const second = message.indexOf(BOUNDARY, start);
    if (second === -1) throw new Error('No closing boundary');
    const encoded = message.slice(start, second);
    const suffix = message.slice(second + BOUNDARY.length);
    return { prefix, encoded, suffix };
}

function parsePrefixInput() {
    const raw = prefixInput.value.trim();
    if (!raw) return '';
    if (raw.toUpperCase().startsWith('U+')) {
        const hex = raw.slice(2);
        const cp = parseInt(hex, 16);
        if (!isNaN(cp)) return String.fromCodePoint(cp);
    }
    return raw[0];
}

encodeBtn.addEventListener('click', () => {
    try {
        const text = encodeInput.value;
        const cipherName = cipherSelect.value;
        const prefix = parsePrefixInput();
        const data = new TextEncoder().encode(text);
        const encoded = encodeBytes(data, cipherName);
        resultBox.value = prefix + BOUNDARY + encoded + BOUNDARY;
    } catch (e) {
        resultBox.value = `Error: ${e.message}`;
    }
});

decodeBtn.addEventListener('click', () => {
    try {
        const text = decodeInput.value;
        const cipherName = cipherSelect.value;
        const { encoded } = parseEncodedMessage(text);
        const bytes = decodeToBytes(encoded, cipherName);
        resultBox.value = new TextDecoder().decode(bytes);
    } catch (e) {
        resultBox.value = `Error: ${e.message}`;
    }
});

encodeBtn.addEventListener('click', () => {
    encodeArea.style.display = 'block';
    decodeArea.style.display = 'none';
});

decodeBtn.addEventListener('click', () => {
    encodeArea.style.display = 'none';
    decodeArea.style.display = 'block';
});
