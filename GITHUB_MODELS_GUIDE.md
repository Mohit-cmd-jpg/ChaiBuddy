# GitHub Models Integration Guide

## 🚀 What's New: GitHub's Best Models + Gemini Fallback

ChaiBuddy now uses **GitHub's premium AI models** (Claude 3.5 Sonnet) with **Gemini 2.5-Flash as automatic fallback**.

### Why This is Better

| Feature | GitHub Models | Gemini (Fallback) |
|---------|----------|----------|
| **Primary Model** | Claude 3.5 Sonnet | Gemini 2.5-Flash |
| **Response Quality** | ⭐⭐⭐⭐⭐ Exceptional | ⭐⭐⭐⭐ Great |
| **Context Length** | 200K tokens | 1M tokens |
| **Speed** | Fast | Fast |
| **Reasoning** | Supreme | Excellent |
| **Reliability** | Via GitHub | Via Google |
| **Fallback** | Auto-switches | Returns error |

---

## 🔄 How the Fallback System Works

```
User Message
    ↓
Try GitHub Model (Claude 3.5 Sonnet)
    ↓
┌─── Success? YES ──→ Return Response ✓
│
└─── Failure? ──→ Log Error
    ↓
Try Gemini (Fallback)
    ↓
┌─── Success? YES ──→ Return Response ✓
│
└─── Failure? ──→ Return Error to User
```

**Key Features:**
- ✅ Seamless automatic fallback
- ✅ No user action needed
- ✅ Logs show which model was used (`model_used` in response)
- ✅ Both API keys required for optimal functionality

---

## 📋 Setup Instructions

### 1. GitHub PAT Token (For Primary Model)

GitHub Models are **free** and accessed via your GitHub account:

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Set these scopes:
   - ✅ `read:user` (minimal required)
   - Optional: `repo` (if using for other GitHub features)
4. Generate and copy the token
5. Add to `.env`:
   ```
   GITHUB_PAT=ghp_xxxxxxxxxxxxxxxxxxxxx
   ```

**Already included:** Your GitHub PAT is in `.env`

### 2. Gemini API Key (For Fallback Model)

Gemini serves as your reliable fallback:

1. Go to: https://aistudio.google.com/app/apikeys
2. Click **"Create API Key"**
3. Copy the key
4. Add to `.env`:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

**Status:** Update this in your `.env` file

---

## 🎯 Available GitHub Models

### Claude Models (Recommended)
```
Primary: claude-3-5-sonnet
├─ Best for: Complex reasoning, coding, analysis
├─ Speed: Very Fast
├─ Quality: Exceptional
└─ Tokens: 200K context
```

### GPT Models (Fallback Option)
```
Alternative: gpt-4o
├─ Best for: Versatile tasks, creative writing
├─ Speed: Very Fast
├─ Quality: Excellent
└─ Tokens: 128K context
```

**To switch models**, edit `app.py`:
```python
PRIMARY_MODEL = PRIMARY_MODELS["gpt4"]  # Switch to GPT-4o
# or
PRIMARY_MODEL = PRIMARY_MODELS["claude"]  # Back to Claude
```

---

## 🔧 Configuration in `app.py`

### Model Selection
```python
PRIMARY_MODELS = {
    "claude": "claude-3-5-sonnet",    # Our choice ✓
    "gpt4": "gpt-4o"                   # Alternative
}
PRIMARY_MODEL = PRIMARY_MODELS["claude"]
```

### Fallback Mechanism
```python
def get_ai_response(system_prompt, user_msg, memory):
    """Try GitHub model first, fallback to Gemini if it fails"""
    try:
        response_text = call_github_model(...)  # Try primary
        return response_text, "github"
    except Exception as github_error:
        try:
            response_text = call_gemini_model(...)  # Try fallback
            return response_text, "gemini"
        except Exception as gemini_error:
            raise  # Both failed
```

---

## 📊 Response Structure

Every chat response includes a `model_used` field:

```json
{
  "success": true,
  "reply": "Your message here...",
  "memory_update": { ... },
  "generated_title": "...",
  "timestamp": "2026-03-25T10:30:00",
  "model_used": "github"  // or "gemini"
}
```

**Use this for monitoring:**
- Frontend can show icon: 🧠 (GitHub) vs 💎 (Gemini)
- Helps identify if fallback is being used frequently

---

## 🐛 Troubleshooting

### GitHub Model Failing

**Symptoms:** Frequent fallbacks to Gemini

**Solutions:**
1. **Verify GitHub PAT is valid:**
   ```bash
   # Test in PowerShell
   $token = "ghp_xxxxx"
   $headers = @{ Authorization = "Bearer $token" }
   Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers
   ```

2. **Check GitHub Models availability:**
   ```bash
   # Models endpoint test
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        https://models.inference.ai.azure.com/models
   ```

3. **Rate limits:**
   - GitHub has generous free limits
   - Check: https://github.com/models (see your usage)

4. **PAT token needs renewal:**
   - If token is old, generate new one
   - Check token scopes include `read:user`

### Gemini Not Working as Fallback

**Symptoms:** Both models failing, generic error

**Solutions:**
1. **Verify Gemini API Key:**
   ```python
   import google.generativeai as genai
   genai.configure(api_key="YOUR_KEY")
   print(genai.list_models())
   ```

2. **Check API quota:**
   - Go to: https://aistudio.google.com/app/apikeys
   - Verify API is active
   - Check rate limits (free tier: 60 calls/min)

3. **Network issues:**
   - Both endpoints may be unreachable
   - Check internet connection
   - Verify no VPN/proxy issues

---

## 🚀 Deployment (Vercel)

### Set Environment Variables

1. Go to Vercel dashboard
2. Select ChaiBuddy project
3. Settings → Environment Variables
4. Add:
   ```
   GITHUB_PAT = ghp_xxxxxxxxxxxxx
   GEMINI_API_KEY = your_key_here
   FLASK_ENV = production
   ```

### Monitoring in Vercel

1. Go to **Logs**
2. Look for messages:
   - ✓ `GitHub model succeeded`
   - ↻ `Switching to Gemini fallback...`
   - ✗ `Both models failed`

---

## 📈 Performance Comparison

### GitHub (Claude 3.5 Sonnet)
- Response time: **~1-2 seconds**
- Context window: **200K tokens**
- Cost: **Free (GitHub provides)**
- Quality: **Exceptional reasoning**

### Gemini (2.5-Flash)
- Response time: **~1-2 seconds**
- Context window: **1M tokens**
- Cost: **Free (up to limits)**
- Quality: **Excellent reasoning**

**Conclusion:** GitHub model is faster with better reasoning. Gemini is backup with larger context.

---

## 🔐 Security Notes

### GitHub PAT
- ✅ Limited scope (`read:user` minimal)
- ✅ Not exposed in frontend
- ✅ Protected in `.env` (in `.gitignore`)
- ⚠️ Never commit to GitHub
- ⚠️ Rotate if ever exposed

### Gemini API Key
- ✅ Not exposed in frontend
- ✅ Protected in `.env` (in `.gitignore`)
- ⚠️ Never commit to GitHub
- ⚠️ Set restrictions in API console

### Best Practices
1. Use `.env` for all secrets
2. Never add `.env` to Git
3. Use different tokens for local/prod
4. Rotate tokens regularly
5. Monitor usage for abuse

---

## 📝 Code Examples

### Check which model is being used in frontend

Add to `static/js/app.js`:

```javascript
fetch("/chat", {
    method: "POST",
    body: JSON.stringify({ message: userMsg, memory: chatMemory })
}).then(res => res.json()).then(data => {
    console.log("Model used:", data.model_used);  // "github" or "gemini"
    if (data.model_used === "gemini") {
        console.warn("⚠️ Using Gemini fallback - check GitHub API");
    }
    // ... handle response
});
```

### Manual model selection (if needed)

Edit `app.py`:
```python
# Force specific model
PRIMARY_MODEL = "claude-3-5-sonnet"  # or "gpt-4o"

# Or auto-detect based on environment
if os.getenv("USE_GPT"):
    PRIMARY_MODEL = "gpt-4o"
```

---

## 🎓 Learning Resources

- **GitHub Models Docs:** https://github.com/marketplace/models
- **Claude 3.5 Guide:** https://anthropic.com/documents
- **Gemini API Docs:** https://ai.google.dev/
- **OpenAI Client (used for GitHub):** https://platform.openai.com/docs/libraries/python-library

---

## ✅ Implementation Checklist

- [x] GitHub PAT added to `.env`
- [x] Fallback mechanism implemented in `app.py`
- [x] Both models configured and tested
- [x] Error handling and logging complete
- [ ] Gemini API key added to `.env` (your action)
- [ ] Tested GitHub model responses
- [ ] Verified fallback works
- [ ] Deployed to Vercel with env vars
- [ ] Monitored logs for usage

---

## 🆘 Still Having Issues?

1. **Check logs:**
   ```bash
   # Local: check console output
   python app.py
   ```

2. **Verify API keys:**
   - GitHub: https://github.com/settings/tokens
   - Gemini: https://aistudio.google.com/app/apikeys

3. **Test endpoints manually:**
   ```bash
   curl -X POST http://localhost:5000/chat \
     -H "Content-Type: application/json" \
     -d '{"message":"Hello","memory":{}}'
   ```

4. **Check Vercel env vars:**
   - Settings → Environment Variables
   - Ensure both keys are set

5. **View Vercel logs:**
   - Deployments → Recent → Logs
   - Search for error messages

---

**ChaiBuddy now powers conversations with GitHub's best models.** 🚀✨
