<p align="center">
  <img src="static/img/banner.png" width="100%" />
</p>

# ChaiBuddy

![Python](https://img.shields.io/badge/Python-3.10-blue)
![Flask](https://img.shields.io/badge/Flask-Framework-black)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)
![Version](https://img.shields.io/badge/Version-2.0-blueviolet)
![Gemini](https://img.shields.io/badge/Powered_by-Google_Gemini-ff6f61?logo=google)
![License](https://img.shields.io/badge/License-MIT-green)

---

# Your AI Companion for Thoughtful Conversations ☕✨

ChaiBuddy is a modern AI-powered chat assistant built with **Flask** and **Google Gemini**. Designed with a minimalist approach, it provides a ChatGPT-like experience without requiring any database setup.

**Zero Setup. Maximum Privacy. Local Chat History.**

---

## 🌟 Key Features

## 🚀 Key Features

### 🧠 Premium AI Models
- ✅ **GitHub Claude 3.5 Sonnet** - Primary model (superior reasoning)
- ✅ **Gemini 2.5-Flash** - Automatic fallback for reliability
- ✅ **Intelligent Fallback** - Switches automatically, zero downtime

### UI/UX Enhancements  
- ✅ **ChatGPT-Style Design** - Modern, intuitive interface with sidebar
- ✅ **Dark/Light Theme** - Beautiful theming with persistent preference
- ✅ **Responsive Layout** - Works perfectly on desktop, tablet, and mobile
- ✅ **Smooth Animations** - Delightful interactions and transitions
- ✅ **Message Actions** - Copy messages, delete messages, view timestamps

### Productivity Features
- ✅ **Chat Search** - Find conversations instantly across all chats
- ✅ **Keyboard Shortcuts** - Ctrl+K for new chat, / to focus input
- ✅ **Suggested Prompts** - Jump-start conversations with quick suggestions
- ✅ **Auto-Expanding Input** - Textarea grows as you type
- ✅ **Message Timestamps** - See exactly when messages were sent

### Security & Performance
- ✅ **Input Validation** - Comprehensive message validation
- ✅ **Rate Limiting** - Protection against abuse (30 requests/min)
- ✅ **CORS Support** - Proper cross-origin request handling
- ✅ **Error Handling** - Detailed error messages and logging
- ✅ **No Database** - Complete privacy, no server storage

---

## 🧠 AI Model Architecture

ChaiBuddy uses a **two-tier AI system** for optimal performance and reliability:

### Primary: GitHub Claude 3.5 Sonnet
- 🏆 **Best-in-class reasoning** and understanding
- ⚡ **Super fast** responses
- 💪 **200K context window** - handles long conversations
- 🆓 **Free** via GitHub (no additional cost)

### Fallback: Google Gemini 2.5-Flash  
- 🔄 **Automatic fallback** if GitHub is unavailable
- 🎯 **Exceptional quality** reasoning
- 📚 **1M context window** - huge capacity
- 🆓 **Free tier** available

**How it works:**
```
Your Message
    ↓
Try Claude 3.5 (GitHub) → Success? ✓ Return Response
    ↓ (if fails)
Auto-fallback to Gemini → Return Response ✓
```

**See:** [GITHUB_MODELS_GUIDE.md](GITHUB_MODELS_GUIDE.md) for detailed setup and troubleshooting.

---

<p align="left">
  <img src="https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/-Flask-000000?logo=flask&logoColor=white" />
  <img src="https://img.shields.io/badge/-Gemini-4285F4?logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/-Vercel-black?logo=vercel&logoColor=white" />
  <img src="https://img.shields.io/badge/-HTML5-E34F26?logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/-CSS3-1572B6?logo=css3&logoColor=white" />
  <img src="https://img.shields.io/badge/-JavaScript-F7DF1E?logo=javascript&logoColor=black" />
</p>

---

## 🚀 Quick Start

### Live Demo
🌍 **Visit**: [ChaiBuddy on Vercel](https://chaibuddy.vercel.app)

### Local Development

#### 1. Clone Repository
```bash
git clone https://github.com/Mohit-cmd-jpg/ChaiBuddy.git
cd ChaiBuddy
```

#### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 3. Setup Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your API keys:
# GITHUB_PAT - Get from: https://github.com/settings/tokens (for Claude 3.5)
# GEMINI_API_KEY - Get from: https://aistudio.google.com/app/apikeys (for fallback)
```

#### 4. Run Locally
```bash
python app.py
```

Open browser: http://localhost:5000

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` / `Cmd+K` | Create new chat |
| `/` | Focus message input |
| `Enter` | Send message |
| `Shift+Enter` | New line in message |
| `Ctrl+Enter` | Alternative send |

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Fork/Clone** this repository on GitHub
2. **Sign in** to [Vercel](https://vercel.com)
3. **Import** your repository
4. **Add environment variables**:
   - `GITHUB_PAT` - Get from https://github.com/settings/tokens (for Claude 3.5 Sonnet)
   - `GEMINI_API_KEY` - Get from https://aistudio.google.com/app/apikeys (for fallback)
   - `FLASK_ENV` - Set to `production`

5. **Deploy!** Vercel automatically deploys on push

**Detailed guide**: See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)

---

## 📁 Project Structure

```
ChaiBuddy/
├── app.py                      # Flask application & API
├── requirements.txt            # Python dependencies
├── vercel.json                 # Vercel configuration
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
│
├── api/
│   ├── __init__.py            # API package
│   └── index.py               # Vercel serverless handler
│
├── templates/
│   └── index.html             # Web interface
│
├── static/
│   ├── css/
│   │   └── style.css          # Modern ChatGPT-style CSS
│   ├── js/
│   │   └── app.js             # Frontend logic (modular)
│   ├── img/
│   │   ├── banner.png
│   │   └── preview.png
│   └── fonts/
│
├── docs/
│   ├── VERCEL_DEPLOYMENT.md   # Deployment guide
│   ├── DATABASE_SETUP.md      # Future database integration
│   └── ENHANCEMENT_COMPLETE.md # What was added
│
└── README.md                   # This file
```

---

## 🔒 Security

- **No Database**: All chat history stays in your browser (localStorage)
- **Environment Variables**: Sensitive keys in `.env`, never committed
- **Input Validation**: All messages validated and sanitized
- **Rate Limiting**: Protection against abuse (30 requests per minute)
- **CORS**: Proper cross-origin request handling
- **Error Handling**: Detailed log messages, generic user responses

---

## 🎨 Features in Detail

### Smart Chat Management
- Create unlimited conversations
- Auto-generated meaningful titles based on content
- One-click delete for entire conversations
- Real-time search across all chats

### Message Actions
- **Copy** - One click to copy bot responses
- **Delete** - Remove individual messages
- **Timestamps** - See when messages were sent
- **Search** - Find text within conversations

### Memory System
- Remembers user preferences (theme, etc.)
- Tracks user profile information
- Stores chat-specific facts
- Maintains context across messages

### Responsive Design
- **Desktop**: Full-featured sidebar + chat area
- **Tablet**: Optimized layout with adapting sidebar
- **Mobile**: Touch-friendly, full-screen chat experience

---

## 📊 Performance

- **Fast**: Initial page load < 2 seconds (Vercel)
- **Efficient**: Optimized JavaScript (modular, no bloat)
- **Smooth**: GPU-accelerated CSS animations
- **Lightweight**: ~200KB total bundle

---

## 🔧 Configuration

### Environment Variables

```env
# Gemini API Key (required)
GEMINI_API_KEY=your_key_here

# GitHub PAT (optional)
GITHUB_PAT=your_pat_here

# Server Settings
FLASK_ENV=production  # or 'development'
PORT=3000            # Vercel default
```

### Rate Limiting
- Default: 30 requests per IP per minute
- Configurable in `app.py`
- Returns 429 when exceeded

---

## 🚀 What's New in v3.0

**🧠 GitHub Models Integration**
- ✨ **Claude 3.5 Sonnet** - Premium AI model (primary)
- ✨ **Automatic fallback** to Gemini for reliability
- ✨ **Model switching** in response logs for monitoring
- ✨ **Zero downtime** with intelligent fallback

**Previous updates (v2.0):**
- Complete UI redesign (ChatGPT-style)
- Message copy/delete functionality
- Chat search with filtering
- Keyboard shortcuts (Ctrl+K, /)
- Enhanced dark mode
- Auto-expanding input textarea
- Message timestamps
- Suggested prompts
- Better error handling
- Rate limiting
- Vercel deployment ready

---

## 📈 Future Enhancements

Planned features (without database):

- [ ] Voice input/output
- [ ] Message editing
- [ ] Conversation templates
- [ ] Export to PDF/Markdown
- [ ] Custom AI personalities
- [ ] Image analysis capability
- [ ] Browser extension
- [ ] Progressive Web App (PWA)

---

## 🐛 Troubleshooting

### "API key error"
- Verify `GEMINI_API_KEY` in `.env`
- Get new key: https://aistudio.google.com/app/apikeys
- Ensure no extra spaces

### Chat not responding
- Check browser console (F12)
- Verify API key is valid
- Check rate limit (30/min per IP)
- Try different browser

### Dark mode not working
- Clear browser cache
- Check localStorage in DevTools
- Try incognito/private window

---

## 📝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini** - AI model powering conversations
- **Flask** - Web framework
- **Vercel** - Deployment platform
- **Community** - Feedback and suggestions

---

## 📧 Contact & Support

- **GitHub Issues**: Report bugs and request features
- **Email**: your-email@example.com (optional)
- **Twitter**: @YourHandle (optional)

---

<p align="center">
  Made with ☕ and ✨ by Mohit<br>
  <a href="https://github.com/Mohit-cmd-jpg/ChaiBuddy">⭐ Star on GitHub</a> • 
  <a href="https://chaibuddy.vercel.app">🌐 Live Demo</a>
</p>

---

**ChaiBuddy - Your AI companion for thoughtful conversations. No database. No complexity. Just great conversations.** ☕✨
│   ├── css/
│   ├── js/
│   └── img/
│── templates/
│   └── index.html
└── README.md
```

---

## ✨ Future Improvements

- Sync chats across devices  
- Database support (PostgreSQL / MongoDB)  

---

## 📄 License

This project is open-source under the MIT License.

---

<p align="center">
  Made with ❤️ by <strong>Mohit Bindal</strong>
</p>

