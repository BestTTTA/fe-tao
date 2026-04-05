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
  /** spread id — ใช้จัด layout ไพ่ให้เหมือนหน้า result */
  spreadId?: string;
  /** true = แสดงเฉพาะพื้นหลัง + ไพ่ (ไม่มีคำถาม/ชื่อ deck/avatar/socials) */
  cardsOnly?: boolean;
};

/** layout ต่อ spread — ต้องตรงกับ SPREAD_ROWS ในหน้า result */
const SPREAD_ROWS: Record<string, number[] | "circle" | "celtic"> = {
  "1-card":    [1],
  "2-card":    [2],
  "3-card":    [3],
  "4-card":    [4],
  "5-card":    [3, 2],
  "6-card":    [3, 3],
  "9-card":    [3, 3, 3],
  "10-card":   "celtic",
  "12-card":   [6, 6],
  "12circle":  "circle",
};

function fetchAsImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`status ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        const objUrl = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => { URL.revokeObjectURL(objUrl); resolve(img); };
        img.onerror = () => { URL.revokeObjectURL(objUrl); resolve(null); };
        img.src = objUrl;
      })
      .catch(() => resolve(null));
  });
}

async function loadImg(url: string): Promise<HTMLImageElement | null> {
  if (!url) return null;

  // 1) ถ้าเป็น path ภายในเว็บเรา (/bg/..., /icons/...) โหลดตรงๆ
  const isRelative = url.startsWith("/") && !url.startsWith("//");
  if (isRelative) {
    const img = await fetchAsImage(url);
    if (img) return img;
  }

  // 2) ลองโหลดตรงๆ (กรณี URL ของเรามี CORS header ที่ถูกต้อง)
  if (!isRelative) {
    const direct = await fetchAsImage(url);
    if (direct) return direct;

    // 3) Fallback: ผ่าน /api/proxy-image เพื่อเลี่ยงปัญหา CORS
    //    (เช่น avatar จาก Facebook / Google / etc.)
    const proxied = await fetchAsImage(`/api/proxy-image?url=${encodeURIComponent(url)}`);
    if (proxied) return proxied;
  }

  console.warn("[generateShareImage] failed to load image:", url);
  return null;
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
  const { question, deckName, cardUrls, profileName, showName, avatarUrl, showAvatar, socials, spreadId, cardsOnly } = opts;

  const SIZE = 1080;
  // render ที่ 2x เพื่อป้องกันภาพแตกบน HiDPI/Retina
  const SCALE = 2;
  const canvas = document.createElement('canvas');
  canvas.width = SIZE * SCALE;
  canvas.height = SIZE * SCALE;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(SCALE, SCALE);

  // เลือก background ต่าง path กัน:
  // - cardsOnly (กดดูจากหน้า result) → ใช้ /bg/share-background-cards.jpg
  // - เต็ม (จากปุ่ม 3 จุดบน header)    → ใช้ /bg/share-background.jpg
  const bgPath = cardsOnly ? '/bg/share-background-cards.jpg' : '/bg/share-background.jpg';

  // Load all images in parallel
  const [bgImg, avatarImg, ...cardImgResults] = await Promise.all([
    loadImg(bgPath),
    !cardsOnly && showAvatar && avatarUrl ? loadImg(avatarUrl) : Promise.resolve(null),
    ...cardUrls.map(u => loadImg(u)),
  ]);
  const socialImgs = cardsOnly
    ? []
    : await Promise.all(socials.map(s => loadImg(s.iconUrl)));

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

  let ty = cardsOnly ? 40 : 90;

  if (!cardsOnly) {
    // --- 1. Question ---
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 54px "Noto Sans Thai", "Sarabun", sans-serif`;
    const qLines = wrapText(ctx, question || '', SIZE - PAD * 2);
    for (const line of qLines.slice(0, 2)) {
      ctx.fillText(line, SIZE / 2, ty);
      ty += 66;
    }

    // --- 2. Deck name ---
    ctx.font = `32px "Noto Sans Thai", "Sarabun", sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.80)';
    ctx.fillText(`ไพ่ทาโรต์ ชุด ${deckName}`, SIZE / 2, ty + 8);
    ty += 52;
  }

  // --- 3. Cards ---
  const n = cardImgResults.length;

  // หา representative ratio จากใบแรกที่โหลดสำเร็จ
  const firstImg = cardImgResults.find(img => img !== null);
  const representativeRatio = firstImg
    ? firstImg.naturalWidth / firstImg.naturalHeight
    : 0.68;

  // จอง bottom section ก็ต่อเมื่อมี avatar / ชื่อ / socials จริงๆ
  const hasBottomContent =
    !cardsOnly && (
      (showAvatar && !!avatarUrl) ||
      (showName && !!profileName) ||
      socials.some(s => s.handle.trim())
    );
  const BOTTOM_H = cardsOnly ? 40 : (hasBottomContent ? 160 : 24);
  const availableH = SIZE - ty - BOTTOM_H;
  const targetW = SIZE * 0.95;

  const cardGap = 14;

  // เลือก layout ตาม spreadId (fallback = จัดเองตามจำนวน)
  const layout = spreadId ? SPREAD_ROWS[spreadId] : undefined;

  let cardsBottom = ty;

  if (layout === "celtic" && n >= 1) {
    // 10 ใบ — ซ้าย plus 6 (3x3 เฉพาะตำแหน่ง plus) + ขวา column 4
    // ใช้อัตราส่วนคงที่ 63:105 ให้ตรงกับหน้า result (object-cover)
    const CELTIC_RATIO = 63 / 105;
    const gridCols = 4;
    const gridRows = 4;
    const cardHByW = (targetW - cardGap * (gridCols - 1)) / (gridCols * CELTIC_RATIO);
    const cardHByH = (availableH - cardGap * (gridRows - 1)) / gridRows;
    const cardH = Math.min(cardHByW, cardHByH);
    const cardW = cardH * CELTIC_RATIO;

    const colStep = cardW + cardGap;
    const rowStep = cardH + cardGap;

    // ช่องไฟระหว่างกริดซ้ายกับคอลัมน์ขวา ให้ตรงกับหน้า result (แทบชิดติดกัน)
    const rightColX = 3 * colStep;
    const totalW = rightColX + cardW;
    const totalH = 4 * rowStep - cardGap;

    const startX = (SIZE - totalW) / 2;
    const startY = ty + Math.max(16, (availableH - totalH) * (cardsOnly ? 0.5 : 0.35));

    // ตำแหน่งซ้าย 6 ใบ (plus)
    const leftGrid: Array<[number, number]> = [
      [0, 0], [1, 0],
      [0, 1], [1, 1], [2, 1],
      [1, 2],
    ];
    // left plus สูง 3 แถว, right column สูง 4 แถว → เลื่อนฝั่งซ้ายลงครึ่ง rowStep
    // ให้อยู่กึ่งกลางแนวตั้งเท่ากับคอลัมน์ขวา
    const leftOffsetY = rowStep / 2;
    const positions: Array<{ x: number; y: number }> = [
      ...leftGrid.map(([c, r]) => ({ x: startX + c * colStep, y: startY + r * rowStep + leftOffsetY })),
      { x: startX + rightColX, y: startY + 0 * rowStep },
      { x: startX + rightColX, y: startY + 1 * rowStep },
      { x: startX + rightColX, y: startY + 2 * rowStep },
      { x: startX + rightColX, y: startY + 3 * rowStep },
    ];

    for (let i = 0; i < Math.min(n, 10); i++) {
      const img = cardImgResults[i];
      const p = positions[i];
      if (img && p) drawRoundedImage(ctx, img, p.x, p.y, cardW, cardH, 12);
    }
    cardsBottom = startY + totalH;
  } else if (layout === "circle" && n >= 1) {
    // วงกลม 12 ใบ — อัตราส่วน 44:66 ให้ตรงกับหน้า result
    const CIRCLE_RATIO = 44 / 66;
    const diameter = Math.min(targetW, availableH);
    const cx = SIZE / 2;
    const cy = ty + Math.max(16, (availableH - diameter) * (cardsOnly ? 0.5 : 0.35)) + diameter / 2;
    const cardH = diameter * 0.22;
    const cardW = cardH * CIRCLE_RATIO;
    const r = diameter / 2 - cardH / 2;
    const count = Math.min(n, 12);
    for (let i = 0; i < count; i++) {
      const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
      const x = cx + r * Math.cos(angle) - cardW / 2;
      const y = cy + r * Math.sin(angle) - cardH / 2;
      const img = cardImgResults[i];
      if (img) drawRoundedImage(ctx, img, x, y, cardW, cardH, 10);
    }
    cardsBottom = cy + diameter / 2;
  } else {
    // row-based layout: ใช้ค่าจาก SPREAD_ROWS ถ้ามี ไม่งั้น fallback ตามจำนวน
    let rowCounts: number[];
    if (Array.isArray(layout)) {
      rowCounts = layout;
    } else if (n <= 3) rowCounts = [n];
    else if (n === 4) rowCounts = [2, 2];
    else if (n === 5) rowCounts = [3, 2];
    else if (n === 6) rowCounts = [3, 3];
    else if (n <= 9) rowCounts = [3, 3, n - 6];
    else rowCounts = [4, 4, n - 8];

    const rows: number[][] = [];
    let idx = 0;
    for (const c of rowCounts) {
      rows.push(Array.from({ length: c }, (_, i) => idx + i));
      idx += c;
    }

    const rowCount = rows.length;
    const maxColCount = Math.max(...rows.map(r => r.length));
    const cardHByW = (targetW - cardGap * (maxColCount - 1)) / (maxColCount * representativeRatio);
    const cardHByH = (availableH - cardGap * (rowCount - 1)) / rowCount;
    const cardH = Math.min(cardHByW, cardHByH);
    const totalGridH = cardH * rowCount + cardGap * (rowCount - 1);

    const spaceAboveCards = Math.max(16, (availableH - totalGridH) * (cardsOnly ? 0.5 : 0.35));
    let rowY = ty + spaceAboveCards;
    for (const row of rows) {
      const rowCardWidths = row.map(i => {
        const img = cardImgResults[i];
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
    cardsBottom = rowY - cardGap;
  }

  // --- 4. Bottom section ---
  // Row A (บน): [avatar] [name]  (inline, avatar อยู่หน้าชื่อ)
  // Row B (ล่าง): socials เรียงกึ่งกลาง (icon + handle ใต้ icon)
  if (!cardsOnly) {
    const validSocials = socials
      .map((s, i) => ({ ...s, img: socialImgs[i] }))
      .filter(s => s.handle.trim());

    const iconSize = 22;
    const iconTextGap = 6;
    const handleFont = `14px "Noto Sans Thai", "Sarabun", sans-serif`;

    const hasAvatar = showAvatar && !!avatarImg;
    const hasName = showName && !!profileName;
    const displayName = profileName || '';

    const profileR = 30;
    const avatarNameGap = 14;
    const socialItemGap = 22;
    const rowGap = 18;

    // --- คำนวณขนาดของ Row A (avatar + name) ---
    let nameFontSize = 28;
    const minNameFontSize = 14;
    const maxNameWidth = SIZE - PAD * 2 - (hasAvatar ? profileR * 2 + avatarNameGap : 0);
    if (hasName) {
      ctx.font = `bold ${nameFontSize}px "Noto Sans Thai", "Sarabun", sans-serif`;
      while (ctx.measureText(displayName).width > maxNameWidth && nameFontSize > minNameFontSize) {
        nameFontSize -= 1;
        ctx.font = `bold ${nameFontSize}px "Noto Sans Thai", "Sarabun", sans-serif`;
      }
    }
    const nameWidth = hasName
      ? ctx.measureText(displayName).width
      : 0;
    const rowAWidth =
      (hasAvatar ? profileR * 2 : 0) +
      (hasAvatar && hasName ? avatarNameGap : 0) +
      nameWidth;
    const rowAHeight = Math.max(hasAvatar ? profileR * 2 : 0, hasName ? nameFontSize : 0);

    // --- คำนวณขนาดของ Row B (socials: icon อยู่ด้านซ้ายของ handle) ---
    ctx.font = handleFont;
    const maxHandleW = 130;
    const truncatedHandles: string[] = [];
    const handleTextWidths: number[] = [];
    for (const s of validSocials) {
      let h = s.handle;
      while (h.length > 0 && ctx.measureText(h).width > maxHandleW) {
        h = h.slice(0, -1);
      }
      if (h.length < s.handle.length) h = h.slice(0, -1) + '…';
      truncatedHandles.push(h);
      handleTextWidths.push(ctx.measureText(h).width);
    }
    // แต่ละ item = icon ซ้าย + handle ขวา (อยู่แถวเดียวกัน)
    const itemWidths = handleTextWidths.map((w) => iconSize + iconTextGap + w);
    const rowBWidth = validSocials.length > 0
      ? itemWidths.reduce((a, b) => a + b, 0) + socialItemGap * (validSocials.length - 1)
      : 0;
    const rowBHeight = validSocials.length > 0 ? iconSize : 0;

    // --- จัดวางแนวตั้ง: center ใน space ใต้ไพ่ ---
    const totalBottomH =
      (rowAHeight > 0 ? rowAHeight : 0) +
      (rowAHeight > 0 && rowBHeight > 0 ? rowGap : 0) +
      (rowBHeight > 0 ? rowBHeight : 0);
    const bottomAreaStart = cardsBottom + 20;
    const bottomAreaEnd = SIZE - 30;
    const bottomAreaH = bottomAreaEnd - bottomAreaStart;
    const startY = bottomAreaStart + Math.max(0, (bottomAreaH - totalBottomH) / 2);

    // --- Draw Row A: avatar + name ---
    let rowAY = startY;
    if (rowAHeight > 0) {
      const rowACenterY = rowAY + rowAHeight / 2;
      let drawX = (SIZE - rowAWidth) / 2;

      if (hasAvatar) {
        const avCx = drawX + profileR;
        ctx.save();
        ctx.beginPath();
        ctx.arc(avCx, rowACenterY, profileR, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatarImg!, avCx - profileR, rowACenterY - profileR, profileR * 2, profileR * 2);
        ctx.restore();
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(avCx, rowACenterY, profileR, 0, Math.PI * 2);
        ctx.stroke();
        drawX += profileR * 2 + (hasName ? avatarNameGap : 0);
      }

      if (hasName) {
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${nameFontSize}px "Noto Sans Thai", "Sarabun", sans-serif`;
        ctx.fillText(displayName, drawX, rowACenterY);
        ctx.textBaseline = 'alphabetic';
      }
      rowAY += rowAHeight + rowGap;
    }

    // --- Draw Row B: socials centered (icon ซ้าย, handle ขวา — อยู่แถวเดียวกัน) ---
    if (rowBHeight > 0) {
      const rowBCenterY = rowAY + iconSize / 2;
      let sx = (SIZE - rowBWidth) / 2;
      for (let i = 0; i < validSocials.length; i++) {
        const s = validSocials[i];
        const itemW = itemWidths[i];
        const iconCx = sx + iconSize / 2;

        // icon (วงกลม)
        if (s.img) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(iconCx, rowBCenterY, iconSize / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(
            s.img,
            iconCx - iconSize / 2,
            rowBCenterY - iconSize / 2,
            iconSize,
            iconSize
          );
          ctx.restore();
        }

        // handle text ด้านขวาของ icon — จัดกึ่งกลางแนวตั้งตรงกับ icon
        // ใช้ actualBoundingBox เพื่อให้กึ่งกลางแม่นยำกับฟอนต์ไทย (ที่มี ascender/descender ไม่สมมาตร)
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#ffffff';
        ctx.font = handleFont;
        const tm = ctx.measureText(truncatedHandles[i]);
        const ascent = tm.actualBoundingBoxAscent;
        const descent = tm.actualBoundingBoxDescent;
        const textY = rowBCenterY + (ascent - descent) / 2;
        ctx.fillText(truncatedHandles[i], sx + iconSize + iconTextGap, textY);

        sx += itemW + socialItemGap;
      }
    }
  } // end if (!cardsOnly)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error('toBlob failed')),
      'image/jpeg',
      1.0
    );
  });
}
