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
  // render ที่ 2x เพื่อป้องกันภาพแตกบน HiDPI/Retina
  const SCALE = 2;
  const canvas = document.createElement('canvas');
  canvas.width = SIZE * SCALE;
  canvas.height = SIZE * SCALE;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(SCALE, SCALE);

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

  // --- 3. Cards ---
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

  // หา representative ratio จากใบแรกที่โหลดสำเร็จ
  const firstImg = cardImgResults.find(img => img !== null);
  const representativeRatio = firstImg
    ? firstImg.naturalWidth / firstImg.naturalHeight
    : 0.68;

  // จอง bottom section ก็ต่อเมื่อมี avatar / ชื่อ / socials จริงๆ
  const hasBottomContent =
    (showAvatar && !!avatarUrl) ||
    (showName && !!profileName) ||
    socials.some(s => s.handle.trim());
  const BOTTOM_H = hasBottomContent ? 160 : 24;
  // พื้นที่ทั้งหมดที่เหลือหลังจาก header (ty) และ bottom section
  const availableH = SIZE - ty - BOTTOM_H;

  // target = ใช้ความสูงเต็มที่มี, ความกว้าง 80% ของ canvas
  const targetW = SIZE * 0.8;
  const targetH = availableH;

  const cardHByW = (targetW - cardGap * (maxColCount - 1)) / (maxColCount * representativeRatio);
  const cardHByH = (targetH - cardGap * (rowCount - 1)) / rowCount;
  const cardH = Math.min(cardHByW, cardHByH);

  const totalGridH = cardH * rowCount + cardGap * (rowCount - 1);

  // วาง cards ชิดต้นหลัง header แล้วกระจาย space ที่เหลือเท่า ๆ กัน
  const spaceAboveCards = Math.max(16, (availableH - totalGridH) * 0.35);
  let rowY = ty + spaceAboveCards;
  for (const row of rows) {
    // คำนวณ cardW ของแต่ละใบจาก ratio จริงของภาพนั้น
    const rowCardWidths = row.map(idx => {
      const img = cardImgResults[idx];
      const ratio = img ? img.naturalWidth / img.naturalHeight : representativeRatio;
      return cardH * ratio;
    });
    const rowW = rowCardWidths.reduce((a, b) => a + b, 0) + (row.length - 1) * cardGap;
    let cx = (SIZE - rowW) / 2;
    for (let ri = 0; ri < row.length; ri++) {
      const img = cardImgResults[row[ri]];
      const cardW = rowCardWidths[ri];
      if (img) drawRoundedImage(ctx, img, cx, rowY, cardW, cardH, 12);
      cx += cardW + cardGap;
    }
    rowY += cardH + cardGap;
  }
  const cardsBottom = rowY - cardGap; // actual bottom edge of last card row

  // --- 4. Bottom section: [socials_left] [avatar+name] [socials_right] ในแถวเดียว ---
  const validSocials = socials
    .map((s, i) => ({ ...s, img: socialImgs[i] }))
    .filter(s => s.handle.trim());

  const iconSize = 42;
  const nameFont = `bold 24px "Noto Sans Thai", "Sarabun", sans-serif`;
  const handleFont = `14px "Noto Sans Thai", "Sarabun", sans-serif`;

  const hasAvatar = showAvatar && avatarImg;
  const hasName = showName && profileName;

  // Profile name: แสดงครบ ถ้ายาวเกินจะลด font size ลงอัตโนมัติ
  const displayName = profileName || '';
  const maxNameWidth = SIZE - PAD * 2;

  // Truncate social handles & measure widths
  ctx.font = handleFont;
  const maxHandleW = 90;
  const truncatedHandles: string[] = [];
  const handleWidths: number[] = [];
  for (const s of validSocials) {
    let h = s.handle;
    while (h.length > 0 && ctx.measureText(h).width > maxHandleW) {
      h = h.slice(0, -1);
    }
    if (h.length < s.handle.length) h = h.slice(0, -1) + '…';
    truncatedHandles.push(h);
    handleWidths.push(Math.max(iconSize, ctx.measureText(h).width));
  }

  // Split socials left / right of avatar
  const leftCount = Math.ceil(validSocials.length / 2);
  const leftSocials = validSocials.slice(0, leftCount);
  const rightSocials = validSocials.slice(leftCount);
  const leftHandles = truncatedHandles.slice(0, leftCount);
  const rightHandles = truncatedHandles.slice(leftCount);
  const leftWidths = handleWidths.slice(0, leftCount);
  const rightWidths = handleWidths.slice(leftCount);

  const profileR = 46;
  const socialItemGap = 14;
  const centerGap = 20; // gap between center and social columns

  // Row vertical center — center bottom section in remaining space below cards
  const rowCenterY = Math.min(SIZE - profileR - 50, Math.round(cardsBottom + (SIZE - cardsBottom) / 2));
  const profileCx = SIZE / 2;

  // --- Draw avatar ---
  if (hasAvatar) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(profileCx, rowCenterY, profileR, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatarImg!, profileCx - profileR, rowCenterY - profileR, profileR * 2, profileR * 2);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(profileCx, rowCenterY, profileR, 0, Math.PI * 2);
    ctx.stroke();
  }

  // --- Name below avatar ---
  if (hasName) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    // ลด font size ลงจนกว่าชื่อจะพอดีกับความกว้าง
    let nameFontSize = 24;
    const minNameFontSize = 14;
    ctx.font = `bold ${nameFontSize}px "Noto Sans Thai", "Sarabun", sans-serif`;
    while (ctx.measureText(displayName).width > maxNameWidth && nameFontSize > minNameFontSize) {
      nameFontSize -= 1;
      ctx.font = `bold ${nameFontSize}px "Noto Sans Thai", "Sarabun", sans-serif`;
    }
    const nameY = hasAvatar ? rowCenterY + profileR + 28 : rowCenterY + 10;
    ctx.fillText(displayName, profileCx, nameY);
  }

  // --- Helper: draw one social item (icon + handle) centered at cx ---
  const drawSocialItem = (s: typeof validSocials[0], handle: string, cx: number) => {
    const iy = rowCenterY - iconSize / 2;
    const ix = cx - iconSize / 2;
    if (s.img) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, rowCenterY, iconSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(s.img, ix, iy, iconSize, iconSize);
      ctx.restore();
    }
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = handleFont;
    ctx.fillText(handle, cx, rowCenterY + iconSize / 2 + 18);
  };

  // --- Left socials: วาดจากขวาไปซ้าย (ใกล้ avatar → ไกล) ---
  let lx = profileCx - (hasAvatar ? profileR : 0) - centerGap;
  for (let i = leftSocials.length - 1; i >= 0; i--) {
    const w = leftWidths[i];
    const cx = lx - w / 2;
    drawSocialItem(leftSocials[i], leftHandles[i], cx);
    lx = cx - w / 2 - socialItemGap;
  }

  // --- Right socials: วาดจากซ้ายไปขวา (ใกล้ avatar → ไกล) ---
  let rx = profileCx + (hasAvatar ? profileR : 0) + centerGap;
  for (let i = 0; i < rightSocials.length; i++) {
    const w = rightWidths[i];
    const cx = rx + w / 2;
    drawSocialItem(rightSocials[i], rightHandles[i], cx);
    rx = cx + w / 2 + socialItemGap;
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error('toBlob failed')),
      'image/jpeg',
      1.0
    );
  });
}
