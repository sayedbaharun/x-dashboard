function parseCookies(req) {
  const cookie = req.headers.cookie || "";
  return Object.fromEntries(
    cookie.split(";").map(c => c.trim()).filter(Boolean).map(c => {
      const i = c.indexOf("=");
      return [c.slice(0, i), c.slice(i + 1)];
    })
  );
}

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { action, id } = req.body;
  const cookies = parseCookies(req);

  let accounts = [];
  try {
    accounts = JSON.parse(decodeURIComponent(cookies.x_accounts || "[]"));
  } catch {}

  const cookieOpts = "HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400";

  if (action === "switch") {
    const exists = accounts.find(a => a.id === id);
    if (!exists) return res.status(404).json({ error: "Account not found" });
    res.setHeader("Set-Cookie", `x_active_id=${id}; ${cookieOpts}`);
    return res.status(200).json({ ok: true });
  }

  if (action === "remove") {
    const updated = accounts.filter(a => a.id !== id);
    const encoded = encodeURIComponent(JSON.stringify(updated));
    const newActive = updated[0]?.id || "";
    res.setHeader("Set-Cookie", [
      `x_accounts=${encoded}; ${cookieOpts}`,
      `x_active_id=${newActive}; ${cookieOpts}`,
    ]);
    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ error: "Unknown action" });
}
