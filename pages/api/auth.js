import crypto from "crypto";

export default function handler(req, res) {
  if (!process.env.X_CLIENT_ID || !process.env.X_REDIRECT_URI) {
    return res.status(500).json({ error: "Missing X_CLIENT_ID or X_REDIRECT_URI env vars" });
  }

  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
  const state = crypto.randomBytes(16).toString("hex");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.X_CLIENT_ID,
    redirect_uri: process.env.X_REDIRECT_URI,
    scope: "tweet.read tweet.write users.read",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  // force_login=true when adding another account so X shows account picker
  if (req.query.add) {
    params.set("force_login", "true");
  }

  const cookieOpts = "HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600";
  res.setHeader("Set-Cookie", [
    `x_oauth_state=${state}; ${cookieOpts}`,
    `x_oauth_verifier=${verifier}; ${cookieOpts}`,
  ]);

  res.redirect(`https://x.com/i/oauth2/authorize?${params.toString()}`);
}
