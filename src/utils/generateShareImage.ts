// utils/generateShareImage.ts

export type ShareSocialItem = {
  iconUrl: string;
  handle: string;
};

export type GenerateShareImageOptions = {
  question: string;
  deckName: string;
  cardUrls: string[];
  profileName: string;
  showName: boolean;
  avatarUrl: string | null;
  showAvatar: boolean;
  socials: ShareSocialItem[];
};

async function loadImg(url: string): Promise<HTMLImageElement | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const objUrl = URL.createObjectURL(blob);
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(objUrl); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(objUrl); resolve(null); };
      img.src = objUrl;
    });
  } catch {
    return null;
  }
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawRoundedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.save();
  roundRectPath(ctx, x, y, w, h, r);
  ctx.clip();
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  if (!text) return [];
  const chars = Array.from(text);
  const lines: string[] = [];
  let line = '';
  for (const ch of chars) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = ch;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function generateShareImage(opts: GenerateShareImageOptions): Promise<Blob> {
  const { question, deckName, cardUrls, profileName, showName, avatarUrl, showAvatar, socials } = opts;

  const SIZE = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d')!;

  // Load all images in parallel
  const [bgImg, avatarImg, ...cardImgResults] = await Promise.all([
    loadImg('/bg/share-background.jpg'),
    showAvatar && avatarUrl ? loadImg(avatarUrl) : Promise.resolve(null),
    ...cardUrls.map(u => loadImg(u)),
  ]);
  const socialImgs = await Promise.all(socials.map(s => loadImg(s.iconUrl)));

  // --- Background ---
  if (bgImg) {
    ctx.drawImage(bgImg, 0, 0, SIZE, SIZE);
  } else {
    const grad = ctx.createLinearGradient(0, 0, 0, SIZE);
    grad.addColorStop(0, '#4c1d95');
    grad.addColorStop(1, '#2e1065');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, SIZE, SIZE);
  }

  const PAD = 54;

  // --- 1. Question ---
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold 54px "Noto Sans Thai", "Sarabun", sans-serif`;
  const qLines = wrapText(ctx, question || '', SIZE - PAD * 2);
  let ty = 90;
  for (const line of qLines.slice(0, 2)) {
    ctx.fillText(line, SIZE / 2, ty);
    ty += 66;
  }

  // --- 2. Deck name ---
  ctx.font = `32px "Noto Sans Thai", "Sarabun", sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.80)';
  ctx.fillText(`ไพ่ทาโรต์ ชุด ${deckName}`, SIZE / 2, ty + 8);
  ty += 52;

  // --- 3. Cards (square format, arranged by spread pattern) ---
  const cardAreaTop = ty + 16;
  const cardAreaBottom = SIZE - 240;
  const cardAreaH = cardAreaBottom - cardAreaTop;
  const n = cardImgResults.length;

  let rows: number[][];
  if (n <= 3) rows = [Array.from({ length: n }, (_, i) => i)];
  else if (n === 4) rows = [[0, 1], [2, 3]];
  else if (n === 5) rows = [[0, 1, 2], [3, 4]];
  else if (n === 6) rows = [[0, 1, 2], [3, 4, 5]];
  else if (n <= 9) {
    rows = [[0, 1, 2], [3, 4, 5]];
    if (n > 6) rows.push(Array.from({ length: n - 6 }, (_, i) => i + 6));
  } else {
    rows = [[0, 1, 2, 3], [4, 5, 6, 7], Array.from({ length: n - 8 }, (_, i) => i + 8)];
  }

  const rowCount = rows.length;
  const cardGap = 14;
  const maxColCount = Math.max(...rows.map(r => r.length));
  const cardHByArea = (cardAreaH - cardGap * (rowCount - 1)) / rowCount;
  const cardWByArea = (SIZE - PAD * 2 - cardGap * (maxColCount - 1)) / maxColCount;
  // Use actual card ratio (portrait tarot ~0.68 w:h)
  const cardH = Math.min(cardHByArea, cardWByArea / 0.68, 300);
  const cardW = cardH * 0.68;

  const totalGridH = cardH * rowCount + cardGap * (rowCount - 1);
  let rowY = cardAreaTop + (cardAreaH - totalGridH) / 2;
  for (const row of rows) {
    const rowW = row.length * cardW + (row.length - 1) * cardGap;
    let cx = (SIZE - rowW) / 2;
    for (const idx of row) {
      const img = cardImgResults[idx];
      if (img) drawRoundedImage(ctx, img, cx, rowY, cardW, cardH, 12);
      cx += cardW + cardGap;
    }
    rowY += cardH + cardGap;
  }

  // --- 4. Profile avatar (center bottom) ---
  const profileR = 56;
  const profileCx = SIZE / 2;
  const profileCy = SIZE - 130;

  if (showAvatar && avatarImg) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(profileCx, profileCy, profileR, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatarImg, profileCx - profileR, profileCy - profileR, profileR * 2, profileR * 2);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(profileCx, profileCy, profileR, 0, Math.PI * 2);
    ctx.stroke();
  }

  // --- 5. Name below avatar ---
  if (showName && profileName) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 28px "Noto Sans Thai", "Sarabun", sans-serif`;
    ctx.fillText(profileName, profileCx, profileCy + profileR + 38);
  }

  // --- 6. Social icons: โค้งลงจาก avatar ซ้าย-ขวา ---
  const validSocials = socials
    .map((s, i) => ({ ...s, img: socialImgs[i] }))
    .filter(s => s.handle.trim());

  const iconSize = 48;
  const iconGap = 12;
  const avatarEdgeGap = 20;
  // ระยะ Y ที่เลื่อนลงต่อ icon (สร้างเอฟเฟกต์โค้ง)
  const curveStep = 30;

  const leftCount = Math.ceil(validSocials.length / 2);
  const leftSocials = validSocials.slice(0, leftCount);
  const rightSocials = validSocials.slice(leftCount);

  // Left socials: ตัวใกล้ avatar อยู่สูง ตัวไกลลาดลงมา
  let lrx = profileCx - profileR - avatarEdgeGap;
  for (let si = 0; si < leftSocials.length; si++) {
    const s = leftSocials[leftSocials.length - 1 - si]; // วาดจากใกล้ avatar ออก
    const ix = lrx - iconSize;
    const iy = profileCy - iconSize / 2 + curveStep * si;
    if (s.img) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(ix + iconSize / 2, iy + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(s.img, ix, iy, iconSize, iconSize);
      ctx.restore();
    }
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = `18px "Noto Sans Thai", "Sarabun", sans-serif`;
    ctx.fillText(s.handle, ix + iconSize / 2, iy + iconSize + 22);
    lrx = ix - iconGap;
  }

  // Right socials: ตัวใกล้ avatar อยู่สูง ตัวไกลลาดลงมา
  let rlx = profileCx + profileR + avatarEdgeGap;
  for (let si = 0; si < rightSocials.length; si++) {
    const s = rightSocials[si];
    const ix = rlx;
    const iy = profileCy - iconSize / 2 + curveStep * si;
    if (s.img) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(ix + iconSize / 2, iy + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(s.img, ix, iy, iconSize, iconSize);
      ctx.restore();
    }
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = `18px "Noto Sans Thai", "Sarabun", sans-serif`;
    ctx.fillText(s.handle, ix + iconSize / 2, iy + iconSize + 22);
    rlx = ix + iconSize + iconGap;
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error('toBlob failed')),
      'image/jpeg',
      0.92
    );
  });
}
