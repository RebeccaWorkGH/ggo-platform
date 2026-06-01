# GGO Insights Platform

Autonomous monthly intelligence platform for the Gates Foundation GGO division. Searches the web across all 11 PST areas, synthesizes research into digest format, and powers an interactive leadership briefing.

## What it does

- **Digest Generator** — searches the web and synthesizes the latest research across 11 PST areas (Agriculture, DPI, Education, IFS, Nutrition, WASH, Economic Dev, Women Empowerment, Climate, AI & Innovation, Hari's Corner)
- **Intelligence Briefing** — interactive Q&A powered by the generated digest
- **PDF Export** — beautifully formatted digest with cover page and table of contents

---

## Deploy to Vercel in 5 minutes

### Step 1 — Get your Anthropic API key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account or sign in
3. Navigate to **API Keys** and create a new key
4. Copy the key — you'll need it in Step 4

### Step 2 — Push to GitHub
1. Create a new GitHub repository at [github.com/new](https://github.com/new)
2. Upload all these files, or run:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/ggo-platform.git
git push -u origin main
```

### Step 3 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New → Project**
3. Select your `ggo-platform` repository
4. Click **Deploy** (Vercel auto-detects Next.js — no config needed)

### Step 4 — Add your API key
1. In Vercel, go to your project → **Settings → Environment Variables**
2. Add a new variable:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** your key from Step 1
3. Click **Save**
4. Go to **Deployments** and click **Redeploy** to apply the env variable

Your app is now live at `https://your-project.vercel.app` 🎉

---

## Sharing options

| Option | How |
|--------|-----|
| **Share with team** | Send the Vercel URL — anyone with the link can use it |
| **Password protect** | In Vercel: Settings → Password Protection (Pro plan) |
| **Custom domain** | In Vercel: Settings → Domains → add your own domain |
| **SharePoint embed** | Add an Embed web part in SharePoint, paste the Vercel URL |
| **Restrict to org** | Use Vercel's SSO/SAML integration or add basic auth middleware |

---

## Cost

- **Hosting:** Free on Vercel's hobby plan
- **API usage:** ~$0.01–0.03 per PST section. Full 11-PST digest generation ≈ $0.30. Briefing Q&A ≈ $0.01 per question.
- **Total per month:** Under $5 for typical usage

---

## Local development

```bash
npm install
cp .env.example .env.local
# Add your API key to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project structure

```
ggo-platform/
├── app/
│   ├── api/claude/route.js   # API proxy (keeps key server-side)
│   ├── layout.jsx
│   └── page.jsx
├── components/
│   └── GGOPlatform.jsx       # Main application
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
└── README.md
```
