// Black-box security probe: `npm run security:check -- https://plant-care-nine-olive.vercel.app`
// Attacks the deployed app like an outsider (no session) and fails if anything leaks or is open.
const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const results = [];
const check = (name, ok, detail = "") => results.push({ name, ok: Boolean(ok), detail });
const get = (path, init = {}) => fetch(base + path, { redirect: "manual", ...init });

// Patterns of real secrets (never their names): Clerk, Resend, Svix, Pl@ntNet, Perenual, Postgres URLs.
const SECRET = /sk_(live|test)_[A-Za-z0-9]{10,}|whsec_[A-Za-z0-9+/=]{10,}|\bre_[A-Za-z0-9]{8,}_[A-Za-z0-9]{8,}|\b2b10[A-Za-z0-9]{18,}|\bsk-[A-Za-z0-9]{20,}|postgres(ql)?:\/\/[^\s"']+:[^\s"']+@/;

// 1. Transport and headers
if (base.startsWith("https://")) {
  const res = await fetch(base.replace("https://", "http://") + "/cgu", { redirect: "manual" });
  check("HTTP redirige vers HTTPS", [301, 302, 307, 308].includes(res.status) && res.headers.get("location")?.startsWith("https://"), String(res.status));
}
const page = await get("/sign-in");
const h = (k) => page.headers.get(k) ?? "";
check("HSTS", /max-age=\d{7,}/.test(h("strict-transport-security")));
check("CSP frame-ancestors 'none'", h("content-security-policy").includes("frame-ancestors 'none'"));
check("X-Frame-Options DENY", h("x-frame-options") === "DENY");
check("X-Content-Type-Options nosniff", h("x-content-type-options") === "nosniff");
check("Referrer-Policy", h("referrer-policy") !== "");
check("Pas d'en-tête X-Powered-By", !page.headers.has("x-powered-by"));

// 2. Private pages require a session
for (const path of ["/", "/plants", "/plants/new", "/settings", "/plants/00000000-0000-4000-8000-000000000000", "/plants?loc=archived"]) {
  const res = await get(path);
  const loc = res.headers.get("location") ?? "";
  check(`${path} sans session → connexion`, [302, 303, 307, 308].includes(res.status) && loc.includes("sign-in"), `${res.status} ${loc}`);
}

// 3. Machine endpoints reject forged calls
check("Cron sans jeton → 401", (await get("/api/cron/daily")).status === 401);
check("Cron faux jeton → 401", (await get("/api/cron/daily", { headers: { authorization: "Bearer " + "x".repeat(64) } })).status === 401);
const forged = await get("/api/webhooks/clerk", {
  method: "POST",
  headers: { "content-type": "application/json", "svix-id": "msg_fake", "svix-timestamp": String(Math.floor(Date.now() / 1000)), "svix-signature": "v1,ZmFrZQ==" },
  body: JSON.stringify({ type: "user.deleted", data: { id: "user_victim" } }),
});
check("Webhook signature falsifiée → 400", forged.status === 400, String(forged.status));
check("TRACE refusé", (await get("/", { method: "TRACE" }).catch(() => ({ status: 0 }))).status !== 200);

// 4. Sensitive files and traversal
for (const path of ["/.env", "/.env.local", "/.git/config", "/.vercel/project.json", "/package.json", "/drizzle/0000_sturdy_aqueduct.sql", "/icons/..%2f..%2fpackage.json"]) {
  const res = await get(path);
  const body = res.status === 200 ? await res.text() : "";
  check(`${path} non exposé`, res.status !== 200 || !/DATABASE_URL|"dependencies"|\[core\]|CREATE TABLE/.test(body), String(res.status));
}

// 5. No secret in what the browser downloads; no public source maps
const pages = await Promise.all(["/sign-in", "/cgu", "/confidentialite", "/mentions-legales"].map((p) => get(p).then((r) => r.text())));
const scripts = [...new Set(pages.join("").match(/\/_next\/static\/[^"'\s)]+\.js/g) ?? [])];
let leaks = pages.filter((html) => SECRET.test(html)).length;
for (const src of scripts) if (SECRET.test(await (await get(src)).text())) leaks++;
check(`Aucun secret dans ${scripts.length} scripts + 4 pages`, leaks === 0, `${leaks} fuite(s)`);
if (scripts[0]) check("Source maps non publiques", (await get(scripts[0] + ".map")).status !== 200);

// Report
for (const r of results) console.log(`${r.ok ? "✔" : "✘"} ${r.name}${r.ok || !r.detail ? "" : `  (${r.detail})`}`);
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} contrôles réussis sur ${base}`);
process.exit(failed ? 1 : 0);
