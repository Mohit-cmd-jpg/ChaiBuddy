# 🚀 Deployment Guide - ChaiBuddy on Vercel

This guide walks you through deploying ChaiBuddy to Vercel with zero database setup required.

## Prerequisites

- ✅ GitHub account with your repository
- ✅ Vercel account (https://vercel.com)
- ✅ Google Gemini API Key (https://aistudio.google.com/app/apikeys)
- ✅ GitHub PAT (Personal Access Token) - for future integrations

---

## 1️⃣ GitHub Setup

### Step 1: Initialize Git Repository

```bash
cd "path/to/chai buddy"
git init
git add .
git commit -m "Initial commit: ChaiBuddy with Vercel deployment"
```

### Step 2: Create GitHub Repository

1. Go to: https://github.com/new
2. Create repository named `ChaiBuddy`
3. Copy the commands shown:

```bash
git remote add origin https://github.com/YOUR-USERNAME/ChaiBuddy.git
git branch -M main
git push -u origin main
```

Replace `YOUR-USERNAME` with your actual GitHub username.

---

## 2️⃣ Vercel Deployment

### Option A: Connect via GitHub (Recommended)

1. **Sign in to Vercel**: https://vercel.com
2. Click "Add New Project"
3. Select "Import Git Repository"
4. Select your ChaiBuddy repository
5. Click "Import"
6. Configure environment variables (next step)

### Option B: Deploy via CLI

```bash
npm install -g vercel
vercel
# Follow the prompts
```

---

## 3️⃣ Environment Variables

### In Vercel Dashboard:

1. Go to your project settings
2. Click "Environment Variables"
3. Add these variables:

| Key | Value | Notes |
|-----|-------|-------|
| `GEMINI_API_KEY` | Your actual API key | Get from https://aistudio.google.com/app/apikeys |
| `GITHUB_PAT` | Your GitHub PAT | Optional, for future features |
| `FLASK_ENV` | `production` | Automatic |
| `PORT` | `3000` | Vercel default |

**⚠️ Never commit `.env` file with real keys!**

---

## 4️⃣ Verify Deployment

After deployment completes:

1. Visit your Vercel URL (e.g., `https://chaibuddy-xxxxx.vercel.app`)
2. Test in browser:
   - Create new chat (Ctrl+K)
   - Send a message
   - Copy message
   - Search chats
   - Toggle dark mode

3. Check API health endpoint:
   ```
   https://your-vercel-url.com/health
   ```
   Should return:
   ```json
   {
     "status": "healthy",
     "timestamp": "2026-03-25T..."
   }
   ```

---

## 5️⃣ Troubleshooting

### Build Fails
- Check Python version (3.8+)
- Verify `requirements.txt` is at root
- Check `api/index.py` exists

### Missing API Key Error
- Ensure `GEMINI_API_KEY` is set in Vercel environment variables
- Check spelling (case-sensitive)
- Go to https://aistudio.google.com/app/apikeys to get a new key

### Chat Not Responding
- Check browser console for errors (F12)
- Verify API key is valid
- Check rate limiting (max 30 requests/min per IP)
- View logs in Vercel dashboard

### Performance Issues
- Vercel free tier has 10-second timeout
- Upgrade to Pro for longer responses if needed
- Monitor response times in Vercel dashboard

---

## 6️⃣ Local Development

### Run Locally

```bash
# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start server
python app.py

# Open browser
http://localhost:5000
```

### Make Changes & Push

```bash
git add .
git commit -m "Feature: Add description here"
git push origin main
```

Vercel automatically redeploys on push!

---

## 7️⃣ Security Checklist

- ✅ `.env` is in `.gitignore`
- ✅ `.env.example` has no real keys
- ✅ `GEMINI_API_KEY` only in Vercel environment variables
- ✅ `GITHUB_PAT` is secure and never committed
- ✅ Rate limiting enabled (30/min)
- ✅ Input validation enabled
- ✅ CORS configured
- ✅ Error handlers properly configured

---

## 8️⃣ If GitHub PAT is Compromised

Your PAT token was exposed in the setup. **Follow these steps:**

1. **Revoke immediately:**
   - Go to: https://github.com/settings/tokens
   - Find the compromised token
   - Click "Delete"

2. **Generate new token:**
   - Go to: https://github.com/settings/tokens/new
   - Name: "ChaiBuddy PAT"
   - Scopes: `repo`, `read:user`
   - Copy the new token

3. **Update Vercel:**
   - Go to Vercel dashboard > Settings > Environment Variables
   - Update `GITHUB_PAT` with new token

---

## 9️⃣ Custom Domain (Optional)

1. Go to Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records from registrar
5. Wait for SSL certificate (usually < 5 min)

---

## 🔟 Monitoring & Logs

### View Logs
- Vercel Dashboard > Project > Logs
- Real-time logs for debugging
- Function logs for serverless execution

### Monitor Performance
- Vercel Insights > Analytics
- Track response times
- Monitor API usage
- View most popular endpoints

---

## 🔥 Advanced: Upgrade Without Database

To improve without database:

1. **Cache Responses** - Redis integration
2. **Analytics** - Vercel Analytics
3. **Rate Limiting** - Enhanced with database
4. **User Sessions** - JWT tokens with localStorage
5. **Conversation Export** - PDF generation

All possible without a database!

---

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Flask Docs**: https://flask.palletsprojects.com
- **Gemini API**: https://ai.google.dev
- **GitHub Help**: https://docs.github.com

---

**Deployment complete! Your ChaiBuddy is live on Vercel! 🚀☕✨**
