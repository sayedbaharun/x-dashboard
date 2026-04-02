function parseCookies(req) {
  const cookie = req.headers.cookie || "";
  return Object.fromEntries(
    cookie.split(";").map(c => c.trim()).filter(Boolean).map(c => {
      const i = c.indexOf("=");
      return [c.slice(0, i), c.slice(i + 1)];
    })
  );
}

export default async function handler(req, res) {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect("/?error=" + encodeURIComponent(error));
  }

  const cookies = parseCookies(req);

  if (!cookies.x_oauth_state || cookies.x_oauth_state !== state) {
    return res.redirect("/?error=invalid_state");
  }

  const verifier = cookies.x_oauth_verifier;
  if (!verifier) {
    return res.redirect("/?error=missing_verifier");
  }

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

    res.setHeader("Set-Cookie", [
      `x_access_token=${data.access_token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=7200`,
      "x_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
      "x_oauth_verifier=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
    ]);

    res.redirect("/");
  } catch (err) {
    res.redirect("/?error=" + encodeURIComponent(err.message));
  }
}
