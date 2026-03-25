# ChaiBuddy ☕

ChaiBuddy is a modern, responsive, and sleek AI chat companion featuring a beautiful user interface modeled after industry standards (like ChatGPT). Built with a lightweight Flask backend and a vanilla HTML/CSS/JS frontend, it focuses on pure performance and aesthetics.

## 🌐 Live Website
The project is completely deployed and accessible online:
**[https://chaibuddy-chatbot.vercel.app/](https://chaibuddy-chatbot.vercel.app/)**

## ✨ Key Features
- **Premium UI/UX:** A sleek chat interface offering an authentic ChatGPT-style layout with custom avatars, proper spacing, and fluid message bubbles.
- **Smart Chat Naming:** The AI directly analyzes the conversations to generate smart, contextual titles for each chat session, saving them natively to the sidebar.
- **Auto Dark/Light Mode:** Includes a fully featured local-storage backed theme switcher for accessibility and choice.
- **Persistent Local History:** Chat memories, user inputs, and AI facts are durably kept client-side.
- **Vercel Serverless Back-end:** API powered entirely via serverless python functions using Flask.

## 🚀 Tech Stack
- Frontend: Vanilla JS, Semantic HTML5, CSS Variables, and responsive Grid/Flex modules.
- Backend: Python 3.9+ with Flask.
- AI Models: Integrated Google Gemini 2.5 and OpenAI standard formats fallback architectures.
- Deployment Platform: Vercel.

## 💻 Local Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Establish your `.env` variables for API keys (`GEMINI_API_KEY`).
4. Run locally:
   ```bash
   python app.py
   ```
5. View your deployment at `http://127.0.0.1:5000/`.

## 📌 Usage Expectations
ChaiBuddy leverages the Vercel ecosystem; therefore `vercel.json` provides standard serverless rerouting instructions pointing local endpoints efficiently to `/api/index.py`.
