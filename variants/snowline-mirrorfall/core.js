// Public extraction of the recovered Snowline SN v1 implementation.
// Codec functions are unchanged from the 1.0.1 recovery; only the export wrapper changed.
// Historical artwork and private example text are deliberately not included.
"use strict";

// Snowline / Differential Garden reference channel.
// The data lives in the change of typographic state from one Latin letter
// to the next.  The four states make a Gray-like cycle:
// regular -> bold -> bold italic -> italic -> regular.

const STATES = [
  { name: "regular", upper: 0x1d5a0, lower: 0x1d5ba },
  { name: "bold", upper: 0x1d5d4, lower: 0x1d5ee },
  { name: "bold-italic", upper: 0x1d63c, lower: 0x1d656 },
  { name: "italic", upper: 0x1d608, lower: 0x1d622 },
];

const MAGIC = [0x53, 0x4e]; // "SN"
const VERSION = 1;
const HEADER_BYTES = 5;
const TRAILER_BYTES = 2;

function canonicalizeCarrier(text) {
  return Array.from(text, (char) => {
    const folded = char.normalize("NFKC");
    return /^[A-Za-z]$/.test(folded) ? folded : char;
  }).join("");
}

function latinLetterCount(text) {
  return Array.from(canonicalizeCarrier(text)).filter((c) => /[A-Za-z]/.test(c)).length;
}

function capacity(text) {
  const letters = latinLetterCount(text);
  return {
    letters,
    // The first letter is an explicit state-0 anchor; every later letter
    // contributes one differential two-bit step.
    framedBytes: Math.floor(Math.max(0, letters - 1) / 4),
    payloadBytes: Math.max(0, Math.floor(Math.max(0, letters - 1) / 4) - HEADER_BYTES - TRAILER_BYTES),
  };
}

function crc16(bytes) {
  let crc = 0xffff;
  for (const byte of bytes) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc;
}

function frame(payloadBytes) {
  if (payloadBytes.length > 0xffff) throw new Error("payload exceeds uint16 frame length");
  const checksum = crc16(payloadBytes);
  return Uint8Array.from([
    ...MAGIC,
    VERSION,
    payloadBytes.length >>> 8,
    payloadBytes.length & 0xff,
    ...payloadBytes,
    checksum >>> 8,
    checksum & 0xff,
  ]);
}

function bytesToSteps(bytes) {
  const steps = [];
  for (const byte of bytes) {
    steps.push((byte >>> 6) & 3, (byte >>> 4) & 3, (byte >>> 2) & 3, byte & 3);
  }
  return steps;
}

function stepsToBytes(steps) {
  const bytes = [];
  for (let i = 0; i + 3 < steps.length; i += 4) {
    bytes.push((steps[i] << 6) | (steps[i + 1] << 4) | (steps[i + 2] << 2) | steps[i + 3]);
  }
  return Uint8Array.from(bytes);
}

function styledLetter(ascii, state) {
  const cp = ascii.codePointAt(0);
  if (cp >= 0x41 && cp <= 0x5a) return String.fromCodePoint(STATES[state].upper + cp - 0x41);
  if (cp >= 0x61 && cp <= 0x7a) return String.fromCodePoint(STATES[state].lower + cp - 0x61);
  throw new Error("styledLetter requires one ASCII Latin letter");
}

function readStyledLetter(char) {
  const cp = char.codePointAt(0);
  for (let state = 0; state < STATES.length; state += 1) {
    const { upper, lower } = STATES[state];
    if (cp >= upper && cp < upper + 26) {
      return { state, ascii: String.fromCodePoint(0x41 + cp - upper) };
    }
    if (cp >= lower && cp < lower + 26) {
      return { state, ascii: String.fromCodePoint(0x61 + cp - lower) };
    }
  }
  return null;
}

function filler(seed) {
  let x = (seed ^ 0x9e3779b9) >>> 0 || 0xa341316c;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) & 3;
  };
}

function mirrorfallOrder(length) {
  if (length < 2 || length % 2 !== 0) {
    throw new Error("Mirrorfall requires an even letter count");
  }
  const order = [];
  let left = length / 2 - 1;
  let right = length / 2;
  while (left >= 0 || right < length) {
    if (left >= 0) order.push(left--);
    if (right < length) order.push(right++);
  }
  return order;
}

function encode(carrier, payload) {
  assertScalarText(payload);
  const plain = canonicalizeCarrier(carrier);
  const payloadBytes = new TextEncoder().encode(payload);
  const framed = frame(payloadBytes);
  const neededLetters = 1 + framed.length * 4;
  const availableLetters = latinLetterCount(plain);
  if (neededLetters > availableLetters) {
    throw new Error(`payload frame needs ${neededLetters} letters; carrier has ${availableLetters}`);
  }

  const dataSteps = bytesToSteps(framed);
  const checksum = crc16(payloadBytes);
  const nextFiller = filler((payloadBytes.length << 16) ^ checksum ^ availableLetters);
  let stepIndex = 0;
  let state = 0;
  let anchored = false;
  const encoded = Array.from(plain, (char) => {
    if (!/[A-Za-z]/.test(char)) return char;
    if (!anchored) {
      anchored = true;
      return styledLetter(char, state);
    }
    const step = stepIndex < dataSteps.length ? dataSteps[stepIndex] : nextFiller();
    stepIndex += 1;
    state = (state + step) & 3;
    return styledLetter(char, state);
  }).join("");
  return { encoded, plaintext: plain, payload, capacity: capacity(plain) };
}

function encodeMirrorfall(carrier, payload) {
  assertScalarText(payload);
  const plain = canonicalizeCarrier(carrier);
  const payloadBytes = new TextEncoder().encode(payload);
  const framed = frame(payloadBytes);
  const availableLetters = latinLetterCount(plain);
  const neededLetters = 1 + framed.length * 4;
  if (neededLetters > availableLetters) {
    throw new Error(
      `payload frame needs ${neededLetters} letters; ` +
      `carrier has ${availableLetters}`,
    );
  }

  const order = mirrorfallOrder(availableLetters);
  const dataSteps = bytesToSteps(framed);
  const checksum = crc16(payloadBytes);
  const seed = (payloadBytes.length << 16) ^ checksum ^ availableLetters;
  const nextFiller = filler(seed);
  const states = new Array(availableLetters);
  let state = 0;
  states[order[0]] = state;
  for (let i = 1; i < order.length; i += 1) {
    const stepIndex = i - 1;
    const step = stepIndex < dataSteps.length
      ? dataSteps[stepIndex]
      : nextFiller();
    state = (state + step) & 3;
    states[order[i]] = state;
  }

  let ordinal = 0;
  const encoded = Array.from(plain, (char) => {
    if (!/[A-Za-z]/.test(char)) return char;
    const out = styledLetter(char, states[ordinal]);
    ordinal += 1;
    return out;
  }).join("");
  return {
    encoded,
    plaintext: plain,
    payload,
    capacity: capacity(plain),
    order,
  };
}

function decode(encoded) {
  let previousState = 0;
  let anchored = false;
  const steps = [];
  const plaintext = Array.from(encoded, (char) => {
    const styled = readStyledLetter(char);
    if (styled) {
      if (!anchored) {
        if (styled.state !== 0) throw new Error("Snowline anchor mismatch");
        anchored = true;
        previousState = styled.state;
        return styled.ascii;
      }
      steps.push((styled.state - previousState + 4) & 3);
      previousState = styled.state;
      return styled.ascii;
    }
    if (/[A-Za-z]/.test(char)) throw new Error("unstyled Latin letter inside strict Snowline carrier");
    return char;
  }).join("");

  const bytes = stepsToBytes(steps);
  if (bytes.length < HEADER_BYTES + TRAILER_BYTES) throw new Error("carrier is too short for a frame");
  if (bytes[0] !== MAGIC[0] || bytes[1] !== MAGIC[1]) throw new Error("Snowline magic mismatch");
  if (bytes[2] !== VERSION) throw new Error(`unsupported Snowline version ${bytes[2]}`);
  const length = (bytes[3] << 8) | bytes[4];
  const end = HEADER_BYTES + length;
  if (end + TRAILER_BYTES > bytes.length) throw new Error("truncated Snowline payload");
  const payloadBytes = bytes.slice(HEADER_BYTES, end);
  const expected = (bytes[end] << 8) | bytes[end + 1];
  const actual = crc16(payloadBytes);
  if (expected !== actual) throw new Error("Snowline CRC mismatch");
  const payload = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(payloadBytes);
  return { plaintext, payload, consumedLetters: 1 + (end + TRAILER_BYTES) * 4 };
}

function decodeMirrorfall(encoded) {
  const states = [];
  const plaintext = Array.from(encoded, (char) => {
    const styled = readStyledLetter(char);
    if (styled) {
      states.push(styled.state);
      return styled.ascii;
    }
    if (/[A-Za-z]/.test(char)) {
      throw new Error("unstyled Latin letter inside Mirrorfall carrier");
    }
    return char;
  }).join("");

  const order = mirrorfallOrder(states.length);
  if (states[order[0]] !== 0) {
    throw new Error("Mirrorfall summit anchor mismatch");
  }
  const steps = [];
  let previousState = states[order[0]];
  for (let i = 1; i < order.length; i += 1) {
    const state = states[order[i]];
    steps.push((state - previousState + 4) & 3);
    previousState = state;
  }

  const bytes = stepsToBytes(steps);
  if (bytes.length < HEADER_BYTES + TRAILER_BYTES) {
    throw new Error("carrier is too short for a Mirrorfall frame");
  }
  if (bytes[0] !== MAGIC[0] || bytes[1] !== MAGIC[1]) {
    throw new Error("Mirrorfall magic mismatch");
  }
  if (bytes[2] !== VERSION) {
    throw new Error(`unsupported Mirrorfall version ${bytes[2]}`);
  }
  const length = (bytes[3] << 8) | bytes[4];
  const end = HEADER_BYTES + length;
  if (end + TRAILER_BYTES > bytes.length) {
    throw new Error("truncated Mirrorfall payload");
  }
  const payloadBytes = bytes.slice(HEADER_BYTES, end);
  const expected = (bytes[end] << 8) | bytes[end + 1];
  const actual = crc16(payloadBytes);
  if (expected !== actual) {
    throw new Error("Mirrorfall CRC mismatch");
  }
  const payload = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true })
    .decode(payloadBytes);
  return {
    plaintext,
    payload,
    consumedLetters: 1 + (end + TRAILER_BYTES) * 4,
    summit: [order[0], order[1]],
  };
}

export {
  STATES,
  canonicalizeCarrier,
  capacity,
  encode,
  decode,
  encodeMirrorfall,
  decodeMirrorfall,
  mirrorfallOrder,
  crc16,
};

// Recovery hardening, 2026-09-10: never silently replace invalid Unicode.
function assertScalarText(text) {
  if (typeof text !== "string") throw new Error("Payload must be text");
  for (const char of text) {
    const cp = char.codePointAt(0);
    if (cp >= 0xd800 && cp <= 0xdfff) throw new Error("Unpaired UTF-16 surrogate rejected");
  }
}

