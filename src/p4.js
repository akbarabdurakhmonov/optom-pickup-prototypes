// P-PU4 Admin: pickup orders, pickup block, handover log, seller branches
const AICON = { an: ICON.chart, pr: ICON.box, or: ICON.list, us: ICON.users, de: ICON.truck };
const ORDERS = [
  { o: "2610250001", s: "ООО «Холод Сервис»", b: "Филиал Чиланзар", st: 32, ready: "14.10.2026 11:20", dl: "16.10.2026 23:59" },
  { o: "2610240417", s: "ООО «Холод Сервис»", b: "Филиал Чиланзар", st: 35, ready: "13.10.2026 15:05", dl: "15.10.2026 23:59", ho: ["14.10.2026 10:12", "Николаев А. Д.", "Без кода", "Телефон покупателя разряжен, получатель показал паспорт"] },
  { o: "2610230555", s: "ИП Каримов", b: "Склад Сергели", st: 48, ready: "10.10.2026 12:00", dl: "12.10.2026 23:59", nc: true },
  { o: "2610230388", s: "ИП Каримов", b: "Склад Сергели", st: 25 }];
const STN = { 16: ["Новый", "g"], 25: ["В обработке", "b"], 32: ["Готов к выдаче", "v"], 35: ["Выдан", "n"], 48: ["Не забран / Отказ", "r"], 46: ["Отменён администратором", "r"] };
const LOG = {
  "2610240417": [["14.10.2026 10:12", "Николаев А. Д.", "Без кода", "Успешно", "Android · Seller app", "185.139.1.20"], ["14.10.2026 10:10", "Николаев А. Д.", "Номер + код", "Неверный код", "Android · Seller app", "185.139.1.20"], ["14.10.2026 10:09", "Николаев А. Д.", "Номер + код", "Неверный код", "Android · Seller app", "185.139.1.20"]],
  "2610250001": [["15.10.2026 09:31", "Николаев А. Д.", "Номер + код", "Заблокировано", "Chrome · Windows", "185.139.1.20"], ...Array.from({ length: 5 }, (_, i) => [`15.10.2026 09:${String(29 - i * 2).padStart(2, "0")}`, "Николаев А. Д.", "Номер + код", "Неверный код", "Chrome · Windows", "185.139.1.20"])]
};
let S = {};
function reset(o) { closeModal(); S = Object.assign({ view: "list", open: 0, flt: "pu", tab: "info", locked: false, rows: JSON.parse(JSON.stringify(ORDERS)) }, o || {}); render(); if (S.after) S.after(); }
function adminShell(content) {
  const nav = (k, t) => `<div class="anav ${k === "or" ? "on" : ""}">${AICON[k]}${t}</div>`;
  return `<div class="ash"><aside class="aside">${LOGO.replace("optom</span>", "optom.uz</span>")}${nav("an", "Аналитика")}${nav("pr", "Товары")}${nav("or", "Заказы")}${nav("us", "Пользователи")}${nav("de", "Доставка")}</aside>
    <div><div class="atop"><span class="abox">${ICON.bell.replace("<svg", '<svg width="18" height="18" fill="none" stroke="#38383b" stroke-width="1.6"')}</span><span class="abox">RU ▾</span><span class="abox"><span class="ava" style="width:28px;height:28px;font-size:11px">АХ</span><b style="font-size:13px">Абдулазиз Холдаров</b></span></div>${content}</div></div>`;
}
function list() {
  const rows = S.rows.filter(r => !S.st || r.st === +S.st);
  return adminShell(`<div class="apanel"><h1>Заказы</h1><div class="row" style="margin-bottom:14px"><select class="inp" style="max-width:240px"><option>Способ доставки: Самовывоз</option><option>Все способы</option></select>
    <select class="inp" id="stf" style="max-width:240px"><option value="">Все статусы</option><option value="32" ${S.st == 32 ? "selected" : ""}>Готов к выдаче (32)</option><option value="48" ${S.st == 48 ? "selected" : ""}>Не забран / Отказ (48)</option></select></div>
    <table class="t"><thead><tr><th>Заказ</th><th>Продавец</th><th>Доставка</th><th>Статус</th><th>Хранение до</th><th></th></tr></thead><tbody>${rows.map(r => `<tr><td><b>№${r.o}</b></td><td>${r.s}</td><td>Самовывоз · ${r.b}</td><td><span class="pill ${STN[r.st][1]}">${STN[r.st][0]}</span>${[46, 48].includes(r.st) ? ' <span class="pill a">Ожидает возврата</span>' : ""}</td><td class="small">${r.dl || "—"}</td><td><span class="go" data-o="${S.rows.indexOf(r)}">→</span></td></tr>`).join("")}</tbody></table></div>`);
}
function orderView() {
  const r = S.rows[S.open], lg = LOG[r.o] || [];
  const cancelOk = [16, 25, 32].includes(r.st);
  const kv = [["Способ доставки", 'Самовывоз <span class="muted small">(нельзя изменить)</span>'], ["Филиал (на момент оплаты)", r.b], ["Адрес", "Ташкент, Чиланзарский р-н, ул. Бунёдкор, 12"], ["Часы работы", hoursLine(STD_HOURS)], ["Готов к выдаче", r.ready || "—"], ["Хранение до", r.dl || "—"]];
  if (r.ho) kv.push(["Выдан", `${r.ho[0]} · ${r.ho[1]} · ${r.ho[2]}`], ["Комментарий продавца", r.ho[3]]);
  if (r.nc) kv.push(["Причина отмены", "Срок хранения истёк (NotCollected)"]);
  if ([46, 48].includes(r.st)) kv.push(["Деньги", '<span class="pill a">Ожидает возврата</span> ⚑ OQ-PU13']);
  const deliv = `<div class="att"><div class="hd">Доставка</div><div class="bd"><table class="t"><tbody>${kv.map(x => `<tr><td class="muted" style="width:210px">${x[0]}</td><td><b>${x[1]}</b></td></tr>`).join("")}</tbody></table><p class="hint">Код выдачи и QR-токен в админ-панели не показываются.</p></div></div>`;
  const logt = `<div class="att"><div class="hd">Журнал выдачи</div><div class="bd">${S.locked ? '<div class="alert w"><span class="ic">!</span><div>Ручной ввод заблокирован до 09:46</div></div>' : ""}
     ${lg.length ? `<table class="t alog"><thead><tr><th>Время</th><th>Пользователь продавца</th><th>Способ</th><th>Результат</th><th>Устройство</th><th>IP</th></tr></thead><tbody>${lg.map(l => `<tr>${l.map((c, i) => `<td>${i === 3 ? `<span class="pill ${c === "Успешно" ? "g" : "r"}">${c}</span>` : c}</td>`).join("")}</tr>`).join("")}</tbody></table>` : '<div class="empty" style="padding:20px">Попыток выдачи пока нет.</div>'}</div></div>`;
  const hist = `<div class="att"><div class="hd">История статусов</div><div class="bd"><div class="log">${[["16 → 25", "Николаев А. Д. · продавец", ""], ["25 → 32", "Николаев А. Д. · продавец", "Готов к выдаче"], ...(r.st === 35 ? [["32 → 35", "Николаев А. Д. · продавец", "Выдан без кода"]] : r.st === 48 ? [["32 → 48", "Система", "Срок хранения истёк"]] : r.st === 46 ? [["32 → 46", "Абдулазиз Холдаров · администратор", S.reason || ""]] : [])].map(h => `<div class="m"><b>${h[0]}</b> · ${h[1]}${h[2] ? " · " + h[2] : ""}</div>`).join("")}</div></div></div>`;
  return adminShell(`<div class="apanel"><span class="back" id="bk">‹ Заказы</span><h1>Заказ №${r.o} <span class="pill ${STN[r.st][1]}">${STN[r.st][0]}</span>${cancelOk ? '<button class="btn dan" id="acancel" style="margin-left:auto">Отменить заказ</button>' : ""}</h1>
    <div class="g3" style="grid-template-columns:1.2fr 1fr">${deliv}${hist}</div>${logt}</div>`);
}
function seller() {
  const rows = [["Филиал Чиланзар", true, hoursLine(STD_HOURS), "Ворота 3, склад Б, позвоните в звонок"], ["Склад Сергели", true, "Пн–Пт 08:00–17:00, Сб 08:00–13:00, Вс выходной", "—"], ["Филиал Юнусабад", false, "—", "—"]];
  return adminShell(`<div class="apanel"><h1>ООО «Холод Сервис»</h1><div class="tabs"><span class="tab">Профиль</span><span class="tab on">Филиалы</span><span class="tab">Товары</span></div>
    <table class="t mt12"><thead><tr><th>Филиал</th><th>Самовывоз</th><th>Часы работы</th><th>Как нас найти</th></tr></thead><tbody>${rows.map(r => `<tr><td><b>${r[0]}</b></td><td><span class="pill ${r[1] ? "g" : "n"}">${r[1] ? "Самовывоз: вкл." : "Самовывоз: выкл."}</span></td><td class="small">${r[2]}</td><td class="small">${r[3]}</td></tr>`).join("")}</tbody></table>
    <p class="hint">Только просмотр: администратор не меняет настройки самовывоза в MVP.</p></div>`);
}
function render() { $("#app").innerHTML = S.view === "order" ? orderView() : S.view === "seller" ? seller() : list(); bind(); }
function cancelDlg() {
  const m = modal(`<h3>Отменить заказ</h3><p class="sub">Покупатель и продавец получат уведомление (ORD-09, SOR-05). Деньги: «Ожидает возврата» ⚑ OQ-PU13.</p><textarea class="inp" id="rs" rows="2" placeholder="Причина отмены">Товар повреждён на складе продавца</textarea><div class="acts"><button class="btn out" id="no">Назад</button><button class="btn danfill" id="yes">Отменить заказ</button></div>`);
  $("#no", m).onclick = closeModal; $("#yes", m).onclick = () => { S.reason = $("#rs", m).value; S.rows[S.open].st = 46; closeModal(); render(); toast("Заказ отменён (46). QR-код и код выдачи больше не действуют."); };
}
function bind() {
  document.querySelectorAll("[data-o]").forEach(x => x.onclick = () => { S.view = "order"; S.open = +x.dataset.o; render(); });
  const st = $("#stf"); if (st) st.onchange = () => { S.st = st.value; render(); };
  const bk = $("#bk"); if (bk) bk.onclick = () => { S.view = "list"; render(); };
  const ac = $("#acancel"); if (ac) ac.onclick = cancelDlg;
}
harness({ title: "P-PU4 Admin: pickup orders and handover log", stories: "US-AF-2.1-02", version: "1.0" }, [
  { label: "Orders list: pickup filter", apply: () => reset(), notes: ["Filter by «Самовывоз» and by statuses 32 / 48 (US-AF-2.1-02 AC1). Cancelled pickup orders carry «Ожидает возврата» ⚑ OQ-PU13 (AC10)."], src: "Pickup PRD PU-A3" },
  { label: "Order page: ready for pickup", apply: () => reset({ view: "order", open: 0 }), notes: ["Delivery block: method (read-only, DR-PU7), branch snapshot, «Готов к выдаче», «Хранение до» (AC2, AC7). The code is never shown (AC5).", "«Отменить заказ» is available in 16, 25 and 32 (AC8)."], src: "PRD PU-A1" },
  { label: "Order page: handed over without code", apply: () => reset({ view: "order", open: 1 }), notes: ["Handover time, seller user, method «Без кода» and the seller's comment (AC3). The log shows two wrong codes before the no-code handover (AC6)."], src: "PRD PU-A1, PU-A2" },
  { label: "Handover log with a lock", apply: () => reset({ view: "order", open: 0, locked: true }), notes: ["Five wrong codes within 15 minutes: «Ручной ввод заблокирован до 09:46» above the log (AC6, new text T8). There is no unlock action; the lock ends by itself."], src: "PRD PU-P5" },
  { label: "Cancel in 32", apply: () => reset({ view: "order", open: 0, after: cancelDlg }), notes: ["Existing admin cancel with a reason → 46; QR and code stop working; ORD-09 and SOR-05; refund pending (AC8, E-PU18)."], src: "PRD PU-A4" },
  { label: "Seller card: pickup branches", apply: () => reset({ view: "seller" }), notes: ["Each branch with the pickup switch, working hours and «Как нас найти», read-only (AC12)."], src: "PRD PU-A5" },
]);
