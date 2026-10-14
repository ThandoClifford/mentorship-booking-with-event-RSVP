import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const MAX_EVENT_IMAGE_BYTES = 600 * 1024;
export const EVENT_IMAGES_DIRECTORY = fileURLToPath(new URL('../../../public/uploads/events/', import.meta.url));

const IMAGE_SIGNATURES = {
  png: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  jpeg: Buffer.from([0xff, 0xd8, 0xff]),
};

export function decodeEventImage(dataUrl) {
  const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(String(dataUrl || ''));
  if (!match) return null;

  const [, mime, encoded] = match;
  const buffer = Buffer.from(encoded, 'base64');
  if (
    buffer.length === 0
    || buffer.length > MAX_EVENT_IMAGE_BYTES
    || buffer.toString('base64') !== encoded
  ) {
    return null;
  }

  const isPng = mime === 'png' && buffer.subarray(0, IMAGE_SIGNATURES.png.length).equals(IMAGE_SIGNATURES.png);
  const isJpeg = mime === 'jpeg' && buffer.subarray(0, IMAGE_SIGNATURES.jpeg.length).equals(IMAGE_SIGNATURES.jpeg);
  const isWebp = mime === 'webp'
    && buffer.length >= 12
    && buffer.toString('ascii', 0, 4) === 'RIFF'
    && buffer.toString('ascii', 8, 12) === 'WEBP';

  if (!isPng && !isJpeg && !isWebp) return null;

  return {
    buffer,
    extension: mime === 'jpeg' ? 'jpg' : mime,
  };
}

export async function storeEventImage(dataUrl) {
  const image = decodeEventImage(dataUrl);
  if (!image) return null;

  const filename = `${randomUUID()}.${image.extension}`;
  await mkdir(EVENT_IMAGES_DIRECTORY, { recursive: true });
  await writeFile(path.join(EVENT_IMAGES_DIRECTORY, filename), image.buffer, { flag: 'wx' });

  return `/uploads/events/${filename}`;
}

export async function removeStoredEventImage(imagePath) {
  const filename = path.basename(String(imagePath || ''));
  if (!/^[-\da-f]{36}\.(png|jpg|webp)$/.test(filename) || imagePath !== `/uploads/events/${filename}`) {
    return;
  }

  await unlink(path.join(EVENT_IMAGES_DIRECTORY, filename));
}
