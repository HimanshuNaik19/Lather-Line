import { Jimp } from 'jimp';
import path from 'path';
import fs from 'fs';

const sourceImg = 'C:\\Users\\shrwe\\.gemini\\antigravity\\brain\\eb0078ac-65c7-4c1d-ae2f-32e5924c4d91\\lather_line_logo_1779531441741.png';
const out192 = path.resolve('public', 'pwa-192x192.png');
const out512 = path.resolve('public', 'pwa-512x512.png');

async function resize() {
  try {
    const img = await Jimp.read(sourceImg);
    await img.clone().resize({ w: 192, h: 192 }).write(out192);
    console.log('Created pwa-192x192.png');
    await img.clone().resize({ w: 512, h: 512 }).write(out512);
    console.log('Created pwa-512x512.png');
  } catch (err) {
    console.error('Error resizing:', err);
  }
}

resize();
