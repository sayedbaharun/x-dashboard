export default function handler(req, res) {
  res.setHeader("Set-Cookie", [
    "x_accounts=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
    "x_active_id=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
  ]);
  res.redirect("/");
}
