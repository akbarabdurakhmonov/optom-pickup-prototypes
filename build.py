SRC = "./src/"
OUT = "./"
css = open(SRC + "base.css").read() + open(SRC + "sd.css").read() + open(SRC + "pu.css").read()
harness = open(SRC + "harness.js").read() + "\n" + open(SRC + "pucommon.js").read()
FOOT = '<p style="text-align:center;color:#8b9189;font-size:11.5px;margin:18px 0 28px">Optom.uz · clickable prototype for the pickup user stories (epic US-BF-6.3) · requirements: Pickup PRD v1.1 · example data only. Where a prototype differs from the acceptance criteria in Confluence, the acceptance criteria win.</p>'
PAGES = [("p-pu1-seller-branches.html", "P-PU1 Seller: branch pickup settings", "p1.js", "US-SF-5.5-02", 6),
         ("p-pu2-buyer.html", "P-PU2 Buyer: checkout with pickup and order page", "p2.js", "US-BF-6.3-01, US-BF-6.3-02", 15),
         ("p-pu3-seller-order.html", "P-PU3 Seller: pickup order and handover", "p3.js", "US-SF-5.3-01, US-SF-5.3-02", 14),
         ("p-pu4-admin.html", "P-PU4 Admin: pickup orders and handover log", "p4.js", "US-AF-2.1-02", 6),
         ("p-pu5-notifications.html", "P-PU5 Notifications: push, list and SMS", "p5.js", "US-BF-8.1-04, US-BF-8.1-05", 6)]
for fn, title, js, st, n in PAGES:
    open(OUT + fn, "w").write(f'''<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>{css}</style></head><body>
<div id="app"></div>{FOOT}
<script>{harness}
{open(SRC + js).read()}
</script></body></html>''')
lis = "".join(f'<li><a href="{fn}">{t}</a> <small>{st} · {n} scenarios</small></li>' for fn, t, js, st, n in PAGES)
open(OUT + "index.html", "w").write(f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Optom.uz pickup prototypes</title>
<style>body{{font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:760px;margin:40px auto;padding:0 16px;color:#1b1c1f}}a{{color:#00a028}}li{{margin:8px 0}}small{{color:#667}}</style></head><body>
<h1>Optom.uz · Pickup prototypes v1.0</h1><p>Clickable prototypes for the pickup user stories (epic US-BF-6.3). Screens in Russian, notes in English. Pick a state in the <b>Scenario</b> list at the top, or open a scenario with <code>?s=N</code> (N starts at 0).</p>
<ul>{lis}</ul><p><small>Example data only. The acceptance criteria in Confluence are the source of truth.</small></p></body></html>''')
open(OUT + "README.md", "w").write("# Optom.uz pickup prototypes\n\nClickable HTML prototypes P-PU1 – P-PU5 for the pickup user stories (epic US-BF-6.3), published with GitHub Pages and embedded in the Confluence user story pages.\n\nRequirements: Pickup PRD v1.1. Source of truth: the Confluence story pages. Example data only, no real customer data.\n\nBuilt from `src/` with `build.py`.\n")
open(OUT + "robots.txt", "w").write("User-agent: *\nDisallow: /\n")
open(OUT + ".nojekyll", "w").write("")
print("built")
