import { useState } from "react";
import Head from "next/head";

export default function Home() {
  const [tweetText, setTweetText] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);
  const [tweetResult, setTweetResult] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState("");

  async function verifyAccount() {
    setLoading("verify");
    setVerifyResult(null);
    try {
      const res = await fetch("/api/verify");
      const json = await res.json();
      setVerifyResult(json);
      if (json.ok && json.data?.data) {
        setAccount(json.data.data);
      }
    } catch (err) {
      setVerifyResult({ ok: false, error: "Network error: " + err.message });
    }
    setLoading("");
  }

  async function postTweet() {
    if (!tweetText.trim()) return;
    setLoading("tweet");
    setTweetResult(null);
    try {
      const res = await fetch("/api/tweet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: tweetText }),
      });
      const json = await res.json();
      setTweetResult(json);
      if (json.ok) {
        setTweetText("");
      }
    } catch (err) {
      setTweetResult({ ok: false, error: "Network error: " + err.message });
    }
    setLoading("");
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
          <h2 style={styles.cardTitle}>1. Test API Connection</h2>
          <p style={styles.cardDesc}>Calls X API to confirm your credentials work.</p>
          <button onClick={verifyAccount} disabled={loading === "verify"} style={styles.btnSecondary}>
            {loading === "verify" ? "Testing..." : "Test Connection"}
          </button>

          {account && (
            <div style={styles.accountBox}>
              <span style={styles.greenDot}>●</span>
              <strong>@{account.username}</strong> — {account.name}
              {account.public_metrics && (
                <div style={styles.stats}>
                  {account.public_metrics.followers_count} followers · {account.public_metrics.tweet_count} tweets
                </div>
              )}
            </div>
          )}

          {verifyResult && !verifyResult.ok && (
            <div style={styles.errorBox}>
              <strong>Error (HTTP {verifyResult.http_status} {verifyResult.http_status_text})</strong>
              <pre style={styles.pre}>{JSON.stringify(verifyResult.data || verifyResult.error, null, 2)}</pre>
            </div>
          )}
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>2. Post a Tweet</h2>
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
              disabled={loading === "tweet" || !tweetText.trim()}
              style={{
                ...styles.btnPrimary,
                opacity: loading === "tweet" || !tweetText.trim() ? 0.5 : 1,
              }}
            >
              {loading === "tweet" ? "Posting..." : "Post Tweet"}
            </button>
          </div>

          {tweetResult && tweetResult.ok && (
            <div style={styles.successBox}>
              <strong>Tweet posted!</strong>
              {tweetResult.data?.data?.id && (
                <a
                  href={"https://x.com/" + (account?.username || "i") + "/status/" + tweetResult.data.data.id}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.link}
                >
                  View on X →
                </a>
              )}
            </div>
          )}

          {tweetResult && !tweetResult.ok && (
            <div style={styles.errorBox}>
              <strong>Failed (HTTP {tweetResult.http_status} {tweetResult.http_status_text})</strong>
              <pre style={styles.pre}>{JSON.stringify(tweetResult.data || tweetResult.error, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    maxWidth: 520, margin: "0 auto", padding: "40px 20px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#e7e9ea", background: "#000", minHeight: "100vh",
  },
  title: { fontSize: 28, fontWeight: 700, margin: 0, color: "#fff" },
  subtitle: { fontSize: 14, color: "#71767b", marginTop: 4, marginBottom: 32 },
  card: {
    background: "#16181c", borderRadius: 12, padding: 20,
    marginBottom: 16, border: "1px solid #2f3336",
  },
  cardTitle: { fontSize: 16, fontWeight: 600, margin: "0 0 4px 0", color: "#e7e9ea" },
  cardDesc: { fontSize: 13, color: "#71767b", margin: "0 0 12px 0" },
  textarea: {
    width: "100%", minHeight: 100, background: "#000",
    border: "1px solid #2f3336", borderRadius: 8, color: "#e7e9ea",
    fontSize: 15, padding: 12, resize: "vertical",
    fontFamily: "inherit", boxSizing: "border-box", outline: "none",
  },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  charCount: { fontSize: 13, color: "#71767b" },
  btnPrimary: {
    background: "#1d9bf0", color: "#fff", border: "none",
    borderRadius: 20, padding: "8px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
  btnSecondary: {
    background: "transparent", color: "#1d9bf0", border: "1px solid #1d9bf0",
    borderRadius: 20, padding: "8px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
  accountBox: {
    marginTop: 12, padding: 12, background: "#0f1f0f",
    borderRadius: 8, border: "1px solid #22c55e", fontSize: 14,
  },
  greenDot: { color: "#22c55e", marginRight: 6 },
  stats: { color: "#71767b", fontSize: 13, marginTop: 4 },
  successBox: {
    marginTop: 12, padding: 12, background: "#0f1f0f",
    borderRadius: 8, border: "1px solid #22c55e", fontSize: 14,
  },
  errorBox: {
    marginTop: 12, padding: 12, background: "#1f0f0f",
    borderRadius: 8, border: "1px solid #ef4444", fontSize: 13,
  },
  pre: {
    margin: "8px 0 0 0", fontSize: 12, color: "#f87171",
    whiteSpace: "pre-wrap", wordBreak: "break-all", fontFamily: "monospace",
  },
  link: { color: "#1d9bf0", textDecoration: "none", marginLeft: 8, fontSize: 13 },
};
