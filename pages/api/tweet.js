import OAuth from "oauth-1.0a";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: "Tweet text is required" });
  }

  if (text.length > 280) {
    return res.status(400).json({ error: "Tweet exceeds 280 characters" });
  }

  // Surface missing env vars early
  const missing = ["X_API_KEY", "X_API_SECRET", "X_ACCESS_TOKEN", "X_ACCESS_SECRET"].filter(
    (k) => !process.env[k]
  );
  if (missing.length > 0) {
    return res.status(500).json({ error: `Missing env vars: ${missing.join(", ")}` });
  }

  const oauth = new OAuth({
    consumer: {
      key: process.env.X_API_KEY,
      secret: process.env.X_API_SECRET,
    },
    signature_method: "HMAC-SHA1",
    hash_function(baseString, key) {
      return crypto.createHmac("sha1", key).update(baseString).digest("base64");
    },
  });

  const token = {
    key: process.env.X_ACCESS_TOKEN,
    secret: process.env.X_ACCESS_SECRET,
  };

  const url = "https://api.twitter.com/2/tweets";

  const authHeader = oauth.toHeader(
    oauth.authorize({ url, method: "POST" }, token)
  );

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Return full X error body so the UI can show it
      return res.status(response.status).json({
        error: data.detail || data.title || JSON.stringify(data),
        detail: data,
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
