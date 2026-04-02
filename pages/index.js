import { useState, useEffect } from "react";
import Head from "next/head";

export default function Home() {
  const [tweetText, setTweetText] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loggedIn, setLoggedIn] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [tweetResult, setTweetResult] = useState(null);
  const [loading, setLoading] = useState("");
  const [authError, setAuthError] = useState(null);

  const activeAccount = accounts.find(a => a.id === activeId) || accounts[0] || null;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err) {
      setAuthError(decodeURIComponent(err));
      window.history.replaceState({}, "", "/");
    }
    loadAccounts();
  }, []);

  async function loadAccounts() {
    try {
      const res = await fetch("/api/me");
      const d = await res.json();
      setLoggedIn(d.loggedIn);
      setAccounts(d.accounts || []);
      setActiveId(d.activeId);
    } catch {
      setLoggedIn(false);
    }
  }

  async function switchAccount(id) {
    setTweetResult(null);
    setVerifyResult(null);
    await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "switch", id }),
    });
    setActiveId(id);
  }

  async function removeAccount(id) {
    await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove", id }),
    });
    await loadAccounts();
    setTweetResult(null);
    setVerifyResult(null);
  }

  async function verifyAccount() {
    setLoading("verify");
    setVerifyResult(null);
    try {
      const res = await fetch("/api/verify");
      const json = await res.json();
      setVerifyResult(json);
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
      if (json.ok) setTweetText("");
    } catch (err) {
      setTweetResult({ ok: false, error: "Network error: " + err.message });
    }
    setLoading("");
  }

  if (loggedIn === null) {
    return (
      <div style={{ ...styles.container, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#71767b" }}>Loading...</span>
      </div>
    );
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

        {authError && (
          <div style={{ ...styles.errorBox, marginBottom: 16 }}>
            <strong>Auth error:</strong> {authError}
          </div>
        )}

        {!loggedIn ? (
          <div style={styles.loginCard}>
            <p style={styles.loginText}>Connect your X account to get started.</p>
            <a href="/api/auth" style={styles.loginBtn}>
              <XIcon />
              Login with X
            </a>
          </div>
        ) : (
          <>
            {/* Account Switcher */}
            <div style={styles.card}>
              <div style={styles.accountsHeader}>
                <span style={styles.cardTitle}>Accounts</span>
                <a href="/api/auth?add=1" style={styles.addBtn}>+ Add account</a>
              </div>

              <div style={styles.accountsList}>
                {accounts.map(acc => (
                  <div
                    key={acc.id}
                    style={{
                      ...styles.accountPill,
                      ...(acc.id === activeId ? styles.accountPillActive : {}),
                    }}
                    onClick={() => switchAccount(acc.id)}
                  >
                    <div style={styles.accountAvatar}>
                      {(acc.username || "?")[0].toUpperCase()}
                    </div>
                    <div style={styles.accountInfo}>
                      <div style={styles.accountName}>{acc.name || acc.username}</div>
                      <div style={styles.accountHandle}>@{acc.username}</div>
                    </div>
                    {acc.id === activeId && (
                      <div style={styles.activeDot} title="Active" />
                    )}
                    <button
                      style={styles.removeBtn}
                      onClick={e => { e.stopPropagation(); removeAccount(acc.id); }}
                      title="Disconnect"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Verify */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Test Connection</h2>
              <p style={styles.cardDesc}>
                Calls X API for <strong>@{activeAccount?.username}</strong>. Requires Basic tier.
              </p>
              <button onClick={verifyAccount} disabled={loading === "verify"} style={styles.btnSecondary}>
                {loading === "verify" ? "Testing..." : "Test Connection"}
              </button>
              {verifyResult && !verifyResult.ok && (
                <div style={styles.errorBox}>
                  <strong>Error (HTTP {verifyResult.http_status})</strong>
                  <pre style={styles.pre}>{JSON.stringify(verifyResult.data || verifyResult.error, null, 2)}</pre>
                </div>
              )}
              {verifyResult && verifyResult.ok && (
                <div style={styles.successBox}>
                  <strong>Connected ✓</strong>
                  <pre style={styles.pre}>{JSON.stringify(verifyResult.data?.data, null, 2)}</pre>
                </div>
              )}
            </div>

            {/* Post Tweet */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Post a Tweet</h2>
              <p style={styles.cardDesc}>
                Posting as <strong>@{activeAccount?.username}</strong>
              </p>
              <textarea
                value={tweetText}
                onChange={e => setTweetText(e.target.value)}
                placeholder="What's happening?"
                maxLength={280}
                style={styles.textarea}
              />
              <div style={styles.row}>
                <span style={styles.charCount}>{tweetText.length}/280</span>
                <button
                  onClick={postTweet}
                  disabled={loading === "tweet" || !tweetText.trim()}
                  style={{ ...styles.btnPrimary, opacity: loading === "tweet" || !tweetText.trim() ? 0.5 : 1 }}
                >
                  {loading === "tweet" ? "Posting..." : "Post Tweet"}
                </button>
              </div>

              {tweetResult && tweetResult.ok && (
                <div style={styles.successBox}>
                  <strong>Tweet posted!</strong>
                  {tweetResult.data?.data?.id && (
                    <a
                      href={`https://x.com/${activeAccount?.username || "i"}/status/${tweetResult.data.data.id}`}
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
                  <strong>Failed (HTTP {tweetResult.http_status})</strong>
                  <pre style={styles.pre}>{JSON.stringify(tweetResult.data || tweetResult.error, null, 2)}</pre>
                </div>
              )}
            </div>

            <div style={{ textAlign: "center", marginTop: 8 }}>
              <a href="/api/logout" style={styles.logoutLink}>Disconnect all accounts</a>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 8, verticalAlign: "middle" }}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
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
  cardTitle: { fontSize: 15, fontWeight: 600, color: "#e7e9ea" },
  cardDesc: { fontSize: 13, color: "#71767b", margin: "4px 0 12px 0" },
  accountsHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  addBtn: {
    fontSize: 13, color: "#1d9bf0", textDecoration: "none",
    border: "1px solid #1d9bf0", borderRadius: 20, padding: "4px 12px",
  },
  accountsList: { display: "flex", flexDirection: "column", gap: 8 },
  accountPill: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 12px", borderRadius: 10,
    border: "1px solid #2f3336", cursor: "pointer",
    background: "#0d0d0d", transition: "border-color 0.15s",
  },
  accountPillActive: { border: "1px solid #1d9bf0", background: "#001824" },
  accountAvatar: {
    width: 36, height: 36, borderRadius: "50%",
    background: "#1d9bf0", color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 15, fontWeight: 700, flexShrink: 0,
  },
  accountInfo: { flex: 1, minWidth: 0 },
  accountName: { fontSize: 14, fontWeight: 600, color: "#e7e9ea", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  accountHandle: { fontSize: 12, color: "#71767b" },
  activeDot: { width: 8, height: 8, borderRadius: "50%", background: "#1d9bf0", flexShrink: 0 },
  removeBtn: {
    background: "none", border: "none", color: "#71767b",
    fontSize: 18, cursor: "pointer", padding: "0 4px", lineHeight: 1, flexShrink: 0,
  },
  loginCard: {
    background: "#16181c", borderRadius: 12, padding: 32,
    border: "1px solid #2f3336", textAlign: "center",
  },
  loginText: { color: "#71767b", fontSize: 15, marginTop: 0, marginBottom: 24 },
  loginBtn: {
    display: "inline-flex", alignItems: "center",
    background: "#fff", color: "#000",
    borderRadius: 20, padding: "10px 24px",
    fontSize: 15, fontWeight: 700, textDecoration: "none",
  },
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
  logoutLink: { fontSize: 13, color: "#71767b", textDecoration: "none" },
};
