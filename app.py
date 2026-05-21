from flask import Flask, request, jsonify, render_template
import google.generativeai as genai
import requests

app = Flask(__name__)

# YOUR API KEYS
#For security reason real keys are not posted
GEMINI_API_KEY = "YOUR_API_KEY"
SERPAPI_KEY = "YOUR_API_KEY"

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

# Using gemini-2.5-flash-lite from your available models
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

# Store conversation history
conversations = {}

# ROUTES
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

# AI CHAT API
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

        conversations[session_id].append({"role": "user", "parts": [user_msg]})
        conversations[session_id].append({"role": "model", "parts": [response.text]})

        if len(conversations[session_id]) > 20:
            conversations[session_id] = conversations[session_id][-20:]

        return jsonify({'response': response.text})

    except Exception as e:
        print(f"Gemini Error: {e}")
        return jsonify({'error': str(e)}), 500

# FLIGHT SEARCH API (Travelpayouts)
@app.route('/api/flights', methods=['POST'])
def search_flights():
    try:
        data = request.json
        origin = data.get('origin', '').upper().strip()
        destination = data.get('destination', '').upper().strip()
        date = data.get('date', '').strip()

        if not origin or not destination or not date:
            return jsonify({'success': False, 'flights': []}), 400

        token = "a35637d89ff0d267031f9ff4fa141351"
        url = "https://api.travelpayouts.com/aviasales/v3/prices_for_dates"

        params = {
            "origin": origin,
            "destination": destination,
            "departure_date": date,
            "currency": "usd",
            "token": token
        }

        response = requests.get(url, params=params, timeout=15)
        result = response.json()

        flights = []
        if result.get('success') and result.get('data'):
            for key, value in result['data'].items():
                if isinstance(value, list):
                    for flight in value:
                        if flight.get('price'):
                            flights.append({
                                'price': flight.get('price'),
                                'airline': flight.get('airline'),
                                'flight_number': flight.get('flight_number'),
                                'transfers': flight.get('transfers', 0)
                            })
                    break

        flights.sort(key=lambda x: x['price'])
        return jsonify({'success': True, 'flights': flights[:5]})

    except Exception as e:
        return jsonify({'success': False, 'flights': [], 'error': str(e)}), 500

# NEW CHAT
@app.route('/api/new_chat', methods=['POST'])
def new_chat():
    session_id = request.json.get('session_id', 'default')
    if session_id in conversations:
        del conversations[session_id]
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
