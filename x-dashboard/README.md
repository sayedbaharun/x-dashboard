# X Dashboard

A minimal web app to post tweets from your browser.

---

## HOW TO DEPLOY (Copy-Paste Steps)

### Step 1: Create a GitHub Repo

1. Go to **github.com/new**
2. Name it `x-dashboard`
3. Set it to **Private**
4. Click **Create repository**

### Step 2: Upload These Files

1. On the repo page, click **"uploading an existing file"**
2. Drag and drop ALL the files/folders from this project:
   - `package.json`
   - `pages/` folder (contains `index.js` and `api/` folder)
3. Click **Commit changes**

> **IMPORTANT:** Do NOT upload `.env.local` — those secrets go in Vercel instead.

### Step 3: Deploy on Vercel

1. Go to **vercel.com/new**
2. Click **Import** next to your `x-dashboard` repo
3. Before clicking Deploy, expand **Environment Variables**
4. Add these 5 variables one by one:

| Name              | Value                          |
|-------------------|--------------------------------|
| X_API_KEY         | (your API key)                 |
| X_API_SECRET      | (your API key secret)          |
| X_BEARER_TOKEN    | (your bearer token)            |
| X_ACCESS_TOKEN    | (your access token)            |
| X_ACCESS_SECRET   | (your access token secret)     |

5. Click **Deploy**
6. Wait ~60 seconds — you'll get a live URL like `x-dashboard-xxx.vercel.app`

### Step 4: Test It

1. Open your Vercel URL
2. Click **Test Connection** — it should show your @username
3. Type a test tweet and hit **Post Tweet**
4. Check your X profile to confirm it worked!

---

## SECURITY NOTES

- Keep the repo **Private** on GitHub
- Never share your `.env.local` file
- Your API keys are safe in Vercel's encrypted environment variables
- Consider regenerating your X API keys after sharing them in chat
