// P-PU3 Seller: pickup order, ready for pickup and handover (website and app)
const ST = { 16: ["Новый", "g"], 25: ["В обработке", "b"], 32: ["Готов к выдаче", "v"], 35: ["Выдан", "n"], 48: ["Не забран", "r"], 45: ["Отменён продавцом", "r"], 41: ["Отменён покупателем", "r"] };
const ORD = "2610250001", CODE = "482915";
const ITEMS = [["Холодильник Artel HD 455", 2], ["Морозильный ларь Artel 300", 1]];
let S = {};
function reset(o) {
  closeModal();
  S = Object.assign({ st: 25, view: "order", mobile: false, tries: 0, lockMin: 0, hist: [], filt: "pu", conflict: false, scan: false, method: "", refusal: "" }, o || {});
  render(); if (S.open) S.open();
}
const log = t => S.hist.push([t, "сегодня в " + new Date().toTimeString().slice(0, 5), "Николаев А. Д. · продавец"]);
function actions() {
  const b = (id, cls, t) => `<button class="btn ${cls}" id="${id}">${t}</button>`;
  if (S.st === 16) return `<h3>Подтвердите заказ</h3><p class="sub">Самовывоз: подтверждение ничего не бронирует у служб доставки. У вас есть 24 часа.</p><div class="row mt12">${b("reject", "dan", "Отклонить")}${b("confirm", "pri", "Подтвердить")}</div>`;
  if (S.st === 25) return `<h3>Соберите заказ в филиале</h3><p class="sub">Когда заказ упакован и лежит в пункте выдачи, нажмите «Готов к выдаче». Покупатель получит QR-код и код выдачи.</p><div class="row mt12">${b("cancel", "dan", "Отменить заказ")}${b("ready", "pri", "Готов к выдаче")}</div>`;
  if (S.st === 32) return `<h3>Ждём покупателя</h3><p class="sub">Хранение до 16.10.2026, 23:59. Попросите QR-код или код выдачи.</p><div class="row mt12">${S.mobile ? b("scanb", "pri", "Сканировать QR") : ""}${b("bynum", S.mobile ? "out" : "pri", "Выдать по номеру заказа")}</div><button class="btn link sm mt8" id="nocode">У покупателя нет кода</button><p class="hint mt8">Отменить готовый заказ может только поддержка.</p>`;
  if (S.st === 35) return `<div class="alert s"><span class="ic">✓</span><div><b>Заказ №${ORD} выдан</b>${S.method === "NoCode" ? "Выдан без кода. Покупатель получил уведомление." : "Выдан по " + (S.method === "Qr" ? "QR-коду" : "номеру заказа и коду") + "."}</div></div>`;
  if (S.st === 48) return `<div class="alert e"><span class="ic">!</span><div><b>${S.refusal ? "Покупатель отказался: " + S.refusal : "Срок хранения истёк"}</b>Заказ отменён. Товары возвращены на остаток филиала.</div></div>`;
  if (S.st === 45) return `<div class="alert e"><span class="ic">!</span><div><b>Заказ отменён</b>Покупатель получил уведомление. Товары вернулись на остаток филиала.</div></div>`;
  if (S.st === 41) return `<div class="alert e"><span class="ic">!</span><div><b>Покупатель отменил заказ</b>Не отправляйте и не передавайте товары.</div></div>`;
  return "";
}
function orderBody() {
  const hist = S.hist.length ? `<div class="timeline mt12" style="border-top:1px solid var(--line);padding-top:8px">${S.hist.map(h => `<div class="it"><span class="d">•</span><div>${h[0]}<small>${h[1]} · ${h[2]}</small></div></div>`).join("")}</div>` : "";
  return `<div class="card">${actions()}</div><div class="card"><h3>Получение</h3>
      <div class="kv">${ICON.store}<div><span class="k">Способ:</span> Самовывоз · <b>Филиал Чиланзар</b></div></div>
      ${S.st === 32 ? `<div class="kv">${ICON.cal}<div><span class="k">Хранение до</span> 16.10.2026, 23:59</div></div>` : ""}
      <div class="kv">${ICON.user}<div><span class="k">Покупатель:</span> Азизбек Хамидов · <span class="k">Получатель:</span> Шерзод Каримов</div></div>${hist}</div>
    <div class="card"><h3>Товары</h3>${ITEMS.map(i => `<div class="prod mt8"><span class="thumb"></span>${i[0]} · ${i[1]} шт.</div>`).join("")}</div>`;
}
function listView() {
  const rows = [[ORD, "Филиал Чиланзар", 32, "до 16.10.2026"], ["2610240417", "Филиал Чиланзар", 32, "до 15.10.2026"], ["2610240388", "Склад Сергели", 25, ""], ["2610230101", "Филиал Чиланзар", 16, ""]];
  const f = rows.filter(r => S.filt !== "ready" || r[2] === 32);
  return `<div class="h1">Заказы</div><div class="row" style="margin-bottom:12px"><span class="chip on">Способ: Самовывоз ✕</span><select class="inp" id="sf" style="max-width:240px"><option value="">Все статусы</option><option value="ready" ${S.filt === "ready" ? "selected" : ""}>Готов к выдаче</option></select></div>
   <div class="card"><table class="t"><thead><tr><th>Заказ</th><th>Получение</th><th>Статус</th><th>Хранение</th></tr></thead><tbody>${f.map(r => `<tr><td><b>№${r[0]}</b></td><td>Самовывоз · ${r[1]}</td><td><span class="pill ${ST[r[2]][1]}">${ST[r[2]][0]}</span></td><td class="small">${r[3] || "—"}</td></tr>`).join("")}</tbody></table></div>`;
}
function web() {
  const os = ST[S.st];
  if (S.view === "list") return sellerShell("or", "<b>Заказы</b>", listView());
  return sellerShell("or", `Заказы <span>›</span> <b>№${ORD}</b>`, `<div class="h1">Заказ №${ORD} <span class="pill ${os[1]}">${os[0]}</span></div><div class="og"><div>${orderBody()}</div>
    <div class="card"><h3>Выдача заказа</h3><p class="sub">На сайте: введите номер заказа и код выдачи, или отсканируйте QR ручным сканером в поле «Номер заказа».</p><button class="btn out mt8" id="bynum2">Выдать по номеру заказа</button></div></div>`);
}
function app() {
  const os = ST[S.st];
  const body = S.scan ? `<div class="scan"><div class="lbl">Наведите камеру на QR-код покупателя</div><div class="vf"></div></div>
      <div class="demo-acts"><button data-q="ok">демо: QR заказа №${ORD}</button><button data-q="other">демо: QR заказа другого продавца</button><button data-q="foreign">демо: чужой QR (не Optom)</button><button data-q="25">демо: QR заказа в обработке</button><button data-q="nocam">демо: нет камеры / интернета</button></div><button class="btn out mt8" id="scclose" style="width:100%">Закрыть</button>`
    : `<span class="pill ${os[1]}">${os[0]}</span><div class="mt8">${orderBody()}</div>`;
  return `<div class="phonewrap"><div class="phone"><div class="sb"><span>9:41</span><span>▮▮▮ ◔</span></div><div class="ah"><span>‹</span><b>${S.scan ? "Сканировать QR" : "Заказ №" + ORD}</b></div><div class="pc" style="padding-bottom:80px">${body}</div>
    <div class="tabbar"><span>Главная</span><span class="on">Заказы</span><span>Товары</span><span>Чаты</span><span>Ещё</span></div></div></div>`;
}
function render() { $("#app").innerHTML = S.mobile ? app() : web(); bind(); }
function setSt(n, t, msg) { if (S.conflict) { closeModal(); S.conflict = false; S.st = 41; render(); return toast("Статус заказа изменился. Страница обновлена."); } S.st = n; log(t); closeModal(); render(); if (msg) toast(msg); }
function bind() {
  const on = (id, f) => { const e = $("#" + id); if (e) e.onclick = f; };
  on("confirm", () => setSt(25, "Заказ подтверждён (16 → 25)", "Заказ подтверждён"));
  on("reject", () => setSt(45, "Заказ отклонён продавцом (16 → 45)", "Заказ отклонён"));
  on("cancel", cancelDialog); on("ready", readyDialog);
  on("bynum", numDialog); on("bynum2", numDialog); on("nocode", noCodeDialog);
  on("scanb", () => { S.scan = true; render(); }); on("scclose", () => { S.scan = false; render(); });
  document.querySelectorAll("[data-q]").forEach(x => x.onclick = () => {
    const q = x.dataset.q; if (q === "ok") { S.scan = false; render(); return summary("Qr"); }
    toast({ other: "Заказ не найден среди ваших заказов.", foreign: "Этот QR-код не относится к заказу Optom.", 25: "Этот заказ ещё не готов к выдаче.", nocam: "Для сканирования нужны камера и интернет. Выдайте заказ по номеру." }[q]);
  });
  const sf = $("#sf"); if (sf) sf.onchange = () => { S.filt = sf.value; render(); };
}
function readyDialog() {
  const m = modal(`<h3>Готов к выдаче</h3><p>Заказ упакован и находится в пункте выдачи? Покупателю придёт сообщение забрать его в течение 3 дней.</p><div class="acts"><button class="btn out" id="no">Назад</button><button class="btn pri" id="yes">Подтвердить</button></div>`);
  $("#no", m).onclick = closeModal;
  $("#yes", m).onclick = () => setSt(32, "Готов к выдаче (25 → 32). Хранение до 16.10.2026 23:59. Покупателю отправлены DLV-04 и SMS", "Покупатель уведомлён.");
}
function cancelDialog() {
  const m = modal(`<h3>Отменить заказ</h3><div class="reasons">${["Нет в наличии", "Не могу подготовить заказ", "Другое"].map((r, i) => `<label data-r="${i}"><span class="radio"></span>${r}</label>`).join("")}</div><textarea class="inp mt8" id="cc" rows="2" placeholder="Комментарий (обязателен для «Другое», 10–300 символов)"></textarea>
    <div class="acts"><button class="btn out" id="no">Назад</button><button class="btn danfill" id="yes" disabled>Отменить заказ</button></div>`);
  let r = -1; m.querySelectorAll("[data-r]").forEach(x => x.onclick = () => { r = +x.dataset.r; m.querySelectorAll("[data-r]").forEach(y => y.classList.toggle("on", y === x)); chk(); });
  const chk = () => { const c = $("#cc", m).value.trim().length; $("#yes", m).disabled = r < 0 || (r === 2 && (c < 10 || c > 300)); };
  $("#cc", m).oninput = chk; $("#no", m).onclick = closeModal;
  $("#yes", m).onclick = () => setSt(45, "Отменён продавцом (25 → 45), причина указана", "Заказ отменён");
}
function attempt(code) {
  if (S.lockMin) return `Слишком много неверных кодов. Повторите через ${S.lockMin} мин.`;
  if (code === CODE) return "";
  S.tries++; if (S.tries >= 5) { S.lockMin = 15; return "Слишком много неверных кодов. Повторите через 15 мин."; }
  return `Неверный код. Осталось попыток: ${5 - S.tries}.`;
}
function statusErr() {
  if (S.st === 16 || S.st === 25) return "Этот заказ ещё не готов к выдаче.";
  if (S.st === 35) return "Этот заказ уже выдан.";
  if ([41, 45, 46, 48].includes(S.st)) return "Этот заказ отменён. Не выдавайте его.";
  if (S.expired) return "Срок хранения истёк. Не выдавайте заказ.";
  return "";
}
function numDialog() {
  const m = modal(`<h3>Выдать по номеру заказа</h3><div class="field"><label>Номер заказа</label><input class="inp" id="on" value="${ORD}" placeholder="Номер заказа или текст QR со сканера"></div>
    <div class="field"><label>Код выдачи</label><input class="inp" id="oc" maxlength="7" placeholder="6 цифр" inputmode="numeric"></div><div id="er"></div>
    <div class="acts"><button class="btn link" id="nc">У покупателя нет кода</button><span class="sp" style="flex:1"></span><button class="btn out" id="no">Закрыть</button><button class="btn pri" id="go">Проверить</button></div>
    <div class="demo-acts"><button id="dok">демо: верный код ${CODE}</button><button id="dbad">демо: неверный код</button><button id="dother">демо: номер чужого заказа</button></div>`);
  const err = t => { $("#er", m).innerHTML = t ? `<div class="alert e"><span class="ic">!</span><div>${t}</div></div>` : ""; };
  const run = () => { const n = $("#on", m).value.trim(); if (n !== ORD) return err("Заказ не найден среди ваших заказов."); const se = statusErr(); if (se) return err(se);
    const e = attempt($("#oc", m).value.replace(/\s/g, "")); if (e) return err(e); closeModal(); summary("Manual"); };
  $("#go", m).onclick = run; $("#no", m).onclick = closeModal; $("#nc", m).onclick = noCodeDialog;
  $("#dok", m).onclick = () => { $("#oc", m).value = CODE; run(); }; $("#dbad", m).onclick = () => { $("#oc", m).value = "111111"; run(); };
  $("#dother", m).onclick = () => { $("#on", m).value = "2610119999"; run(); };
  if (S.lockMin) err(`Слишком много неверных кодов. Повторите через ${S.lockMin} мин.`);
}
function noCodeDialog() {
  const m = modal(`<h3>У покупателя нет кода</h3><p class="sub">Выдача без кода фиксируется, покупатель получит уведомление.</p><div class="field"><label>Номер заказа</label><input class="inp" id="on" value="${ORD}"></div>
    <div class="field"><label>Последние 4 цифры телефона получателя</label><input class="inp" id="d4" maxlength="4" placeholder="4567"></div><div class="field"><label>Комментарий <span class="counter" id="cn">0/300</span></label><textarea class="inp" id="cm" rows="2" placeholder="Почему нет кода и как вы убедились, что это получатель (10–300 символов)"></textarea></div><div id="er"></div>
    <div class="acts"><button class="btn out" id="no">Закрыть</button><button class="btn pri" id="go" disabled>Проверить</button></div><div class="demo-acts"><button id="dok">демо: 4567 и комментарий</button></div>`);
  const chk = () => { const c = $("#cm", m).value.trim().length; $("#cn", m).textContent = c + "/300"; $("#go", m).disabled = $("#d4", m).value.length !== 4 || c < 10 || c > 300; };
  $("#d4", m).oninput = chk; $("#cm", m).oninput = chk; $("#no", m).onclick = closeModal;
  $("#go", m).onclick = () => { const se = statusErr(); const e = se || (S.lockMin ? `Слишком много неверных кодов. Повторите через ${S.lockMin} мин.` : $("#d4", m).value === "4567" ? "" : attempt("x"));
    if (e) { $("#er", m).innerHTML = `<div class="alert e"><span class="ic">!</span><div>${e}</div></div>`; return; } closeModal(); summary("NoCode"); };
  $("#dok", m).onclick = () => { $("#d4", m).value = "4567"; $("#cm", m).value = "Телефон покупателя разряжен, получатель показал паспорт"; chk(); };
}
function summary(method) {
  const m = modal(`<h3>Заказ №${ORD}</h3><div class="sumbox">${ITEMS.map(i => `<div>${i[0]} · <b>${i[1]} шт.</b></div>`).join("")}<div class="mt8"><span class="k">Получатель:</span> Шерзод Каримов · +998 •• ••• •• 67</div></div>
    <p class="hint mt8">Проверьте товар вместе с покупателем перед выдачей.</p>${method === "NoCode" ? '<div class="alert w"><span class="ic">!</span><div>Выдача без кода. Покупатель получит уведомление DLV-10.</div></div>' : ""}
    <div class="acts"><button class="btn dan" id="ref">Покупатель отказался</button><span style="flex:1"></span><button class="btn out" id="no">Закрыть</button><button class="btn pri" id="go">Выдать</button></div>`);
  $("#no", m).onclick = closeModal;
  $("#go", m).onclick = () => { S.method = method; setSt(35, `Выдан (32 → 35), способ: ${{ Qr: "QR-код", Manual: "номер заказа + код", NoCode: "без кода" }[method]}`, `Заказ №${ORD} выдан.`); };
  $("#ref", m).onclick = refuseDialog;
}
function refuseDialog() {
  const R = ["Товар повреждён", "Не тот товар или количество", "Передумал", "Другое"];
  const m = modal(`<h3>Покупатель отказался</h3><p class="sub">Отказ от всего заказа. Заказ будет отменён, товары вернутся на остаток.</p><div class="reasons">${R.map((r, i) => `<label data-r="${i}"><span class="radio"></span>${r}</label>`).join("")}</div><textarea class="inp mt8" id="cc" rows="2" placeholder="Комментарий (обязателен для «Другое»)"></textarea>
    <div class="acts"><button class="btn out" id="no">Назад</button><button class="btn danfill" id="yes" disabled>Подтвердить отказ</button></div>`);
  let r = -1; const chk = () => { const c = $("#cc", m).value.trim().length; $("#yes", m).disabled = r < 0 || (r === 3 && (c < 10 || c > 300)); };
  m.querySelectorAll("[data-r]").forEach(x => x.onclick = () => { r = +x.dataset.r; m.querySelectorAll("[data-r]").forEach(y => y.classList.toggle("on", y === x)); chk(); });
  $("#cc", m).oninput = chk; $("#no", m).onclick = closeModal;
  $("#yes", m).onclick = () => { S.refusal = R[r]; setSt(48, `Покупатель отказался (32 → 48, RefusedAtPickup): ${R[r]}`, "Отказ зафиксирован. Заказ отменён."); };
}
harness({ title: "P-PU3 Seller: pickup order and handover", stories: "US-SF-5.3-01 · US-SF-5.3-02", version: "1.0" }, [
  { label: "Orders list: pickup filter", apply: () => reset({ view: "list" }), notes: ["Pickup orders show «Самовывоз · branch» instead of the address; filter by method and by «Готов к выдаче» (US-SF-5.3-01 AC1)."], src: "Pickup PRD PU-S8" },
  { label: "Order page 16: confirm or reject", apply: () => reset({ st: 16 }), notes: ["Same actions as other methods; «Подтвердить» books nothing (AC2, AC3)."], src: "PRD PU-S9" },
  { label: "Order page 25: Ready for pickup", apply: () => reset({ st: 25 }), notes: ["«Готов к выдаче» (M-PU16) only in 25; «Отменить заказ» with a reason (AC4, AC5)."], src: "PRD PU-S10, PU-S11 · not designed (DR-PU5)" },
  { label: "Ready for pickup dialog", apply: () => reset({ st: 25, open: readyDialog }), notes: ["M-PU17 with «Подтвердить» / «Назад». Confirm: 32, deadline 16.10.2026 23:59 (example S1), toast M-PU18, DLV-04 and SMS to the buyer (AC6, AC7)."], src: "PRD M-PU17, M-PU18, 4.3" },
  { label: "Order page 32: waiting for the buyer", apply: () => reset({ st: 32 }), notes: ["«Хранение до 16.10.2026, 23:59» (new text T4); no «Отменить заказ» (AC9, AC10).", "Website: «Выдать по номеру заказа» and «У покупателя нет кода»; no camera on the website (OQ-PU21)."], src: "PRD PU-S16, M-PU28" },
  { label: "App: scan QR → summary", apply: () => reset({ st: 32, mobile: true, scan: true }), notes: ["Seller app: «Сканировать QR» opens the camera. Use the demo buttons for a valid QR (summary), another seller's order (M-PU20), a non-Optom QR (M-PU20b), an order in 25 (M-PU21a), no camera or internet (T7) (US-SF-5.3-02 AC1, AC2, AC5, AC9, AC11, AC16)."], src: "PRD PU-S12, 4.4" },
  { label: "Website: hand over by order number", apply: () => reset({ st: 32, open: numDialog }), notes: ["Order number + 6-digit code; the number field also takes the QR text from a hand scanner (AC6). Try the demo buttons."], src: "PRD PU-S13, M-PU19" },
  { label: "Wrong code", apply: () => reset({ st: 32, tries: 2, open: () => { numDialog(); $("#dbad").click(); } }), notes: ["Third wrong code: «Неверный код. Осталось попыток: 2.» (M-PU22) (AC7, H3). Two more wrong codes lock manual entry."], src: "PRD PU-P5, M-PU22" },
  { label: "Locked after 5 wrong codes", apply: () => reset({ st: 32, tries: 5, lockMin: 12, open: numDialog }), notes: ["M-PU23 with the minutes left; the no-code path is locked too; scanning the valid QR still works (AC8, H4)."], src: "PRD M-PU23" },
  { label: "Order cannot be handed over", apply: () => reset({ st: 48, open: numDialog }), notes: ["The order is already cancelled (48): M-PU21c «Этот заказ отменён. Не выдавайте его.» (AC9, H10). In 25 it would be M-PU21a; in 35 M-PU21b; past the deadline M-PU21d."], src: "PRD M-PU21a – d" },
  { label: "The buyer has no code", apply: () => reset({ st: 32, open: noCodeDialog }), notes: ["Order number, last 4 digits of the recipient's phone (4567) and a comment of 10–300 characters; then the summary; «Выдать» logs NoCode and sends DLV-10 to the buyer (AC12, H7)."], src: "PRD PU-S14, M-PU26" },
  { label: "Buyer refused", apply: () => reset({ st: 32, open: () => { summary("Manual"); refuseDialog(); } }), notes: ["From the summary: reason (M-PU27); «Другое» needs a comment. Confirm: 48 RefusedAtPickup, stock back, refusal texts to both sides (AC14, H8)."], src: "PRD PU-S15" },
  { label: "Handed over", apply: () => reset({ st: 32, open: () => summary("Qr") }), notes: ["Summary with items, recipient and masked phone (M-PU24). «Выдать»: 35, toast M-PU25, DLV-08; the QR and code stop working (AC2, AC3, AC18)."], src: "PRD 4.4 step 5" },
  { label: "Cancel in 25 with a reason", apply: () => reset({ st: 25, open: cancelDialog }), notes: ["Reasons: «Нет в наличии», «Не могу подготовить заказ», «Другое» + comment (new text T3) (US-SF-5.3-01 AC4)."], src: "PRD PU-S10" },
]);
