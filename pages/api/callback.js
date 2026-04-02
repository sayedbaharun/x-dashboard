import crypto from "crypto";

function parseCookies(req) {
  const cookie = req.headers.cookie || "";
  return Object.fromEntries(
    cookie.split(";").map(c => c.trim()).filter(Boolean).map(c => {
      const i = c.indexOf("=");
      return [c.slice(0, i), c.slice(i + 1)];
    })
  );
}

function getAccounts(cookies) {
  try {
    return JSON.parse(decodeURIComponent(cookies.x_accounts || "[]"));
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  const { code, state, error } = req.query;

  if (error) return res.redirect("/?error=" + encodeURIComponent(error));

  const cookies = parseCookies(req);

  if (!cookies.x_oauth_state || cookies.x_oauth_state !== state) {
    return res.redirect("/?error=invalid_state");
  }

  const verifier = cookies.x_oauth_verifier;
  if (!verifier) return res.redirect("/?error=missing_verifier");

  try {
    const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(
          `${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`
        ).toString("base64"),
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.X_REDIRECT_URI,
        code_verifier: verifier,
      }).toString(),
    });

    const data = await tokenRes.json();
    if (!tokenRes.ok || !data.access_token) {
      return res.redirect("/?error=" + encodeURIComponent(data.error_description || "token_exchange_failed"));
    }

    const newToken = data.access_token;

    // Try to get username with the new token
    let username = null;
    let name = null;
    try {
      const userRes = await fetch("https://api.twitter.com/2/users/me", {
        headers: { Authorization: `Bearer ${newToken}` },
      });
      if (userRes.ok) {
        const ud = await userRes.json();
        username = ud.data?.username || null;
        name = ud.data?.name || null;
      }
    } catch {}

    // Merge into existing accounts list
    const accounts = getAccounts(cookies);
    const existingIdx = username ? accounts.findIndex(a => a.username === username) : -1;

    let accountId;
    if (existingIdx >= 0) {
      // Update token for existing account
      accounts[existingIdx].token = newToken;
      if (name) accounts[existingIdx].name = name;
      accountId = accounts[existingIdx].id;
    } else {
      accountId = crypto.randomBytes(8).toString("hex");
      accounts.push({
        id: accountId,
        username: username || `account_${accounts.length + 1}`,
        name: name || "",
        token: newToken,
      });
    }

    const encoded = encodeURIComponent(JSON.stringify(accounts));
    const cookieOpts = "HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400";
    res.setHeader("Set-Cookie", [
      `x_accounts=${encoded}; ${cookieOpts}`,
      `x_active_id=${accountId}; ${cookieOpts}`,
      "x_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
      "x_oauth_verifier=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
    ]);

    res.redirect("/");
  } catch (err) {
    res.redirect("/?error=" + encodeURIComponent(err.message));
  }
}
