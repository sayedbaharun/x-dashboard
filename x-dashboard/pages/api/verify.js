import OAuth from "oauth-1.0a";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
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

  const url = "https://api.twitter.com/2/users/me?user.fields=profile_image_url,public_metrics,description";

  const authHeader = oauth.toHeader(
    oauth.authorize({ url, method: "GET" }, token)
  );

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
