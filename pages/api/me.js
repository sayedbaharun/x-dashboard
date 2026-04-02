function parseCookies(req) {
  const cookie = req.headers.cookie || "";
  return Object.fromEntries(
    cookie.split(";").map(c => c.trim()).filter(Boolean).map(c => {
      const i = c.indexOf("=");
      return [c.slice(0, i), c.slice(i + 1)];
    })
  );
}

export default function handler(req, res) {
  const cookies = parseCookies(req);
  return res.status(200).json({ loggedIn: !!cookies.x_access_token });
}
