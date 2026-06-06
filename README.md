# 🌾 AgriSense AI

தமிழ்நாடு விவசாயிகளுக்கான AI உதவியாளர் — Tamil Nadu Smart Farming Assistant

---

## 🚀 Deploy to Vercel (Step-by-Step)

### Step 1 — Get your Anthropic API Key
1. Go to https://console.anthropic.com
2. Sign up / Log in
3. Click **"API Keys"** → **"Create Key"**
4. Copy the key (starts with `sk-ant-...`)

### Step 2 — Upload to GitHub
1. Go to https://github.com → Sign up / Log in
2. Click **"New repository"** → name it `agrisense-ai` → Create
3. Upload all these project files (drag & drop or use GitHub Desktop)

### Step 3 — Deploy on Vercel
1. Go to https://vercel.com → Sign up with GitHub
2. Click **"Add New Project"**
3. Select your `agrisense-ai` repository → Click **"Import"**
4. Before clicking Deploy, click **"Environment Variables"**
5. Add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-...` (your key from Step 1)
6. Click **"Deploy"** 🎉

### Step 4 — Done!
Your app is live at: `https://agrisense-ai.vercel.app`

---

## 📁 Project Structure

```
agrisense/
├── api/
│   └── chat.js          ← 🔒 Secure backend (API key lives here)
├── src/
│   ├── App.js           ← Main React app
│   └── index.js         ← Entry point
├── public/
│   └── index.html       ← HTML template
├── package.json
├── vercel.json          ← Vercel configuration
└── .env.example         ← Copy to .env.local for local dev
```

## 🔒 Security
- API key is stored in Vercel's secure environment variables
- Frontend NEVER sees the API key
- All AI calls go through `/api/chat` backend route

## 💻 Run Locally
```bash
npm install
cp .env.example .env.local
# Add your API key to .env.local
npm start
```
