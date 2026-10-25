// P-PU2 Buyer: checkout with pickup and the order page
const SELLER = "ООО «Холод Сервис»";
const BRS = [
  { id: "ch", n: "Филиал Чиланзар", a: "Ташкент, Чиланзарский р-н, ул. Бунёдкор, 12", km: 2.1, x: 30, y: 62, h: STD_HOURS, ph: "+998 90 123 45 67", note: "Ворота 3, склад Б, позвоните в звонок" },
  { id: "yu", n: "Филиал Юнусабад", a: "Ташкент, Юнусабадский р-н, ул. Амира Темура, 107", km: 6.4, x: 58, y: 18, h: STD_HOURS, ph: "+998 90 555 11 22", note: "" },
  { id: "mu", n: "Филиал Мирзо-Улугбек", a: "Ташкент, Мирзо-Улугбекский р-н, ул. Буюк Ипак Йули, 30", km: 7.5, x: 82, y: 40, h: STD_HOURS, ph: "+998 90 777 33 44", note: "" },
  { id: "se", n: "Склад Сергели", a: "Ташкент, Сергелийский р-н, ул. Янги Сергели, 45", km: 9.8, x: 40, y: 88, h: [["08:00", "17:00"], ["08:00", "17:00"], ["08:00", "17:00"], ["08:00", "17:00"], ["08:00", "17:00"], ["08:00", "13:00"], null], ph: "+998 71 200 10 10", note: "Въезд для грузовых машин с ул. Янги Сергели" }];
const ADDR = "Ташкент, Чиланзар, 9-й квартал, 14";
const ME = { x: 26, y: 55 };
const ITEMS = [["Холодильник Artel HD 455", 2, 6300000], ["Морозильный ларь Artel 300", 1, 4100000]];
const TOTAL = ITEMS.reduce((a, i) => a + i[1] * i[2], 0);
let S = {};
function reset(o) {
  closeModal(); document.querySelectorAll(".addrpick").forEach(x => x.remove());
  S = Object.assign({ view: "checkout", recv: null, sel: null, def: null, hasAddr: true, noStock: ["mu"], saveDef: false, msg: "", payFail: false, reFail: false, st: 16, mobile: false, cancelled: false, sheet: null, tab: "list", mapSel: null, recip: true }, o || {});
  if (S.view === "checkout") preselect();
  render();
}
const avail = b => !S.noStock.includes(b.id) && !(S.off || []).includes(b.id);
function sorted() {
  return BRS.slice().sort((a, b) => (avail(b) - avail(a)) || (S.hasAddr ? a.km - b.km : 0) || a.n.localeCompare(b.n, "ru"));
}
function preselect() {
  const av = BRS.filter(avail);
  if (!av.length) { S.recv = "addr"; S.sel = null; return; }
  if (S.recv === null) S.recv = S.def ? "pu" : "addr";
  const d = BRS.find(b => b.id === S.def);
  if (d && avail(d)) { S.sel = d.id; return; }
  if (S.hasAddr) { S.sel = av.slice().sort((a, b) => a.km - b.km)[0].id; return; }
  S.sel = null;
}
function header() {
  return `<div class="strip"><span>➤ ${S.hasAddr ? ADDR : "Укажите адрес доставки"}</span><span><span>О компании</span><span>Связаться с нами</span><span>Доставка и оплата</span></span></div>
  <div class="bh">${LOGO}<button class="btn pri">☰ Каталог</button><div class="srch"><input placeholder="Что вы ищете?"><button>Найти</button></div><span class="small">Русский · Избранное · Корзина · Профиль</span></div>`;
}
const todayH = b => b.h[0] ? `Сегодня: ${b.h[0][0]}–${b.h[0][1]}` : "Сегодня выходной";
function badge(b) {
  if (b.id === S.def) return '<span class="badge">Ваш пункт самовывоза по умолчанию</span>';
  const av = BRS.filter(avail).sort((x, y) => x.km - y.km);
  if (S.hasAddr && av[0] && av[0].id === b.id) return '<span class="badge n">Ближайший к вашему адресу</span>';
  return "";
}
function brCard(b) {
  return `<div class="brcard"><div class="row" style="justify-content:space-between;align-items:flex-start"><div><span class="nm">${b.n}</span>${badge(b)}<div class="small mt8">${b.a}</div></div><button class="btn out sm" id="chg">Изменить</button></div>
    <div class="kv mt8">${ICON.cal}<div><b>${todayH(b)}</b> · ${hoursLine(b.h)}</div></div>
    ${b.note ? `<div class="kv">${ICON.pin}<div>${b.note}</div></div>` : ""}<div class="kv">${ICON.phone}<div>${b.ph}${S.hasAddr ? ` · ${String(b.km).replace(".", ",")} км от вашего адреса` : ""}</div></div>
    ${b.id === S.def ? "" : `<label class="chk mt8"><input type="checkbox" id="sdef" ${S.saveDef ? "checked" : ""}> Сделать пунктом самовывоза по умолчанию для ${SELLER}</label>`}
    <p class="hint mt8">Заказ хранится 3 дня после того, как продавец сообщит о готовности.</p></div>`;
}
function checkout() {
  const av = BRS.filter(avail), puOk = av.length > 0, pu = S.recv === "pu";
  const b = BRS.find(x => x.id === S.sel);
  const recvBlk = `<div class="blk"><h2>Способ получения</h2><div class="box">
      <div class="opt" id="rpu" style="cursor:${puOk ? "pointer" : "not-allowed"};${puOk ? "" : "color:var(--muted)"}"><span class="radio ${pu ? "on" : ""}"></span><div><b>Самовывоз</b><div class="small muted">${puOk ? "Заберите заказ самостоятельно со склада или филиала продавца" : '<span style="color:var(--red)">Самовывоз недоступен: ни в одном филиале нет всех товаров.</span>'}</div></div></div>
      <div class="opt" id="raddr" style="cursor:pointer"><span class="radio ${pu ? "" : "on"}"></span><div><b>Адрес доставки</b><div class="small muted">${ADDR}</div></div></div></div>
      ${pu ? (b ? brCard(b) : `<button class="btn out mt12" id="chg">Выберите пункт самовывоза</button>`) : ""}
      ${S.msg ? `<div class="alert e mt12"><span class="ic">!</span><div>${S.msg}</div></div>` : ""}</div>`;
  const tiles = pu ? "" : `<div class="blk"><h2>Способ доставки</h2><div class="ycard on"><span class="r"></span><div style="flex:1">${FARGO}<div class="small muted">до 7 дней</div></div><b>${som(30000)}</b></div></div>`;
  const recip = `<div class="blk"><h2>Получатель — человек, который заберёт заказ <span class="small muted">(необязательно)</span></h2><div class="grid2"><input class="inp" value="${S.recip ? "Шерзод Каримов" : ""}" placeholder="Имя"><input class="inp" value="${S.recip ? "+998 93 410 45 67" : ""}" placeholder="+998 XX XXX XX XX"></div>${pu ? '<p class="hint">Получатель тоже получит SMS с кодом выдачи.</p>' : ""}</div>`;
  const deliv = pu ? 0 : 30000, ready = pu ? !!b : true;
  return `<div class="buyer">${header()}<div class="wrapb"><h1 style="font-size:30px;margin:0 0 20px">Оформление заказа</h1><div class="cg"><div>${recvBlk}${tiles}
    <div class="blk"><h2>Товары · ${SELLER}</h2>${ITEMS.map(i => `<div class="row mt8"><span class="thumb"></span><div style="flex:1">${i[0]}<div class="small muted">${i[1]} шт. × ${som(i[2])}</div></div></div>`).join("")}</div>${recip}</div>
    <div class="sumc"><h3 style="margin:0 0 8px">Ваша корзина</h3><div class="ln">Товары<b>${som(TOTAL)}</b></div><div class="ln">Доставка<b>${pu ? "0 сум" : som(deliv)}</b></div>
      <div class="tot"><span>Итого</span><span>${som(TOTAL + deliv)}</span></div><button class="btn pri big" id="pay" ${ready ? "" : "disabled"}>Оформить заказ</button>
      ${ready ? "" : '<p class="small muted mt8">Выберите пункт самовывоза</p>'}</div></div></div></div>`;
}
function sheet() {
  const rows = sorted().map(b => { const ok = avail(b);
    return `<div class="bl ${ok ? "" : "dis"} ${S.sel === b.id ? "sel" : ""}" ${ok ? `data-pick="${b.id}"` : ""}><div><b>${b.n}</b>${ok ? badge(b) : ""}<div class="small">${b.a}</div><div class="small muted">${todayH(b)}</div>${ok ? "" : '<div class="why">В этом филиале есть не все товары</div>'}</div><div class="small">${S.hasAddr ? String(b.km).replace(".", ",") + " км" : ""}</div></div>`; }).join("");
  const ms = BRS.find(b => b.id === S.mapSel);
  const map = `<div class="map"><div class="river"></div>${S.hasAddr ? `<div class="me" style="left:${ME.x}%;top:${ME.y}%" title="Ваш адрес"></div>` : ""}
    ${BRS.map(b => `<div class="pinm ${avail(b) ? "" : "dis"} ${S.mapSel === b.id ? "sel" : ""}" style="left:${b.x}%;top:${b.y}%" data-pin="${b.id}">${PINSVG}<small>${b.n.replace("Филиал ", "")}</small></div>`).join("")}
    ${ms ? `<div class="mcard"><b>${ms.n}</b>${avail(ms) ? badge(ms) : ""}<div class="small">${ms.a} · ${todayH(ms)}</div>${avail(ms) ? `<button class="btn pri sm mt8" data-pick="${ms.id}">Выбрать</button>` : '<div class="small" style="color:var(--red)">В этом филиале есть не все товары</div>'}</div>` : ""}</div>`;
  return `<h3>Выберите пункт самовывоза</h3><div class="ptabs"><span class="${S.tab === "list" ? "on" : ""}" data-tab="list">Список</span><span class="${S.tab === "map" ? "on" : ""}" data-tab="map">Карта</span></div>
    ${S.tab === "list" ? `<div class="blist" style="max-height:420px;overflow:auto">${rows}</div>` : map}<div class="acts"><button class="btn out" id="shclose">Закрыть</button></div>`;
}
function openSheet() { const m = modal(sheet()); m.querySelector(".modal").style.width = "620px"; bindSheet(m); }
function bindSheet(m) {
  m.querySelectorAll("[data-tab]").forEach(x => x.onclick = () => { S.tab = x.dataset.tab; m.querySelector(".modal").innerHTML = sheet(); bindSheet(m); });
  m.querySelectorAll("[data-pin]").forEach(x => x.onclick = () => { S.mapSel = x.dataset.pin; m.querySelector(".modal").innerHTML = sheet(); bindSheet(m); });
  m.querySelectorAll("[data-pick]").forEach(x => x.onclick = () => { S.sel = x.dataset.pick; S.saveDef = false; S.msg = ""; closeModal(); render(); toast("Пересчёт: доставка 0 сум"); });
  $("#shclose", m).onclick = closeModal;
}
function payDialog() {
  const m = modal(`<h3>Paylov · оплата картой</h3><p class="sub">Сумма: <b>${som(TOTAL)}</b>. Это имитация страницы оплаты.</p><div class="field"><label>Номер карты</label><input class="inp" value="8600 •••• •••• 1234" disabled></div>
    <div class="acts"><button class="btn out" id="pcancel">Закрыть оплату</button><button class="btn pri" id="pok">Оплатить</button></div><div class="demo-acts"><button id="pfail">демо: оплата не прошла</button></div>`);
  $("#pcancel", m).onclick = () => { closeModal(); toast("Оплата не завершена. Заказ не создан."); };
  $("#pfail", m).onclick = () => { closeModal(); toast("Оплата не прошла. Заказ не создан."); };
  $("#pok", m).onclick = () => {
    closeModal();
    if (S.reFail) { S.reFail = false; S.off = [S.sel]; S.sel = null; S.msg = "Этот пункт самовывоза больше недоступен. Выберите другой пункт или доставку."; render(); return toast("Оплата будет возвращена ⚑ OQ-PU32"); }
    if (S.saveDef) S.def = S.sel;
    S.view = "order"; S.st = 16; render(); toast("Оплата прошла. Заказ №2610250001 создан.");
  };
}
// ---------- order page ----------
function orderPage() {
  const b = BRS.find(x => x.id === (S.sel || "ch"));
  const idx = { 16: 0, 25: 1, 32: 2, 35: 3, 40: 3 }[S.st];
  const stp = ["Принят", "Упаковка", "Готов к выдаче", "Получен"].map((t, k) => `<div class="step ${idx !== undefined && k <= idx ? "on" : ""}"><div class="dot">${["▤", "▢", "⌂", "✓"][k]}</div>${t}</div>`).join("");
  let box = "";
  if (S.st === 16 || S.st === 25) box = `<p class="sub mt8">Продавец собирает заказ. Мы сообщим, когда он будет готов к выдаче.</p><button class="btn dan sm mt12" id="bcancel">Отменить заказ</button>`;
  if (S.st === 32) box = `<div class="alert s mt8"><span class="ic">✓</span><div><b>Готов к выдаче. Заберите до 16.10.2026.</b></div></div>
      <div class="qrwrap">${qrSvg("2610250001", S.mobile ? 170 : 190)}<div><div class="small muted">Покажите этот QR-код в пункте выдачи или назовите код:</div><div class="hcode">482 915</div><p class="hint">Код также отправлен по SMS вам и получателю.</p></div></div>
      <button class="btn dan sm mt12" id="bcancel">Отменить заказ</button>`;
  if (S.st === 35) box = `<div class="alert s mt8"><span class="ic">✓</span><div><b>Получен 15.10.2026 в 09:40</b></div></div><button class="btn out sm mt12">Оставить отзыв</button>`;
  if (S.st === 48) box = `<div class="alert e mt8"><span class="ic">!</span><div><b>${S.refused ? "Вы отказались от заказа в пункте выдачи. Заказ отменён." : "Заказ не забрали до 16.10.2026, он отменён."}</b>К возврату: ${som(TOTAL)} (возврат денег ⚑ OQ-PU13).</div></div>`;
  if (S.st === 41) box = `<div class="alert e mt8"><span class="ic">!</span><div><b>Заказ отменён</b>Вы отменили заказ №2610250001. К возврату: ${som(TOTAL)}.</div></div>`;
  const brBlk = `<div class="kv">${ICON.store}<div><span class="k">Самовывоз:</span> <b>${b.n}</b> · ${b.a}</div></div><div class="kv">${ICON.cal}<div><span class="k">Часы работы:</span> ${hoursLine(b.h)}</div></div>
    <div class="kv">${ICON.phone}<div>${b.ph}</div></div>${b.note ? `<div class="kv">${ICON.pin}<div><span class="k">Как нас найти:</span> ${b.note}</div></div>` : ""}<button class="btn soft sm mt8" id="route">➤ Маршрут</button>`;
  const inner = `<h1 style="font-size:28px;margin:0 0 18px">Заказ: 2610250001</h1>${S.st === 48 || S.st === 41 ? "" : `<div class="steps">${stp}</div>`}
    <div class="track"><div class="row" style="justify-content:space-between"><b>⌂ Самовывоз · Доставка: 0 сум</b><span class="small">${SELLER}</span></div>${box}<div class="mt12" style="border-top:1px solid var(--line);padding-top:10px">${brBlk}</div></div>`;
  if (S.mobile) return `<div class="phonewrap"><div class="phone"><div class="sb"><span>9:41</span><span>▮▮▮ ◔</span></div><div class="ah"><span>‹</span><b>Заказ 2610250001</b></div><div class="pc" style="padding-bottom:80px"><div class="card">${inner.replace(/<h1[^>]*>.*?<\/h1>/, "")}</div></div>
    <div class="tabbar"><span>Главная</span><span>Каталог</span><span>Корзина</span><span class="on">Заказы</span><span>Профиль</span></div></div></div>`;
  return `<div class="buyer">${header()}<div class="wrapb"><div class="oc"><div>${inner}</div><div class="sumc"><h3 style="margin:0 0 8px">Ваш заказ</h3><div class="ln">3 товара<b>${som(TOTAL)}</b></div><div class="ln">Доставка<b>0 сум</b></div><div class="tot"><span>Итого</span><span>${som(TOTAL)}</span></div></div></div></div></div>`;
}
function mobileCheckout() {
  const html = checkout();
  const body = html.replace(/^[\s\S]*?<div class="cg"><div>/, "").replace(/<div class="sumc">[\s\S]*$/, "");
  const pu = S.recv === "pu";
  return `<div class="phonewrap"><div class="phone"><div class="sb"><span>9:41</span><span>▮▮▮ ◔</span></div><div class="ah"><span>‹</span><b>Оформление заказа</b></div><div class="pc" style="padding-bottom:130px">${body}</div>
    <div class="sheet" style="padding:12px 16px 20px"><div class="row" style="justify-content:space-between"><span>Доставка</span><b>${pu ? "0 сум" : som(30000)}</b></div><div class="row" style="justify-content:space-between"><b>Итого</b><b>${som(TOTAL + (pu ? 0 : 30000))}</b></div><button class="btn pri big mt8" id="pay" style="width:100%" ${pu && !S.sel ? "disabled" : ""}>Оформить заказ</button></div></div></div>`;
}
function render() { $("#app").innerHTML = S.view === "order" ? orderPage() : S.mobile ? mobileCheckout() : checkout(); bind(); }
function bind() {
  const on = (id, f) => { const e = $("#" + id); if (e) e.onclick = f; };
  on("rpu", () => { if (!BRS.some(avail)) return; S.recv = "pu"; if (!S.sel) preselect(); render(); });
  on("raddr", () => { S.recv = "addr"; render(); toast("Пересчёт: доставка по тарифу Fargo"); });
  on("chg", () => { S.tab = "list"; S.mapSel = null; openSheet(); });
  const sd = $("#sdef"); if (sd) sd.onchange = () => { S.saveDef = sd.checked; };
  on("pay", () => { if (S.preFail) { S.preFail = false; S.off = [S.sel]; S.sel = null; S.msg = "Этот пункт самовывоза больше недоступен. Выберите другой пункт или доставку."; return render(); } payDialog(); });
  on("route", () => toast("Открывается карта с точкой филиала"));
  on("bcancel", () => {
    if (S.st === 32) { const m = modal(`<h3>Отменить заказ?</h3><p>Продавец уже подготовил его.</p><div class="acts"><button class="btn out" id="no">Не отменять</button><button class="btn danfill" id="yes">Отменить заказ</button></div>`);
      $("#no", m).onclick = closeModal; $("#yes", m).onclick = () => { closeModal(); S.st = 41; render(); toast("Заказ отменён. Продавец получил уведомление."); }; return; }
    S.st = 41; render(); toast("Заказ отменён");
  });
}
harness({ title: "P-PU2 Buyer: checkout with pickup and the order page", stories: "US-BF-6.3-01 · US-BF-6.3-02", version: "1.0" }, [
  { label: "Checkout: saved default preselected", apply: () => reset({ def: "se" }), notes: ["The buyer saved «Склад Сергели» as the default for this seller: «Самовывоз» is selected and Sergeli is preselected with «Ваш пункт самовывоза по умолчанию», although Chilonzor is nearer (US-BF-6.3-01 AC3, AC4; example P1).", "No delivery tiles; «Доставка: 0 сум» (AC14). Click «Адрес доставки» and back (AC15)."], src: "Pickup PRD 4.2, PU-B14, M-PU42" },
  { label: "Checkout: nearest branch preselected", apply: () => reset({ recv: "pu" }), notes: ["No saved default; default address in Chilonzor: «Филиал Чиланзар» (2,1 км) is preselected with «Ближайший к вашему адресу» (AC6, example P3).", "Tick «Сделать пунктом самовывоза по умолчанию…» and pay: the next checkout preselects it (AC16). «Изменить» opens the list and the map."], src: "PRD PU-B14, PU-P7, M-PU37, M-PU41, M-PU43 ⚑ OQ-PU31" },
  { label: "Checkout: nothing preselected", apply: () => reset({ recv: "pu", hasAddr: false }), notes: ["No default and no saved address: nothing is preselected, «Выберите пункт самовывоза», and «Оформить заказ» is disabled (AC8, example P5).", "In the list there are no distances; sorting by name."], src: "PRD E-PU20" },
  { label: "Choose a pickup point: list", apply: () => { reset({ recv: "pu" }); S.tab = "list"; openSheet(); }, notes: ["Every pickup branch of this seller; available first, then by distance (AC11).", "«Мирзо-Улугбек» lacks the freezer: listed but disabled with «В этом филиале есть не все товары» (M-PU38, AC7).", "Pick «Юнусабад», the cart's own branch, or any other: the chosen branch fulfils the order ⚑ OQ-PU30 (AC13)."], src: "PRD PU-B15, M-PU38" },
  { label: "Choose a pickup point: map", apply: () => { reset({ recv: "pu" }); S.tab = "map"; openSheet(); }, notes: ["Map centred on the buyer's address (blue dot); one pin per branch, grey for the disabled one (AC12).", "Tap a pin: the card with «Выбрать», or the reason for a disabled branch. No route in the MVP."], src: "PRD PU-B16" },
  { label: "Pickup not available", apply: () => reset({ noStock: ["ch", "yu", "mu", "se"] }), notes: ["No branch has every item: «Самовывоз» is disabled with M-PU39 and «Адрес доставки» is selected (AC9, example P6)."], src: "PRD M-PU39" },
  { label: "After payment: branch no longer available", apply: () => reset({ recv: "pu", reFail: true }), notes: ["Click «Оформить заказ» and «Оплатить»: the seller switched pickup off at Chilonzor during payment. No order is created, the payment is returned ⚑ OQ-PU32 and M-PU6 is shown (AC20, E-PU24).", "(Before payment the same check shows M-PU6 without opening Paylov, AC21.)"], src: "PRD 4.2 check 5, M-PU6, DEC-20" },
  { label: "Order page: preparing (16 / 25)", apply: () => reset({ view: "order", st: 25, sel: "ch" }), notes: ["«Упаковка»: branch snapshot, working hours, phone, «Как нас найти», «Маршрут»; M-PU8; no QR and no code (US-BF-6.3-02 AC1, AC3).", "«Отменить заказ» uses the existing flow (AC11)."], src: "PRD PU-B7, M-PU8, M-PU11" },
  { label: "Order page: ready for pickup (32)", apply: () => reset({ view: "order", st: 32, sel: "ch" }), notes: ["M-PU9 with the last day, the QR code and the code 482 915 in large digits (M-PU10) (AC5).", "The code is only here and in the SMS (AC7). «Отменить заказ» is allowed ⚑ OQ-PU10."], src: "PRD PU-B8, M-PU9, M-PU10 · not designed (DR-PU6)" },
  { label: "Cancel in 32", apply: () => { reset({ view: "order", st: 32, sel: "ch" }); $("#bcancel").click(); }, notes: ["Dialog M-PU15. Confirm: 41, the QR and code stop working, the seller gets SOR-04 «Не отправляйте и не передавайте товары» (AC12, ⚑ OQ-PU10)."], src: "PRD PU-B12, M-PU15" },
  { label: "Order page: collected (35)", apply: () => reset({ view: "order", st: 35, sel: "ch" }), notes: ["«Получен 15.10.2026 в 09:40» (M-PU12); QR and code hidden; review allowed (AC8)."], src: "PRD PU-B10" },
  { label: "Order page: not collected (48)", apply: () => reset({ view: "order", st: 48, sel: "ch" }), notes: ["The storage period ended: M-PU13 and the refund line; no QR (AC9)."], src: "PRD PU-B11, M-PU13" },
  { label: "Order page: refused (48)", apply: () => reset({ view: "order", st: 48, sel: "ch", refused: true }), notes: ["The seller recorded «Покупатель отказался»: M-PU14 and the refund line (AC10)."], src: "PRD M-PU14" },
  { label: "Buyer app: order page, ready", apply: () => reset({ view: "order", st: 32, sel: "ch", mobile: true }), notes: ["Same data in the app. Once loaded, the QR code and the code stay visible without internet (AC6, NFR-PU8)."], src: "PRD NFR-PU8" },
  { label: "Buyer app: checkout with pickup", apply: () => reset({ recv: "pu", mobile: true }), notes: ["The app has the same block, card, checkbox and sheet (US-BF-6.3-01 AC22). «Изменить» opens List / Map."], src: "Mobile «Оформление заказа» (DR-PU1)" },
]);
