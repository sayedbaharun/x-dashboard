function parseCookies(req) {
  const cookie = req.headers.cookie || "";
  return Object.fromEntries(
    cookie.split(";").map(c => c.trim()).filter(Boolean).map(c => {
      const i = c.indexOf("=");
      return [c.slice(0, i), c.slice(i + 1)];
    })
  );
}

function getActiveToken(req) {
  const cookies = parseCookies(req);
  let accounts = [];
  try { accounts = JSON.parse(decodeURIComponent(cookies.x_accounts || "[]")); } catch {}
  const activeId = cookies.x_active_id;
  return accounts.find(a => a.id === activeId)?.token || accounts[0]?.token || null;
}

export default async function handler(req, res) {
  const token = getActiveToken(req);
  if (!token) return res.status(401).json({ ok: false, error: "Not logged in" });

  try {
    const response = await fetch(
      "https://api.twitter.com/2/users/me?user.fields=profile_image_url,public_metrics",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const raw = await response.text();
    let data;
    try { data = JSON.parse(raw); } catch { data = { raw_response: raw }; }
    return res.status(200).json({ ok: response.ok, http_status: response.status, http_status_text: response.statusText, data });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
