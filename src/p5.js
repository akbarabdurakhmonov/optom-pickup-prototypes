// P-PU5 Notifications for pickup: push in the apps, list + toast on the website and in the apps, SMS with the code
const T = {
  "DLV-04": { to: "b", btn: ["Показать QR-код", "Маршрут"], ru: ["Заказ №{order_no} готов к выдаче", "Заберите его до {date}: {address}. Покажите QR-код из заказа."], uz: ["#{order_no} buyurtmani olib ketish mumkin", "Uni {date} gacha oling: {address}. Buyurtmadagi QR kodni ko‘rsating."], en: ["Order #{order_no} is ready for pickup", "Collect it by {date}: {address}. Show the QR code from the order."] },
  "DLV-05": { to: "b", btn: ["Маршрут"], ru: ["Заказ №{order_no} ждёт вас", "Заберите его до {date}: {address}. Иначе заказ будет отменён."], uz: ["#{order_no} buyurtma sizni kutmoqda", "Uni {date} gacha oling: {address}. Aks holda buyurtma bekor qilinadi."], en: ["Order #{order_no} is waiting for you", "Collect it by {date}: {address}. Otherwise it will be cancelled."] },
  "DLV-06": { to: "b", ru: ["Заказ №{order_no} не забрали", "Срок хранения истёк, заказ отменён. К возврату: {amount} сум."], uz: ["#{order_no} buyurtma olib ketilmadi", "Saqlash muddati tugadi va buyurtma bekor qilindi. Qaytariladigan summa: {amount} so‘m."], en: ["Order #{order_no} not collected", "The storage period ended and the order was cancelled. Refund: {amount} so‘m."] },
  "N-PU2 (DLV-06, refusal)": { to: "b", ru: ["Вы отказались от заказа №{order_no}", "Заказ отменён. К возврату: {amount} сум."], uz: ["#{order_no} buyurtmadan voz kechdingiz", "Buyurtma bekor qilindi. Qaytariladigan summa: {amount} so‘m."], en: ["You refused order #{order_no}", "The order is cancelled. Refund: {amount} so‘m."] },
  "DLV-08": { to: "b", btn: ["Открыть заказ"], ru: ["Заказ №{order_no} выдан", "Спасибо! Если с товаром что-то не так, оформите возврат."], uz: ["#{order_no} buyurtma topshirildi", "Rahmat! Mahsulotda muammo bo‘lsa, qaytarish so‘rang."], en: ["Order #{order_no} handed over", "Thank you! If something is wrong with the goods, request a return."] },
  "N-PU1 (DLV-10, new)": { to: "b", ru: ["Заказ №{order_no} выдан без кода", "Заказ выдали без вашего кода. Если вы его не получали, обратитесь в поддержку."], uz: ["#{order_no} buyurtma kodsiz topshirildi", "Buyurtma kodingizsiz topshirildi. Uni olmagan bo‘lsangiz, qo‘llab-quvvatlashga murojaat qiling."], en: ["Order #{order_no} given without code", "It was handed over without your code. If you did not collect it, contact support."] },
  "SOR-01": { to: "s", btn: ["Открыть заказ"], ru: ["Новый заказ №{order_no}", "Товаров: {items}, сумма {amount} сум. Подтвердите заказ в течение 24 часов."], uz: ["Yangi buyurtma #{order_no}", "{items} ta mahsulot, {amount} so‘m. 24 soat ichida tasdiqlang."], en: ["New order #{order_no}", "{items} items for {amount} so‘m. Confirm within 24 hours."] },
  "SOR-04": { to: "s", ru: ["Покупатель отменил заказ №{order_no}", "Не отправляйте и не передавайте товары."], uz: ["Xaridor #{order_no} buyurtmani bekor qildi", "Mahsulotlarni jo‘natmang va topshirmang."], en: ["Buyer cancelled order #{order_no}", "Do not ship or hand over the goods."] },
  "DLV-07": { to: "s", ru: ["Заказ №{order_no} не забрали", "Срок хранения истёк. Заказ отменён, товары остаются у вас."], uz: ["#{order_no} buyurtma olib ketilmadi", "Saqlash muddati tugadi. Buyurtma bekor qilindi, mahsulotlar sizda qoladi."], en: ["Order #{order_no} not collected", "The storage period ended. The order is cancelled; keep the goods."] },
  "N-PU3 (DLV-07, refusal)": { to: "s", ru: ["Отказ от заказа №{order_no}", "Покупатель отказался, заказ отменён. Верните товар на склад."], uz: ["#{order_no} buyurtmadan voz kechildi", "Xaridor buyurtmadan voz kechdi, u bekor qilindi. Mahsulotlarni omborga qaytaring."], en: ["Buyer refused order #{order_no}", "The order is cancelled. Return the goods to stock."] },
};
const SMS = { ru: "Optom: заказ {order_no} готов. Код {code}. Заберите до {date}.", uz: "Optom: {order_no} buyurtma tayyor. Kod {code}. {date} gacha oling.", en: "Optom: order {order_no} is ready. Code {code}. Collect by {date}." };
const EX = { order_no: "2610250001", date: "16.10.2026", address: "Ташкент, ул. Бунёдкор, 12", amount: "16 700 000", items: "3", code: "482915" };
const LONG = { order_no: "1234567890", date: "16.10.2026", address: "x".repeat(60), amount: "x".repeat(11), items: "999", code: "123456" };
const fill = (t, v) => t.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? k);
let S = {};
function reset(o) { closeModal(); S = Object.assign({ view: "bapp", lang: "ru", open: true }, o || {}); render(); }
const L = k => T[k][S.lang];
function langSw() { return `<div class="langsw" style="margin:0 0 14px">${["ru", "uz", "en"].map(l => `<span class="${S.lang === l ? "on" : ""}" data-l="${l}">${l.toUpperCase()}</span>`).join("")}<span class="small muted">язык получателя</span></div>`; }
function push(k, time) {
  const t = L(k), b = T[k].btn;
  return `<div class="push"><span class="ap">o</span><div style="flex:1"><div class="meta"><span>OPTOM · ${k}</span><span>${time}</span></div><div class="tt">${fill(t[0], EX)}</div><div class="tx">${fill(t[1], EX)}</div>${b ? `<div class="acts2">${b.map(x => `<span>${x}</span>`).join("")}</div>` : ""}</div></div>`;
}
function phone(inner, title) { return `<div class="phonewrap"><div class="phone">${inner}</div></div>`; }
function lock(keys) {
  return phone(`<div class="lockscreen"><div class="clock">10:00</div><div class="date">вторник, 15 октября</div>${keys.map((k, i) => push(k, i ? `${i * 7 + 2} мин назад` : "сейчас")).join("")}</div>`);
}
function webList(keys, seller) {
  const items = keys.map((k, i) => `<div class="it ${i < 2 ? "unread" : "read"}"><span class="dt"></span><div><b>${fill(L(k)[0], EX)}</b><div class="small">${fill(L(k)[1], EX)}</div><div class="small muted">${i ? (i * 11) + " мин назад" : "сейчас"}</div></div></div>`).join("");
  const toastH = `<div class="notif" style="position:fixed;left:50%;transform:translateX(-50%);bottom:24px;z-index:30"><span class="ic2">o</span><div><b>${fill(L(keys[0])[0], EX)}</b><div class="small">${fill(L(keys[0])[1], EX)}</div></div></div>`;
  const panel = S.open ? `<div class="nlist"><div class="hd"><span>Уведомления</span><span class="small muted">Прочитать все</span></div>${items}</div>` : "";
  const bell = `<span class="bellc" id="bell" style="cursor:pointer">${ICON.bell.replace("<svg", '<svg width="20" height="20" fill="none" stroke="#38383b" stroke-width="1.6"')}<span class="cnt2">2</span></span>`;
  if (seller) return sellerShell("or", "<b>Заказы</b>", `<div style="position:relative">${panel}</div><div class="h1">Заказы <span style="margin-left:auto">${bell}</span></div>${langSw()}<div class="card"><p class="sub">Список уведомлений (колокольчик) и всплывающее сообщение, когда кабинет открыт. Push в браузер не отправляется (N8).</p></div>${toastH}`);
  return `<div class="buyer"><div class="strip"><span>➤ Ташкент, Чиланзар, 9-й квартал, 14</span><span></span></div><div class="bh" style="position:relative">${LOGO}<button class="btn pri">☰ Каталог</button><div class="srch"><input placeholder="Что вы ищете?"><button>Найти</button></div>${bell}<span class="small">Профиль</span>${panel}</div>
    <div class="wrapb">${langSw()}<p class="sub">Сайт покупателя: уведомления только в списке (колокольчик) и всплывающим сообщением, когда страница открыта. Push в браузер не отправляется (N8).</p></div>${toastH}</div>`;
}
function smsView() {
  return `<div style="display:flex;gap:30px;justify-content:center;flex-wrap:wrap">${["ru", "uz", "en"].map(l => `<div class="phone" style="min-height:420px"><div class="sb"><span>9:41</span><span>▮▮▮ ◔</span></div><div class="sms"><div class="hd">Optom${l === "ru" ? " · покупатель (RU)" : l === "uz" ? " · получатель (UZ, язык покупателя)" : " · EN"}</div><div class="bub">${fill(SMS[l], EX)}</div><div class="tm">Сегодня 11:20</div></div></div>`).join("")}</div>
   <p class="hint" style="text-align:center">SMS-PU1 уходит при переходе 25 → 32 на телефон покупателя и, если указан, получателя (один раз, если номер совпадает). Настройки уведомлений на SMS не влияют.</p>`;
}
function gsm(t) { return /^[\x20-\x7E\n]*$/.test(t); }
function lenView() {
  const rows = Object.keys(T).map(k => { const t = L(k), a = fill(t[0], LONG).length, b = fill(t[1], LONG).length;
    return `<tr><td><b>${k}</b></td><td>${T[k].to === "b" ? "Покупатель" : "Продавец"}</td><td>${t[0]}<div class="small muted">${t[1]}</div></td><td class="${a <= 40 ? "lenok" : "lenbad"}">${a}/40</td><td class="${b <= 130 ? "lenok" : "lenbad"}">${b}/130</td></tr>`; }).join("");
  const s = fill(SMS[S.lang], LONG), lim = gsm(s) ? 160 : 70;
  return sellerShell("or", "<b>Тексты уведомлений самовывоза</b>", `<div class="h1">Тексты и проверка длины</div>${langSw()}<div class="card"><table class="t"><thead><tr><th>ID</th><th>Кому</th><th>Заголовок / текст</th><th>Заголовок</th><th>Текст</th></tr></thead><tbody>${rows}</tbody></table>
    <p class="hint">Проверка с самыми длинными значениями: номер заказа 10 цифр, сумма 11 символов, адрес 60 символов (адрес длиннее обрезается с «…»).</p></div>
    <div class="card"><h3>SMS-PU1</h3><p>${SMS[S.lang]}</p><p class="${s.length <= lim ? "lenok" : "lenbad"}">${s.length}/${lim} (${gsm(s) ? "GSM-7" : "Unicode"}), одна SMS</p></div>`);
}
function render() {
  const v = S.view;
  $("#app").innerHTML = v === "bapp" ? `<div style="text-align:center;padding-top:14px">${langSw()}</div>` + lock(["DLV-04", "DLV-05", "N-PU1 (DLV-10, new)", "DLV-08", "N-PU2 (DLV-06, refusal)"])
    : v === "sapp" ? `<div style="text-align:center;padding-top:14px">${langSw()}</div>` + lock(["SOR-01", "SOR-04", "DLV-07", "N-PU3 (DLV-07, refusal)"])
    : v === "bweb" ? webList(["DLV-04", "DLV-05", "DLV-08", "DLV-06"]) : v === "sweb" ? webList(["SOR-01", "DLV-07", "SOR-04", "N-PU3 (DLV-07, refusal)"], true)
    : v === "sms" ? `<div style="padding:20px">${smsView()}</div>` : lenView();
  document.querySelectorAll("[data-l]").forEach(x => x.onclick = () => { S.lang = x.dataset.l; render(); });
  const b = $("#bell"); if (b) b.onclick = () => { S.open = !S.open; render(); };
}
harness({ title: "P-PU5 Pickup notifications: push, list and SMS", stories: "US-BF-8.1-04 · US-BF-8.1-05", version: "1.0" }, [
  { label: "Buyer app: push notifications", apply: () => reset({ view: "bapp" }), notes: ["Push to the buyer app when it is closed or in the background: DLV-04 with «Показать QR-код» and «Маршрут», DLV-05 at 10:00 on day 2, DLV-10 (new) for a handover without code, DLV-08 with «Открыть заказ» (no «Подтвердить получение», N5), the refusal text of DLV-06 (US-BF-8.1-04 AC1 – AC6).", "Switch RU / UZ / EN: the recipient's interface language (AC16). The code is never in a push (AC1)."], src: "Pickup PRD 8, 13.3a · Notifications PRD catalogue" },
  { label: "Buyer website: notification list and toast", apply: () => reset({ view: "bweb" }), notes: ["The website has no push (N8): the bell list with the unread counter and a toast when the page is open (AC10, AC11). Click the bell to close or open the list."], src: "PRD 8, N8" },
  { label: "Seller app: push notifications", apply: () => reset({ view: "sapp" }), notes: ["Seller app: SOR-01 for a new paid pickup order, SOR-04 when the buyer cancels («Не отправляйте и не передавайте товары»), DLV-07 and its refusal text N-PU3 (AC3, AC4, AC7, AC8)."], src: "PRD 8" },
  { label: "Seller cabinet: notification list", apply: () => reset({ view: "sweb" }), notes: ["Seller cabinet on the website: list and toast only (AC11)."], src: "PRD 8" },
  { label: "SMS with the handover code", apply: () => reset({ view: "sms" }), notes: ["SMS-PU1 to the buyer and to the recipient (in the buyer's language) when the order becomes ready (US-BF-8.1-05 AC1 – AC5). Example code 482915; {date} = last storage day."], src: "PRD 13.3, PU-B9" },
  { label: "Texts and length check", apply: () => reset({ view: "len" }), notes: ["Live length check with the longest values: title ≤ 40, text ≤ 130; SMS one segment (70 Unicode for Russian, 160 GSM-7 for Uzbek and English) (US-BF-8.1-04 AC17, US-BF-8.1-05 AC5). Switch the language."], src: "PRD 13.3, 13.3a" },
]);
