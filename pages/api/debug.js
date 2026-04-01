export default function handler(req, res) {
  const vars = {
    X_API_KEY: process.env.X_API_KEY,
    X_API_SECRET: process.env.X_API_SECRET,
    X_ACCESS_TOKEN: process.env.X_ACCESS_TOKEN,
    X_ACCESS_SECRET: process.env.X_ACCESS_SECRET,
  };

  const info = Object.fromEntries(
    Object.entries(vars).map(([k, v]) => [
      k,
      v ? `${v.slice(0, 6)}...${v.slice(-4)} (len:${v.length})` : "MISSING",
    ])
  );

  return res.status(200).json(info);
}
