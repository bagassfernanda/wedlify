import { readFileSync, writeFileSync } from 'node:fs';
import zlib from 'node:zlib';

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  throw new Error('Usage: node scripts/clean-logo.mjs <input> <output>');
}

const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const source = readFileSync(inputPath);

if (!source.subarray(0, 8).equals(signature)) {
  throw new Error('Input is not a PNG file');
}

const chunks = [];
let cursor = 8;

while (cursor < source.length) {
  const length = source.readUInt32BE(cursor);
  const type = source.toString('ascii', cursor + 4, cursor + 8);
  const data = source.subarray(cursor + 8, cursor + 8 + length);
  chunks.push({ type, data });
  cursor += 12 + length;

  if (type === 'IEND') {
    break;
  }
}

const ihdr = chunks.find((chunk) => chunk.type === 'IHDR')?.data;

if (!ihdr) {
  throw new Error('Missing IHDR chunk');
}

const width = ihdr.readUInt32BE(0);
const height = ihdr.readUInt32BE(4);
const bitDepth = ihdr[8];
const colorType = ihdr[9];
const interlace = ihdr[12];

if (bitDepth !== 8 || colorType !== 2 || interlace !== 0) {
  throw new Error('Only 8-bit RGB non-interlaced PNG input is supported');
}

const compressed = Buffer.concat(chunks.filter((chunk) => chunk.type === 'IDAT').map((chunk) => chunk.data));
const inflated = zlib.inflateSync(compressed);
const channels = 3;
const scanlineLength = width * channels;
const raw = Buffer.alloc(height * scanlineLength);

let inputOffset = 0;

for (let y = 0; y < height; y += 1) {
  const filter = inflated[inputOffset];
  inputOffset += 1;
  const line = inflated.subarray(inputOffset, inputOffset + scanlineLength);
  inputOffset += scanlineLength;
  const previousRow = y === 0 ? null : raw.subarray((y - 1) * scanlineLength, y * scanlineLength);
  const outputRow = raw.subarray(y * scanlineLength, (y + 1) * scanlineLength);

  for (let x = 0; x < scanlineLength; x += 1) {
    const left = x >= channels ? outputRow[x - channels] : 0;
    const up = previousRow ? previousRow[x] : 0;
    const upLeft = previousRow && x >= channels ? previousRow[x - channels] : 0;
    let value = line[x];

    if (filter === 1) {
      value = (value + left) & 0xff;
    } else if (filter === 2) {
      value = (value + up) & 0xff;
    } else if (filter === 3) {
      value = (value + Math.floor((left + up) / 2)) & 0xff;
    } else if (filter === 4) {
      const pa = Math.abs(up - upLeft);
      const pb = Math.abs(left - upLeft);
      const pc = Math.abs(left + up - 2 * upLeft);
      const predictor = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
      value = (value + predictor) & 0xff;
    } else if (filter !== 0) {
      throw new Error(`Unsupported PNG filter: ${filter}`);
    }

    outputRow[x] = value;
  }
}

const rgba = Buffer.alloc(width * height * 4);
let minX = width;
let minY = height;
let maxX = 0;
let maxY = 0;

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const rgbOffset = (y * width + x) * 3;
    const rgbaOffset = (y * width + x) * 4;
    const red = raw[rgbOffset];
    const green = raw[rgbOffset + 1];
    const blue = raw[rgbOffset + 2];
    const maxChannel = Math.max(red, green, blue);
    const minChannel = Math.min(red, green, blue);
    const chroma = maxChannel - minChannel;
    const isCheckerBackground = minChannel > 207 && chroma < 34;

    if (isCheckerBackground) {
      rgba[rgbaOffset] = 0;
      rgba[rgbaOffset + 1] = 0;
      rgba[rgbaOffset + 2] = 0;
      rgba[rgbaOffset + 3] = 0;
    } else {
      rgba[rgbaOffset] = red;
      rgba[rgbaOffset + 1] = green;
      rgba[rgbaOffset + 2] = blue;
      rgba[rgbaOffset + 3] = 255;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
}

const padding = 28;
minX = Math.max(0, minX - padding);
minY = Math.max(0, minY - padding);
maxX = Math.min(width - 1, maxX + padding);
maxY = Math.min(height - 1, maxY + padding);

const cropWidth = maxX - minX + 1;
const cropHeight = maxY - minY + 1;
const outputRaw = Buffer.alloc(cropHeight * (1 + cropWidth * 4));

for (let y = 0; y < cropHeight; y += 1) {
  const rowStart = y * (1 + cropWidth * 4);
  outputRaw[rowStart] = 0;

  for (let x = 0; x < cropWidth; x += 1) {
    const sourceOffset = ((minY + y) * width + minX + x) * 4;
    const destinationOffset = rowStart + 1 + x * 4;
    rgba.copy(outputRaw, destinationOffset, sourceOffset, sourceOffset + 4);
  }
}

const crcTable = new Uint32Array(256);

for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c >>> 0;
}

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) {
    c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const lengthBuffer = Buffer.alloc(4);
  const crcBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(data.length);
  crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([lengthBuffer, typeBuffer, data, crcBuffer]);
}

const outputIHDR = Buffer.alloc(13);
outputIHDR.writeUInt32BE(cropWidth, 0);
outputIHDR.writeUInt32BE(cropHeight, 4);
outputIHDR[8] = 8;
outputIHDR[9] = 6;
outputIHDR[10] = 0;
outputIHDR[11] = 0;
outputIHDR[12] = 0;

const output = Buffer.concat([
  signature,
  pngChunk('IHDR', outputIHDR),
  pngChunk('IDAT', zlib.deflateSync(outputRaw, { level: 9 })),
  pngChunk('IEND', Buffer.alloc(0)),
]);

writeFileSync(outputPath, output);
