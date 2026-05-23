from flask import Flask, request, jsonify, render_template, send_from_directory
import google.generativeai as genai
import os

app = Flask(__name__)


# Key not posted here,refer to live website
GEMINI_API_KEY = "Your_api_key_here"

genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel(
    'gemini-2.5-flash-lite',
    generation_config={
        "temperature": 0.7,
        "max_output_tokens": 500,
    },
    system_instruction="""You are TravelMate AI, a friendly travel assistant.
1. Use bullet points for readability.
2. Keep responses under 200 words.
3. Be helpful, friendly, and sophisticated."""
)

conversations = {}

// Page routes

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/chat')
def chat():
    return render_template('chat.html')

@app.route('/budget')
def budget():
    return render_template('budget.html')

@app.route('/offline')
def offline():
    return render_template('offline.html')

@app.route('/sw.js')
def service_worker():
    return send_from_directory(app.root_path, 'sw.js',
        mimetype='application/javascript')

@app.route('/manifest.json')
def manifest():
    return send_from_directory(app.root_path, 'manifest.json',
        mimetype='application/manifest+json')

//AI Chat API

@app.route('/api/chat', methods=['POST'])
def api_chat():
    try:
        data = request.json
        user_msg = data.get('message', '').strip()
        session_id = data.get('session_id', 'default')

        if not user_msg:
            return jsonify({'error': 'Please enter a message'}), 400

        if session_id not in conversations:
            conversations[session_id] = []

        chat_session = model.start_chat(history=conversations[session_id])
        response = chat_session.send_message(user_msg)

        conversations[session_id].append({"role": "user",  "parts": [user_msg]})
        conversations[session_id].append({"role": "model", "parts": [response.text]})

        if len(conversations[session_id]) > 20:
            conversations[session_id] = conversations[session_id][-20:]

        return jsonify({'response': response.text})

    except Exception as e:
        print(f"Gemini Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
    
