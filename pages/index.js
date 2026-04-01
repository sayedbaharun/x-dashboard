import { useState } from "react";
import Head from "next/head";

export default function Home() {
  const [tweetText, setTweetText] = useState("");
  const [status, setStatus] = useState(null);
  const [credentialsOk, setCredentialsOk] = useState(null);
  const [loading, setLoading] = useState(false);

  async function verifyAccount() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/verify");
      const data = await res.json();
      if (res.ok && data.configured) {
        setCredentialsOk(true);
        setStatus({ type: "success", msg: "All 4 credentials are configured ✓ — post a tweet to test end-to-end." });
      } else {
        setCredentialsOk(false);
        setStatus({ type: "error", msg: data.error || "Credential check failed." });
      }
    } catch (err) {
      setCredentialsOk(false);
      setStatus({ type: "error", msg: "Network error: " + err.message });
    }
    setLoading(false);
  }

  async function postTweet() {
    if (!tweetText.trim()) return;
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/tweet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: tweetText }),
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setStatus({
          type: "success",
          msg: "Tweet posted! ID: " + data.data.id,
          link: "https://x.com/i/status/" + data.data.id,
        });
        setTweetText("");
      } else {
        setStatus({ type: "error", msg: "Failed: " + JSON.stringify(data.error || data) });
      }
    } catch (err) {
      setStatus({ type: "error", msg: "Network error: " + err.message });
    }
    setLoading(false);
  }

  return (
    <>
      <Head>
        <title>X Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={styles.container}>
        <h1 style={styles.title}>X Dashboard</h1>
        <p style={styles.subtitle}>Post and manage tweets</p>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>1. Check Credentials</h2>
          <p style={styles.hint}>Confirms your Vercel env vars are set. Free-tier safe — no X API call made.</p>
          <button onClick={verifyAccount} disabled={loading} style={styles.btnSecondary}>
            {loading ? "Checking..." : "Check Credentials"}
          </button>
          {credentialsOk === true && (
            <div style={styles.credBadge}>✓ Credentials configured</div>
          )}
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>2. Post a Tweet</h2>
          <p style={styles.hint}>This is the real test — free tier allows posting.</p>
          <textarea
            value={tweetText}
            onChange={(e) => setTweetText(e.target.value)}
            placeholder="What's happening?"
            maxLength={280}
            style={styles.textarea}
          />
          <div style={styles.row}>
            <span style={styles.charCount}>{tweetText.length}/280</span>
            <button
              onClick={postTweet}
              disabled={loading || !tweetText.trim()}
              style={{
                ...styles.btnPrimary,
                opacity: loading || !tweetText.trim() ? 0.5 : 1,
              }}
            >
              {loading ? "Posting..." : "Post Tweet"}
            </button>
          </div>
        </div>

        {status && (
          <div
            style={{
              ...styles.status,
              background: status.type === "success" ? "#0f1f0f" : "#1f0f0f",
              borderColor: status.type === "success" ? "#22c55e" : "#ef4444",
            }}
          >
            <p style={{ margin: 0 }}>{status.msg}</p>
            {status.link && (
              <a href={status.link} target="_blank" rel="noopener noreferrer" style={styles.link}>
                View on X →
              </a>
            )}
          </div>
        )}
      </div>
    </>
  );
}

const styles = {
  container: {
    maxWidth: 520,
    margin: "0 auto",
    padding: "40px 20px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#e7e9ea",
    background: "#000",
    minHeight: "100vh",
  },
  title: { fontSize: 28, fontWeight: 700, margin: 0, color: "#fff" },
  subtitle: { fontSize: 14, color: "#71767b", marginTop: 4, marginBottom: 32 },
  card: {
    background: "#16181c",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    border: "1px solid #2f3336",
  },
  cardTitle: { fontSize: 16, fontWeight: 600, margin: "0 0 4px 0", color: "#e7e9ea" },
  hint: { fontSize: 12, color: "#71767b", margin: "0 0 12px 0" },
  textarea: {
    width: "100%",
    minHeight: 100,
    background: "#000",
    border: "1px solid #2f3336",
    borderRadius: 8,
    color: "#e7e9ea",
    fontSize: 15,
    padding: 12,
    resize: "vertical",
    fontFamily: "inherit",
    boxSizing: "border-box",
    outline: "none",
  },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  charCount: { fontSize: 13, color: "#71767b" },
  btnPrimary: {
    background: "#1d9bf0",
    color: "#fff",
    border: "none",
    borderRadius: 20,
    padding: "8px 20px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnSecondary: {
    background: "transparent",
    color: "#1d9bf0",
    border: "1px solid #1d9bf0",
    borderRadius: 20,
    padding: "8px 20px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  credBadge: {
    marginTop: 12,
    padding: "8px 12px",
    background: "#0f1f0f",
    border: "1px solid #22c55e",
    borderRadius: 8,
    fontSize: 13,
    color: "#22c55e",
    display: "inline-block",
  },
  status: { padding: 16, borderRadius: 12, border: "1px solid", fontSize: 14 },
  link: { color: "#1d9bf0", textDecoration: "none", marginTop: 8, display: "inline-block", fontSize: 13 },
};
