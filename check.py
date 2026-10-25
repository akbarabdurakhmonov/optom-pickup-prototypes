import asyncio, sys
from playwright.async_api import async_playwright
PAGES = {"p-pu1-seller-branches.html": 6, "p-pu2-buyer.html": 15, "p-pu3-seller-order.html": 14, "p-pu4-admin.html": 6, "p-pu5-notifications.html": 6}
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        for fn, n in PAGES.items():
            for i in range(n):
                pg = await b.new_page(viewport={"width": 1440, "height": 1000})
                pg.on("pageerror", lambda e, fn=fn, i=i: errs.append(f"{fn} s={i}: {e}"))
                await pg.goto(f"file://./{fn}?s={i}"); await pg.wait_for_timeout(250)
                if len(sys.argv) > 1: await pg.screenshot(path=f"./shots/{fn[:5]}-{i}.png")
                await pg.close()
        print("\n".join(errs) or "no errors"); await b.close()
asyncio.run(main())
