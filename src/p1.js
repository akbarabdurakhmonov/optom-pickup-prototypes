// P-PU1 Seller: branch pickup settings (website and app)
const BR0 = [
  { n: "Филиал Чиланзар", a: "Ташкент, Чиланзарский р-н, ул. Бунёдкор, 12", ph: "+998 90 123 45 67", act: true, pu: true, h: STD_HOURS, note: "Ворота 3, склад Б, позвоните в звонок", wait: 2, active: 3 },
  { n: "Склад Сергели", a: "Ташкент, Сергелийский р-н, ул. Янги Сергели, 45", ph: "+998 71 200 10 10", act: true, pu: true, h: [["08:00", "17:00"], ["08:00", "17:00"], ["08:00", "17:00"], ["08:00", "17:00"], ["08:00", "17:00"], ["08:00", "13:00"], null], note: "", wait: 0, active: 0 },
  { n: "Филиал Юнусабад", a: "Ташкент, Юнусабадский р-н, ул. Амира Темура, 107", ph: "", act: true, pu: false, h: [null, null, null, null, null, null, null], note: "", wait: 0, active: 0 },
  { n: "Филиал Самарканд", a: "Самарканд, ул. Регистан, 5", ph: "+998 66 233 00 11", act: false, pu: false, h: STD_HOURS, note: "", wait: 0, active: 0 }];
const TODAY = 0; // Monday in the prototype
let S = {};
function reset(o) { closeModal(); S = Object.assign({ view: "list", i: 0, mobile: false, f: null, blocked: false, saved: false }, o || {}); S.rows = JSON.parse(JSON.stringify(BR0)); if (S.view === "form") S.f = JSON.parse(JSON.stringify(S.rows[S.i])); if (o && o.mut) o.mut(S.f); render(); }
const phoneOk = p => /^\+998 ?\d{2} ?\d{3} ?\d{2} ?\d{2}$/.test(p.trim());
function rowErr(r) { return r && r[1] <= r[0]; }
function errs(f) {
  const e = {}; const open = f.h.filter(Boolean).length;
  if (f.h.some(rowErr)) e.hours = "Время закрытия должно быть позже времени открытия.";
  if (f.pu && !open) e.open = "Укажите часы работы хотя бы на один день.";
  if ((f.pu || f.ph) && !phoneOk(f.ph)) e.ph = "Введите телефон в формате +998 XX XXX XX XX.";
  if (f.note.length > 300) e.note = "Не более 300 символов";
  return e;
}
function swState(f) {
  if (!f.act) return "Чтобы включить самовывоз, активируйте филиал.";
  if (!f.h.filter(Boolean).length) return "Чтобы включить самовывоз, укажите часы работы филиала.";
  if (!phoneOk(f.ph)) return "Введите телефон в формате +998 XX XXX XX XX.";
  return "";
}
function today(r) { const t = r.h[TODAY]; return t ? `Сегодня: ${t[0]}–${t[1]}` : "Сегодня выходной"; }
function list() {
  return `<div class="h1">Филиалы <button class="btn pri sm" style="margin-left:auto">＋ Добавить филиал</button></div><div class="card"><table class="t"><thead><tr><th>Филиал</th><th>Адрес</th><th>Статус</th><th>Самовывоз</th><th>Часы</th><th>Ожидают выдачи</th><th></th></tr></thead><tbody>
  ${S.rows.map((r, i) => `<tr><td><b>${r.n}</b></td><td class="muted small">${r.a}</td><td><span class="pill ${r.act ? "g" : "n"}">${r.act ? "Активен" : "Неактивен"}</span></td>
    <td>${r.pu ? '<span class="pill g">Самовывоз: вкл.</span>' : '<span class="pill n">Самовывоз: выкл.</span>'}</td><td class="small">${r.h.filter(Boolean).length ? today(r) : "—"}</td>
    <td>${r.wait ? `<a href="#" class="small" data-w="${i}">Ожидают выдачи: ${r.wait}</a>` : '<span class="small muted">Ожидают выдачи: 0</span>'}</td><td><span class="go" data-e="${i}">✎</span></td></tr>`).join("")}</tbody></table></div>`;
}
function form() {
  const f = S.f, e = errs(f), sw = swState(f), dis = !!sw && !f.pu;
  const hrs = f.h.map((r, d) => `<span class="d">${["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"][d]}</span>
      <label class="chk"><span class="toggle ${r ? "" : "on"}" data-cl="${d}"></span> Выходной</label>
      <span>${r ? `<select class="inp" data-o="${d}">${TIMES.map(t => `<option ${t === r[0] ? "selected" : ""}>${t}</option>`).join("")}</select> – <select class="inp ${rowErr(r) ? "err" : ""}" data-c="${d}">${TIMES.map(t => `<option ${t === r[1] ? "selected" : ""}>${t}</option>`).join("")}</select>` : '<span class="muted small">выходной</span>'}</span>
      ${rowErr(r) ? `<div class="hrow-err">Время закрытия должно быть позже времени открытия.</div>` : ""}`).join("");
  const can = !Object.keys(e).length;
  const block = S.blocked ? `<div class="alert e mt12"><span class="ic">!</span><div>Активных заказов на самовывоз в этом филиале: ${f.active}. Выдайте их или дождитесь завершения, затем отключите самовывоз.</div></div>` : "";
  return `<div class="h1">${f.n}</div><div class="card"><h3>Основное</h3><div class="grid2"><div class="field"><label>Название</label><input class="inp" value="${f.n}" disabled></div><div class="field"><label>Адрес и точка на карте</label><input class="inp" value="${f.a}" disabled></div>
      <div class="field"><label>Телефон</label><input class="inp ${e.ph ? "err" : ""}" id="ph" value="${f.ph}" placeholder="+998 XX XXX XX XX">${e.ph ? `<div class="err-t">${e.ph}</div>` : ""}</div><div class="field"><label>Статус</label><input class="inp" value="${f.act ? "Активен" : "Неактивен"}" disabled></div></div></div>
    <div class="card"><h3>Самовывоз</h3><div class="swrow"><span class="toggle ${f.pu ? "on" : ""}" id="pu" ${dis ? "disabled" : ""}></span><div class="tx"><b>Самовывоз из этого филиала</b> — покупатели смогут забирать заказы здесь
      ${dis ? `<div class="hint" style="color:var(--amber,#b26b00)">${sw}</div>` : ""}</div></div>${block}
      <h4 style="margin:18px 0 4px">Часы работы</h4><div class="hint">Время Ташкента, шаг 30 минут. Используются для самовывоза и Yandex Go.</div><div class="hrs">${hrs}</div>${e.open ? `<div class="err-t mt8">${e.open}</div>` : ""}
      <div class="field mt12"><label>Как нас найти <span class="counter">${f.note.length}/300</span></label><textarea class="inp" id="note" rows="2" placeholder="Например: Ворота 3, склад Б, позвоните в звонок">${f.note}</textarea>${e.note ? `<div class="err-t">${e.note}</div>` : ""}</div>
      <div class="row mt12"><button class="btn out" id="back">Отмена</button><button class="btn pri" id="save" ${can ? "" : "disabled"}>Сохранить</button></div></div>`;
}
function render() {
  if (S.mobile) {
    $("#app").innerHTML = `<div class="phonewrap"><div class="phone"><div class="sb"><span>9:41</span><span>▮▮▮ ◔</span></div><div class="ah"><span>‹</span><b>${S.f ? S.f.n : "Филиалы"}</b></div><div class="pc" style="padding-bottom:80px">${S.view === "form" ? form().replace(/class="grid2"/, 'class=""').replace(/<div class="h1">.*?<\/div>/, "") : list()}</div>
      <div class="tabbar"><span>Главная</span><span>Заказы</span><span>Товары</span><span>Чаты</span><span class="on">Ещё</span></div></div></div>`;
  } else $("#app").innerHTML = sellerShell("br", S.view === "form" ? `Филиалы <span>›</span> <b>${S.f.n}</b>` : "<b>Филиалы</b>", S.view === "form" ? form() : list());
  bind();
}
function bind() {
  document.querySelectorAll("[data-e]").forEach(x => x.onclick = () => { S.view = "form"; S.i = +x.dataset.e; S.f = JSON.parse(JSON.stringify(S.rows[S.i])); S.blocked = false; render(); });
  document.querySelectorAll("[data-w]").forEach(x => x.onclick = ev => { ev.preventDefault(); toast("Открывается список заказов: филиал и статус «Готов к выдаче»"); });
  const f = S.f; if (!f) return;
  document.querySelectorAll("[data-cl]").forEach(x => x.onclick = () => { const d = +x.dataset.cl; f.h[d] = f.h[d] ? null : ["09:00", "18:00"]; S.blocked = false; render(); });
  document.querySelectorAll("[data-o]").forEach(x => x.onchange = () => { f.h[+x.dataset.o][0] = x.value; render(); });
  document.querySelectorAll("[data-c]").forEach(x => x.onchange = () => { f.h[+x.dataset.c][1] = x.value; render(); });
  const ph = $("#ph"); if (ph) ph.onchange = () => { f.ph = ph.value; render(); };
  const nt = $("#note"); if (nt) nt.oninput = () => { f.note = nt.value; const c = document.querySelector(".counter"); if (c) c.textContent = f.note.length + "/300"; };
  const pu = $("#pu"); if (pu) pu.onclick = () => { if (pu.hasAttribute("disabled")) return; f.pu = !f.pu; S.blocked = false; render(); };
  const bk = $("#back"); if (bk) bk.onclick = () => { S.view = "list"; S.f = null; render(); };
  const sv = $("#save"); if (sv) sv.onclick = () => {
    const was = S.rows[S.i];
    if (was.pu && !f.pu && f.active > 0) { S.blocked = true; f.pu = true; return render(); }
    S.rows[S.i] = JSON.parse(JSON.stringify(f)); S.view = "list"; S.f = null; render(); toast("Филиал сохранён");
  };
}
harness({ title: "P-PU1 Seller: branch pickup settings", stories: "US-SF-5.5-02", version: "1.0" }, [
  { label: "Branch list with pickup", apply: () => reset(), notes: ["Each branch shows «Самовывоз: вкл./выкл.», today's hours (Monday in this prototype) and «Ожидают выдачи: n» = orders in 32 (US-SF-5.5-02 AC9).", "Click ✎ to open a branch form. «Ожидают выдачи: 2» opens the order list filtered by branch and status."], src: "Pickup PRD PU-S7 · branch list design" },
  { label: "Branch form, no working hours yet", apply: () => reset({ view: "form", i: 2 }), notes: ["Yunusobod has every day «Выходной» and no phone: the pickup switch is disabled with M-PU35 (AC4, AC5).", "Open one day and enter a phone in the format +998 XX XXX XX XX: the switch becomes available."], src: "PRD PU-S2, M-PU35, M-PU36 · not designed (DR-PU4)" },
  { label: "Branch form, pickup on", apply: () => reset({ view: "form", i: 0 }), notes: ["Chilonzor: pickup on, working hours Mon–Fri 09:00–18:00, Sat 10:00–15:00, Sun closed, and «Как нас найти» with a counter n/300 (AC1, AC2, AC8).", "Change hours or the note and click «Сохранить»: back to the list with the toast."], src: "PRD PU-S1, PU-S3, PU-S4" },
  { label: "Validation errors", apply: () => reset({ view: "form", i: 1, mut: f => { f.h[2] = ["18:00", "09:00"]; f.ph = "+998 71 200"; } }), notes: ["Wednesday 18:00 – 09:00: M-PU33 under the row; the phone is incomplete: M-PU36. «Сохранить» is disabled (AC3, AC5).", "Set every day to «Выходной» while pickup is on: M-PU32."], src: "PRD M-PU32, M-PU33, M-PU36" },
  { label: "Switch-off blocked by active orders", apply: () => reset({ view: "form", i: 0 }), notes: ["Switch pickup off and click «Сохранить»: Chilonzor has 3 pickup orders in 16, 25 or 32, so nothing is saved and M-PU34 is shown; the switch returns to on (AC10).", "Sergeli has no active pickup orders: there switching off is saved (AC11)."], src: "PRD PU-S6, BR-PU13, E-PU1" },
  { label: "Seller app: branch form", apply: () => reset({ view: "form", i: 1, mobile: true }), notes: ["The seller app has the same fields, rules and messages (AC17)."], src: "PRD PU-S1 (web and app)" },
]);
