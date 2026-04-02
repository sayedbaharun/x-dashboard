import OAuth from "oauth-1.0a";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ ok: false, error: "Tweet text is required" });
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
      body: JSON.stringify({ text: text.trim() }),
    });

    const raw = await response.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = { raw_response: raw };
    }

    return res.status(200).json({
      ok: response.ok,
      http_status: response.status,
      http_status_text: response.statusText,
      data: data,
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}
