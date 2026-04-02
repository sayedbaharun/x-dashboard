export default function handler(req, res) {
  res.setHeader("Set-Cookie", "x_access_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0");
  res.redirect("/");
}
