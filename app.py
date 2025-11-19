from flask import Flask, request, jsonify, render_template
import google.generativeai as genai
import os
from dotenv import load_dotenv
import json

load_dotenv()

app = Flask(__name__)

# -------------------------------------------------
# CONFIGURE GEMINI
# -------------------------------------------------
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("models/gemini-2.5-flash")

# -------------------------------------------------
# SYSTEM INSTRUCTIONS — FOR JSON OUTPUT
# -------------------------------------------------
SYSTEM_PROMPT = """
You are ChaiBuddy — a warm, cheerful, emoji-rich AI friend ☕✨

Your job:
1. Reply naturally to the user in the field "reply".
2. Detect memory-worthy information and store it in "memory_update".
3. Suggest a short chat title in "generated_title".
4. ALWAYS output a CLEAN JSON OBJECT. No normal text outside JSON.

------------------------------------
### JSON FORMAT (CRITICAL)
------------------------------------
You MUST output ONLY this:

{
  "reply": "...",
  "memory_update": {
    "user_profile": { },
    "chat_facts": { },
    "preferences": { }
  },
  "generated_title": "..."
}

Rules:
- "reply" = your friendly message
- "memory_update" = ONLY new memories detected
- If no new memory → return empty objects
- "generated_title" = max 4 words title
- DO NOT wrap JSON in backticks
- DO NOT add any extra text before or after JSON

------------------------------------
### MEMORY CATEGORIES
------------------------------------
user_profile: name, age, bio, identity
chat_facts: long-term facts, likes, dislikes, personal info
preferences: writing style, tone, formatting preferences

------------------------------------
ALWAYS OUTPUT STRICT JSON.
"""

# -------------------------------------------------
# CHAT ENDPOINT
# -------------------------------------------------
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_msg = data.get("message", "")

    # structured memory from frontend
    memory = data.get("memory", {})
    memory.setdefault("user_profile", {})
    memory.setdefault("chat_facts", {})
    memory.setdefault("preferences", {})

    # messages sent to Gemini
    messages = [
        {"role": "model", "parts": SYSTEM_PROMPT},
        {"role": "user", "parts": f"User message: {user_msg}"},
        {"role": "user", "parts": f"Current memory: {json.dumps(memory)}"}
    ]

    # -------------------------------------------------
    # GEMINI CALL — forcing strict JSON output
    # -------------------------------------------------
    try:
        response = model.generate_content(
            messages,
            generation_config={
                "temperature": 0.9,
                "top_p": 0.9,
                "max_output_tokens": 700,
                "response_mime_type": "application/json"
            }
        )

        # Parse clean JSON response
        result = json.loads(response.text)

        cleaned_reply = result.get("reply", "Something went wrong 🥺")

        memory_update = result.get("memory_update", {
            "user_profile": {},
            "chat_facts": {},
            "preferences": {}
        })

        title = result.get("generated_title", None)

    except Exception as e:
        print("JSON PARSE ERROR:", e)
        cleaned_reply = "Oops! I had trouble understanding that 😅"
        memory_update = {
            "user_profile": {},
            "chat_facts": {},
            "preferences": {}
        }
        title = None

    return jsonify({
        "reply": cleaned_reply,
        "memory_update": memory_update,
        "generated_title": title
    })

# -------------------------------------------------
# FRONTEND
# -------------------------------------------------
@app.route("/")
def home():
    return render_template("index.html")

# -------------------------------------------------
# RUN SERVER
# -------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True)
