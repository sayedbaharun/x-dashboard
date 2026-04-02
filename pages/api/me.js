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
  const cookies = parseCookies(req);
  let accounts = [];
  try {
    accounts = JSON.parse(decodeURIComponent(cookies.x_accounts || "[]"));
  } catch {}

  const activeId = cookies.x_active_id || accounts[0]?.id || null;

  return res.status(200).json({
    loggedIn: accounts.length > 0,
    // Strip tokens before sending to frontend
    accounts: accounts.map(({ id, username, name }) => ({ id, username, name })),
    activeId,
  });
}
