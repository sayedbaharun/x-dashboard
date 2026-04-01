export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const required = ["X_API_KEY", "X_API_SECRET", "X_ACCESS_TOKEN", "X_ACCESS_SECRET"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    return res.status(500).json({
      configured: false,
      missing,
      error: `Missing env vars: ${missing.join(", ")}`,
    });
  }

  return res.status(200).json({ configured: true });
}
