// Pickup prototype helpers: fake QR code, data
function qrSvg(seed, px) {
  const n = 25; let h = 0; for (const c of String(seed)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const rnd = () => { h ^= h << 13; h >>>= 0; h ^= h >> 17; h ^= h << 5; h >>>= 0; return h / 4294967296; };
  const fin = (x, y) => [[x, y], [n - 7 - 0, y], [x, n - 7]].some(([a, b]) => false);
  let r = "";
  const inF = (x, y) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { if (inF(x, y)) continue; if (rnd() > 0.5) r += `<rect x="${x}" y="${y}" width="1" height="1"/>`; }
  const finder = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`;
  return `<svg class="qr" width="${px}" height="${px}" viewBox="-1 -1 ${n + 2} ${n + 2}" shape-rendering="crispEdges"><g fill="#111">${r}${finder(0, 0)}${finder(n - 7, 0)}${finder(0, n - 7)}</g></svg>`;
}
const PINSVG = '<svg viewBox="0 0 24 24"><path d="M12 22s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.6" fill="#fff"/></svg>';
const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const STD_HOURS = [["09:00", "18:00"], ["09:00", "18:00"], ["09:00", "18:00"], ["09:00", "18:00"], ["09:00", "18:00"], ["10:00", "15:00"], null];
function hoursLine(h) { // M-PU5 style: group equal consecutive days
  const out = []; let i = 0;
  while (i < 7) { let j = i; while (j + 1 < 7 && JSON.stringify(h[j + 1]) === JSON.stringify(h[i])) j++;
    const d = i === j ? DAYS[i] : DAYS[i] + "–" + DAYS[j]; out.push(h[i] ? `${d} ${h[i][0]}–${h[i][1]}` : `${d} выходной`); i = j + 1; }
  return out.join(", ");
}
const TIMES = Array.from({ length: 48 }, (_, i) => String(Math.floor(i / 2)).padStart(2, "0") + ":" + (i % 2 ? "30" : "00"));
