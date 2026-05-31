import fs from 'fs';
import zlib from 'zlib';

function parsePng(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  
  if (fileBuffer.readUInt32BE(0) !== 0x89504E47 || fileBuffer.readUInt32BE(4) !== 0x0D0A1A0A) {
    throw new Error('Not a valid PNG');
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let idatBuffers = [];

  while (offset < fileBuffer.length) {
    const length = fileBuffer.readUInt32BE(offset);
    const type = fileBuffer.toString('ascii', offset + 4, offset + 8);
    const data = fileBuffer.slice(offset + 8, offset + 8 + length);
    
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === 'IDAT') {
      idatBuffers.push(data);
    } else if (type === 'IEND') {
      break;
    }
    offset += 12 + length;
  }

  const idatBuffer = Buffer.concat(idatBuffers);
  const decompressed = zlib.inflateSync(idatBuffer);

  let bytesPerPixel = colorType === 2 ? 3 : 4;
  const rowSize = 1 + width * bytesPerPixel;
  const pixels = Buffer.alloc(width * height * bytesPerPixel);

  let prevRow = Buffer.alloc(width * bytesPerPixel);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    const filterType = decompressed[rowOffset];
    const rowData = decompressed.slice(rowOffset + 1, rowOffset + rowSize);
    const scanline = Buffer.alloc(width * bytesPerPixel);

    for (let x = 0; x < width * bytesPerPixel; x++) {
      const raw = rowData[x];
      let recon = 0;
      
      const a = x >= bytesPerPixel ? scanline[x - bytesPerPixel] : 0;
      const b = prevRow[x];
      const c = x >= bytesPerPixel ? prevRow[x - bytesPerPixel] : 0;

      switch (filterType) {
        case 0: recon = raw; break;
        case 1: recon = raw + a; break;
        case 2: recon = raw + b; break;
        case 3: recon = raw + Math.floor((a + b) / 2); break;
        case 4:
          const p = a + b - c;
          const pa = Math.abs(p - a);
          const pb = Math.abs(p - b);
          const pc = Math.abs(p - c);
          let pr = 0;
          if (pa <= pb && pa <= pc) pr = a;
          else if (pb <= pc) pr = b;
          else pr = c;
          recon = raw + pr;
          break;
      }
      scanline[x] = recon & 0xFF;
    }
    scanline.copy(pixels, y * width * bytesPerPixel);
    prevRow = scanline;
  }

  return { width, height, pixels, bytesPerPixel };
}

const uiPath = 'c:/Users/HP5CD/OneDrive/Desktop/GameProjects/pixel-cafe/pixel-cafe/public/assets/ui/pastel_coffee_shop_pixel_assets.png';
const png = parsePng(uiPath);
const { width, height, pixels, bytesPerPixel } = png;

// Determine background color
const bgR = pixels[0];
const bgG = pixels[1];
const bgB = pixels[2];

const visited = new Uint8Array(width * height);
const boxes = [];

// Simple connected component labeling (flood fill)
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = y * width + x;
    if (visited[idx]) continue;

    const offset = idx * bytesPerPixel;
    const r = pixels[offset];
    const g = pixels[offset + 1];
    const b = pixels[offset + 2];

    const isBg = Math.abs(r - bgR) < 15 && Math.abs(g - bgG) < 15 && Math.abs(b - bgB) < 15;
    if (isBg) {
      visited[idx] = 1;
      continue;
    }

    // Found a new object! Flood fill to find its boundaries
    let minX = x, maxX = x, minY = y, maxY = y;
    const queue = [[x, y]];
    visited[idx] = 1;
    let pixelCount = 0;

    while (queue.length > 0) {
      const [cx, cy] = queue.shift();
      pixelCount++;

      if (cx < minX) minX = cx;
      if (cx > maxX) maxX = cx;
      if (cy < minY) minY = cy;
      if (cy > maxY) maxY = cy;

      const neighbors = [
        [cx + 1, cy],
        [cx - 1, cy],
        [cx, cy + 1],
        [cx, cy - 1]
      ];

      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nidx = ny * width + nx;
          if (!visited[nidx]) {
            const noffset = nidx * bytesPerPixel;
            const nr = pixels[noffset];
            const ng = pixels[noffset + 1];
            const nb = pixels[noffset + 2];
            const nisBg = Math.abs(nr - bgR) < 15 && Math.abs(ng - bgG) < 15 && Math.abs(nb - bgB) < 15;
            
            if (!nisBg) {
              visited[nidx] = 1;
              queue.push([nx, ny]);
            }
          }
        }
      }
    }

    if (pixelCount > 40) { // filter noise
      boxes.push({ minX, maxX, minY, maxY, width: maxX - minX + 1, height: maxY - minY + 1, pixels: pixelCount });
    }
  }
}

// Sort boxes by Y first, then by X
boxes.sort((a, b) => {
  if (Math.abs(a.minY - b.minY) > 20) {
    return a.minY - b.minY;
  }
  return a.minX - b.minX;
});

console.log(`Found ${boxes.length} distinct UI sprites:`);
boxes.forEach((box, i) => {
  console.log(`Sprite ${i + 1}: x=${box.minX}, y=${box.minY}, w=${box.width}, h=${box.height} (pixels: ${box.pixels})`);
});
