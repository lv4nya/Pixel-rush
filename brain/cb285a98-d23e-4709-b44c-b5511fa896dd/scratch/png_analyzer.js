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

  console.log(`PNG Dimensions: ${width}x${height}, ColorType: ${colorType}, BitDepth: ${bitDepth}`);

  const idatBuffer = Buffer.concat(idatBuffers);
  const decompressed = zlib.inflateSync(idatBuffer);

  let bytesPerPixel = 0;
  if (colorType === 2) {
    bytesPerPixel = 3; // RGB
  } else if (colorType === 6) {
    bytesPerPixel = 4; // RGBA
  } else {
    throw new Error(`Unsupported PNG color type ${colorType}`);
  }

  if (bitDepth !== 8) {
    throw new Error(`Unsupported PNG bit depth ${bitDepth}`);
  }

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
        case 0:
          recon = raw;
          break;
        case 1:
          recon = raw + a;
          break;
        case 2:
          recon = raw + b;
          break;
        case 3:
          recon = raw + Math.floor((a + b) / 2);
          break;
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
        default:
          throw new Error(`Unknown filter type ${filterType}`);
      }

      scanline[x] = recon & 0xFF;
    }

    scanline.copy(pixels, y * width * bytesPerPixel);
    prevRow = scanline;
  }

  return { width, height, pixels, bytesPerPixel };
}

function findOpaqueRegions(png) {
  const { width, height, pixels, bytesPerPixel } = png;
  
  // Print top-left 5x5 pixels
  console.log('Top-left 5x5 pixels:');
  for (let y = 0; y < 5; y++) {
    let line = '';
    for (let x = 0; x < 5; x++) {
      const offset = (y * width + x) * bytesPerPixel;
      if (bytesPerPixel === 3) {
        line += `(${pixels[offset].toString(16)},${pixels[offset+1].toString(16)},${pixels[offset+2].toString(16)}) `;
      } else {
        line += `(${pixels[offset].toString(16)},${pixels[offset+1].toString(16)},${pixels[offset+2].toString(16)},${pixels[offset+3].toString(16)}) `;
      }
    }
    console.log(line);
  }

  // Define background color based on top-left pixel
  const bgR = pixels[0];
  const bgG = pixels[1];
  const bgB = pixels[2];
  const bgA = bytesPerPixel === 4 ? pixels[3] : 255;

  console.log(`Assumed background color: RGB(${bgR}, ${bgG}, ${bgB}), Alpha(${bgA})`);

  const rowAlphas = new Array(height).fill(0);
  const colAlphas = new Array(width).fill(0);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * bytesPerPixel;
      const r = pixels[offset];
      const g = pixels[offset + 1];
      const b = pixels[offset + 2];
      const a = bytesPerPixel === 4 ? pixels[offset + 3] : 255;

      const isBackground = Math.abs(r - bgR) < 10 && Math.abs(g - bgG) < 10 && Math.abs(b - bgB) < 10 && (bytesPerPixel === 3 || a < 10);
      if (!isBackground) {
        rowAlphas[y]++;
        colAlphas[x]++;
      }
    }
  }

  function getRuns(alphas, threshold = 2) {
    const runs = [];
    let start = -1;
    for (let i = 0; i < alphas.length; i++) {
      if (alphas[i] > threshold) {
        if (start === -1) start = i;
      } else {
        if (start !== -1) {
          runs.push({ start, end: i - 1, size: i - start });
          start = -1;
        }
      }
    }
    if (start !== -1) {
      runs.push({ start, end: alphas.length - 1, size: alphas.length - start });
    }
    return runs;
  }

  const yRuns = getRuns(rowAlphas, 5);
  const xRuns = getRuns(colAlphas, 5);

  return { yRuns, xRuns };
}

const customerPath = 'c:/Users/HP5CD/OneDrive/Desktop/GameProjects/pixel-cafe/pixel-cafe/public/assets/customers/kawaii_animal_pixel_avatars.png';
const uiPath = 'c:/Users/HP5CD/OneDrive/Desktop/GameProjects/pixel-cafe/pixel-cafe/public/assets/ui/pastel_coffee_shop_pixel_assets.png';

console.log('--- CUSTOMERS ---');
const custPng = parsePng(customerPath);
const custRegions = findOpaqueRegions(custPng);
console.log('Customer Y Runs:', custRegions.yRuns);
console.log('Customer X Runs:', custRegions.xRuns);

console.log('--- UI ---');
const uiPng = parsePng(uiPath);
const uiRegions = findOpaqueRegions(uiPng);
console.log('UI Y Runs:', uiRegions.yRuns);
console.log('UI X Runs:', uiRegions.xRuns);
