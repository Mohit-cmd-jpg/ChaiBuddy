# Database Setup Guide for ChaiBuddy

After all enhancements are complete, you'll want to replace localStorage with a real database. Here's a comprehensive guide to set up and integrate a database.

## Option 1: PostgreSQL (Recommended for Production)

### 1. Install PostgreSQL

**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Run the installer and note your password for the `postgres` user
- PostgreSQL will be installed, typically on port 5432

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database and User

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE chabuddy_db;

-- Create user with password
CREATE USER chabuddy_user WITH PASSWORD 'your_secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE chabuddy_db TO chabuddy_user;

-- Exit
\q
```

### 3. Update Python Requirements

Add to `requirements.txt`:
```
psycopg2-binary
SQLAlchemy
```

Install:
```bash
pip install -r requirements.txt
```

### 4. Update app.py with Database Models

Add this to your `app.py`:

```python
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSON

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://chabuddy_user:your_password@localhost:5432/chabuddy_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Database Models
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    memory = db.Column(JSON, default={'user_profile': {}, 'chat_facts': {}, 'preferences': {}})
    
    chats = db.relationship('Chat', backref='user', lazy=True, cascade='all, delete-orphan')

class Chat(db.Model):
    __tablename__ = 'chats'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False, default='New Chat')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    messages = db.relationship('Message', backref='chat', lazy=True, cascade='all, delete-orphan')

class Message(db.Model):
    __tablename__ = 'messages'
    
    id = db.Column(db.Integer, primary_key=True)
    chat_id = db.Column(db.Integer, db.ForeignKey('chats.id'), nullable=False)
    sender = db.Column(db.String(10), nullable=False)  # 'user' or 'bot'
    text = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# Create tables
with app.app_context():
    db.create_all()
```

### 5. Update API Endpoints

Replace the `/chat` endpoint:

```python
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user

# Update User model to use UserMixin
class User(UserMixin, db.Model):
    # ... existing fields ...
    pass

login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route("/chat", methods=["POST"])
@login_required
@rate_limit(max_requests=30, window=60)
def chat():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Request body must be JSON"}), 400
        
        user_msg = data.get("message", "").strip()
        
        # Validate message
        is_valid, error_msg = validate_message(user_msg)
        if not is_valid:
            return jsonify({"error": error_msg}), 400
        
        user_msg = sanitize_message(user_msg)
        
        # Get active chat
        chat_id = data.get("chat_id")
        chat = Chat.query.filter_by(id=chat_id, user_id=current_user.id).first()
        
        if not chat:
            return jsonify({"error": "Chat not found"}), 404
        
        # Use user memory
        memory = current_user.memory
        
        # ... rest of the chat logic ...
        
        # Save message
        msg = Message(chat_id=chat.id, sender='user', text=user_msg)
        db.session.add(msg)
        db.session.commit()
        
        # Process with Gemini
        response = model.generate_content(
            # ... generation logic ...
        )
        
        result = json.loads(response.text)
        
        # Save bot response
        bot_msg = Message(chat_id=chat.id, sender='bot', text=result.get("reply"))
        db.session.add(bot_msg)
        
        # Update user memory
        current_user.memory = {
            "user_profile": {**current_user.memory.get("user_profile", {}), **result.get("memory_update", {}).get("user_profile", {})},
            "chat_facts": {**current_user.memory.get("chat_facts", {}), **result.get("memory_update", {}).get("chat_facts", {})},
            "preferences": {**current_user.memory.get("preferences", {}), **result.get("memory_update", {}).get("preferences", {})}
        }
        
        # Update chat title
        if chat.title == 'New Chat' and result.get("generated_title"):
            chat.title = result.get("generated_title")
        
        db.session.commit()
        
        return jsonify({
            "success": True,
            "reply": result.get("reply"),
            "memory_update": result.get("memory_update"),
            "generated_title": result.get("generated_title"),
            "timestamp": datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error in /chat: {str(e)}")
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": "An unexpected error occurred"
        }), 500
```

---

## Option 2: MongoDB (For Flexibility)

### 1. Get MongoDB Connection String

- Free tier: https://www.mongodb.com/cloud/atlas
- Or local: `mongodb://localhost:27017/chabuddy_db`

### 2. Install Dependencies

```bash
pip install pymongo python-dotenv
```

### 3. Update app.py

```python
from pymongo import MongoClient
from bson.objectid import ObjectId

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/chabuddy_db")
client = MongoClient(MONGODB_URI)
db = client['chabuddy_db']

@app.route("/chat", methods=["POST"])
@rate_limit(max_requests=30, window=60)
def chat():
    try:
        data = request.get_json()
        user_msg = data.get("message", "").strip()
        user_id = data.get("user_id")  # From authenticated session
        chat_id = data.get("chat_id")
        
        if not user_msg:
            return jsonify({"error": "Message cannot be empty"}), 400
        
        # Get user and chat
        user = db.users.find_one({"_id": ObjectId(user_id)})
        chat = db.chats.find_one({"_id": ObjectId(chat_id), "user_id": user_id})
        
        if not chat:
            return jsonify({"error": "Chat not found"}), 404
        
        memory = user.get("memory", {})
        
        # Call Gemini
        response = model.generate_content(...)
        result = json.loads(response.text)
        
        # Save messages
        db.messages.insert_one({
            "chat_id": ObjectId(chat_id),
            "sender": "user",
            "text": user_msg,
            "timestamp": datetime.utcnow()
        })
        
        db.messages.insert_one({
            "chat_id": ObjectId(chat_id),
            "sender": "bot",
            "text": result.get("reply"),
            "timestamp": datetime.utcnow()
        })
        
        # Update memory and chat
        db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"memory": result.get("memory_update", memory)}}
        )
        
        if chat["title"] == "New Chat" and result.get("generated_title"):
            db.chats.update_one(
                {"_id": ObjectId(chat_id)},
                {"$set": {"title": result.get("generated_title"), "updated_at": datetime.utcnow()}}
            )
        
        return jsonify({
            "success": True,
            "reply": result.get("reply"),
            "memory_update": result.get("memory_update"),
            "generated_title": result.get("generated_title"),
            "timestamp": datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return jsonify({"success": False, "error": "An error occurred"}), 500
```

---

## Option 3: SQLite (Simple, No Setup)

Perfect for development and small deployments.

### 1. Update app.py

```python
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///chabuddy.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Use same models as PostgreSQL option above
# But SQLite will handle everything without external setup

with app.app_context():
    db.create_all()
```

Install:
```bash
pip install SQLAlchemy
```

---

## Environment Variables (.env)

```env
# Gemini
GEMINI_API_KEY=your_gemini_key

# Database (choose one)
SQLALCHEMY_DATABASE_URI=postgresql://user:password@localhost:5432/chabuddy_db
# OR
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/chabuddy_db

# Deployment
FLASK_ENV=production
SECRET_KEY=your_secret_key_here
```

---

## Migration Steps

1. **Back up existing data**: Export all localStorage data
2. **Add database code** to app.py
3. **Run migrations**: `python -c "from app import app, db; db.create_all()"`
4. **Update frontend** to include user authentication
5. **Add authentication endpoints**:
   - POST `/auth/signup` - Create user account
   - POST `/auth/login` - User login
   - POST `/auth/logout` - User logout
6. **Add chat endpoints**:
   - POST `/chats` - Create chat
   - GET `/chats` - List user chats
   - GET `/chats/{id}` - Get chat details
   - DELETE `/chats/{id}` - Delete chat
7. **Test thoroughly** before deploying

---

## Deployment with Database

### Render.com (Updates for render.yaml)

```yaml
services:
  - type: web
    name: chaibuddy
    env: python
    region: singapore
    buildCommand: "pip install -r requirements.txt"
    startCommand: "gunicorn app:app"
    plan: free
    autoDeploy: true
    envVars:
      - key: GEMINI_API_KEY
        sync: false
      - key: SQLALCHEMY_DATABASE_URI
        sync: false
      - key: SECRET_KEY
        sync: false

  - type: postgresql
    name: chaibuddy-db
    plan: free
    region: singapore
```

### Heroku Alternative

```bash
# Add Postgres addon
heroku addons:create heroku-postgresql:hobby-dev

# Deploy
git push heroku main
```

---

## Best Practices

✅ Use environment variables for sensitive data  
✅ Implement user authentication  
✅ Add database backups  
✅ Use connection pooling for efficiency  
✅ Implement query optimization  
✅ Add rate limiting per user  
✅ Regular database maintenance  
✅ Monitor database performance  

---

**Questions?** The database setup will give you:
- Persistent user data
- Multi-user support
- Better security
- Scalability
- Advanced analytics
