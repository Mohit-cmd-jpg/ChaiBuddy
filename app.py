from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import google.generativeai as genai
from openai import OpenAI
import os
from dotenv import load_dotenv
import json
import logging
from datetime import datetime
from functools import wraps
import time

load_dotenv()

app = Flask(__name__)
CORS(app)

# -------------------------------------------------
# LOGGING SETUP
# -------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# -------------------------------------------------
# RATE LIMITING (simple in-memory)
# -------------------------------------------------
request_times = {}

def rate_limit(max_requests=10, window=60):
    """Rate limit by IP: max_requests per window seconds"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            ip = request.remote_addr
            now = time.time()
            
            if ip not in request_times:
                request_times[ip] = []
            
            # Remove old requests outside the window
            request_times[ip] = [t for t in request_times[ip] if now - t < window]
            
            if len(request_times[ip]) >= max_requests:
                logger.warning(f"Rate limit exceeded for IP: {ip}")
                return jsonify({"error": "Rate limit exceeded. Please try again later."}), 429
            
            request_times[ip].append(now)
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# -------------------------------------------------
# VALIDATION HELPERS
# -------------------------------------------------
def validate_message(message):
    """Validate user message"""
    if not isinstance(message, str):
        return False, "Message must be a string"
    if len(message.strip()) == 0:
        return False, "Message cannot be empty"
    if len(message) > 5000:
        return False, "Message is too long (max 5000 characters)"
    return True, None

def sanitize_message(message):
    """Sanitize user input"""
    return message.strip()[:5000]

# -------------------------------------------------
# CONFIGURE AI MODELS (GitHub Primary + Gemini Fallback)
# -------------------------------------------------

# GitHub Models Configuration
github_token = os.getenv("GITHUB_PAT")
if not github_token:
    logger.warning("GITHUB_PAT not set - will use Gemini only")
    github_client = None
else:
    github_client = OpenAI(
        api_key=github_token,
        base_url="https://models.inference.ai.azure.com"
    )
    logger.info("GitHub Models client configured")

# Gemini Fallback Configuration
gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    logger.error("GEMINI_API_KEY environment variable not set")
    raise ValueError("GEMINI_API_KEY environment variable is required")

genai.configure(api_key=gemini_api_key)
gemini_model = genai.GenerativeModel("models/gemini-1.5-flash")

# Model Selection
PRIMARY_MODELS = {
    "claude": "claude-3-5-sonnet-20241022", # Correct GitHub ID
    "gpt4": "gpt-4o"                        # GitHub's GPT-4 Optimized
}
PRIMARY_MODEL = PRIMARY_MODELS["gpt4"]  # Use GPT-4o as primary for reliability

logger.info(f"Primary model: {PRIMARY_MODEL} (via GitHub Models)")
logger.info(f"Fallback model: gemini-2.5-flash (via Google)")

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
# AI MODEL CALLER FUNCTIONS
# -------------------------------------------------
def call_github_model(system_prompt, user_msg, memory):
    """Call GitHub Models API (Claude 3.5 Sonnet or GPT-4o)"""
    if not github_client:
        raise ValueError("GitHub client not configured")
    
    logger.info(f"Attempting GitHub {PRIMARY_MODEL} model...")
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"User message: {user_msg}\n\nCurrent memory: {json.dumps(memory)}"}
    ]
    
    response = github_client.chat.completions.create(
        model=PRIMARY_MODEL,
        messages=messages,
        temperature=0.9,
        top_p=0.9,
        max_tokens=700,
        response_format={"type": "json_object"}
    )
    
    return response.choices[0].message.content

def call_gemini_model(system_prompt, user_msg, memory):
    """Call Gemini 2.5-Flash as fallback"""
    logger.info("Falling back to Gemini 2.5-Flash...")
    
    messages = [
        {"role": "model", "parts": system_prompt},
        {"role": "user", "parts": f"User message: {user_msg}"},
        {"role": "user", "parts": f"Current memory: {json.dumps(memory)}"}
    ]
    
    response = gemini_model.generate_content(
        messages,
        generation_config={
            "temperature": 0.9,
            "top_p": 0.9,
            "max_output_tokens": 700,
            "response_mime_type": "application/json"
        }
    )
    
    return response.text

def get_ai_response(system_prompt, user_msg, memory):
    """Try GitHub model first, fallback to Gemini if it fails"""
    try:
        # Try GitHub Models first
        response_text = call_github_model(system_prompt, user_msg, memory)
        logger.info("GitHub model succeeded ✓")
        return response_text, "github"
    
    except Exception as github_error:
        logger.warning(f"GitHub model failed: {str(github_error)[:100]}")
        logger.info("Switching to Gemini fallback...")
        
        try:
            # Fallback to Gemini
            response_text = call_gemini_model(system_prompt, user_msg, memory)
            logger.info("Gemini fallback succeeded ✓")
            return response_text, "gemini"
        
        except Exception as gemini_error:
            logger.error(f"Both models failed - GitHub: {str(github_error)[:50]}, Gemini: {str(gemini_error)[:50]}")
            raise

# -------------------------------------------------
# CHAT ENDPOINT
# -------------------------------------------------
@app.route("/chat", methods=["POST"])
@rate_limit(max_requests=30, window=60)
def chat():
    try:
        data = request.get_json()
        
        if not data:
            logger.warning("Empty request body")
            return jsonify({"error": "Request body must be JSON"}), 400
        
        user_msg = data.get("message", "").strip()
        
        # Validate message
        is_valid, error_msg = validate_message(user_msg)
        if not is_valid:
            logger.warning(f"Invalid message: {error_msg}")
            return jsonify({"error": error_msg}), 400
        
        # Sanitize message
        user_msg = sanitize_message(user_msg)
        
        # Structured memory from frontend
        memory = data.get("memory", {})
        memory.setdefault("user_profile", {})
        memory.setdefault("chat_facts", {})
        memory.setdefault("preferences", {})

        # -------------------------------------------------
        # CALL AI MODEL (GitHub Primary + Gemini Fallback)
        # -------------------------------------------------
        logger.info(f"Processing user message from {request.remote_addr}")
        
        response_text, model_used = get_ai_response(SYSTEM_PROMPT, user_msg, memory)
        
        # Parse clean JSON response
        result = json.loads(response_text)

        cleaned_reply = result.get("reply", "Something went wrong 🥺")
        memory_update = result.get("memory_update", {
            "user_profile": {},
            "chat_facts": {},
            "preferences": {}
        })
        title = result.get("generated_title", None)

        logger.info(f"Chat response generated successfully using {model_used}")
        
        return jsonify({
            "success": True,
            "reply": cleaned_reply,
            "memory_update": memory_update,
            "generated_title": title,
            "timestamp": datetime.now().isoformat(),
            "model_used": model_used  # For debugging/monitoring
        }), 200

    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Invalid response format from AI model",
            "details": "The AI model returned invalid JSON"
        }), 500
    
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400
    
    except Exception as e:
        logger.error(f"Unexpected error in /chat: {str(e)}")
        return jsonify({
            "success": False,
            "error": "An unexpected error occurred",
            "details": "Please try again or contact support"
        }), 500

# -------------------------------------------------
# HEALTH CHECK ENDPOINT
# -------------------------------------------------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }), 200

# -------------------------------------------------
# ERROR HANDLERS
# -------------------------------------------------
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({"error": "Method not allowed"}), 405

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({"error": "Internal server error"}), 500

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
    port = int(os.getenv("PORT", 5000))
    app.run(debug=os.getenv("FLASK_ENV") == "development", host="0.0.0.0", port=port)
