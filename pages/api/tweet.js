import { TwitterApi } from "twitter-api-v2";

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

  const missing = ["X_API_KEY", "X_API_SECRET", "X_ACCESS_TOKEN", "X_ACCESS_SECRET"].filter(
    (k) => !process.env[k]
  );
  if (missing.length > 0) {
    return res.status(500).json({ error: `Missing env vars: ${missing.join(", ")}` });
  }

  const client = new TwitterApi({
    appKey: process.env.X_API_KEY,
    appSecret: process.env.X_API_SECRET,
    accessToken: process.env.X_ACCESS_TOKEN,
    accessSecret: process.env.X_ACCESS_SECRET,
  });

  try {
    const tweet = await client.v2.tweet(text);
    return res.status(200).json({ data: tweet.data });
  } catch (err) {
    const msg = err?.data?.detail || err?.data?.title || err?.message || "Unknown error";
    return res.status(err?.code || 500).json({ error: msg, detail: err?.data });
  }
}
