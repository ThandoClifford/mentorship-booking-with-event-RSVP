import assert from 'node:assert/strict';
import test from 'node:test';
import { decodeEventImage } from '../src/utils/event-image.js';

const validPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p5sAAAAASUVORK5CYII=';

test('decodes a supported uploaded PNG image', () => {
  const image = decodeEventImage(validPng);
  assert.equal(image.extension, 'png');
  assert.equal(image.buffer.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
});

test('rejects image URLs and unsupported data URL formats', () => {
  assert.equal(decodeEventImage('/images/event.jpg'), null);
  assert.equal(decodeEventImage('data:image/svg+xml;base64,PHN2Zz48L3N2Zz4='), null);
});

test('rejects invalid base64 and mismatched image signatures', () => {
  assert.equal(decodeEventImage('data:image/png;base64,not-valid!'), null);
  assert.equal(decodeEventImage('data:image/jpeg;base64,aGVsbG8='), null);
});

test('rejects uploaded image data above the storage limit', () => {
  const oversized = Buffer.alloc(600 * 1024 + 1);
  const dataUrl = `data:image/png;base64,${oversized.toString('base64')}`;
  assert.equal(decodeEventImage(dataUrl), null);
});
