
from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import time

app = Flask(__name__)
CORS(app)

otp_store = {}
OTP_EXPIRATION_TIME = 300  # 5 minutes in seconds

# Generate OTP and send to client
@app.route('/generate-otp', methods=['POST'])
def generate_otp():
    data = request.get_json()
    phone = data.get('phone')
    otp = str(random.randint(100000, 999999))

    otp_store[phone] = {'otp': otp, 'expires_at': time.time() + OTP_EXPIRATION_TIME}

    print(f"OTP for {phone}: {otp}")  # In a real application, send via SMS or email

    return jsonify({'message': 'OTP sent successfully'})

# Validate OTP
@app.route('/validate-otp', methods=['POST'])
def validate_otp():
    data = request.get_json()
    phone = data.get('phone')
    otp = data.get('otp')

    record = otp_store.get(phone)
    if not record:
        return jsonify({'message': 'OTP not generated'}), 400

    if time.time() > record['expires_at']:
        del otp_store[phone]
        return jsonify({'message': 'OTP expired'}), 400

    if record['otp'] == otp:
        del otp_store[phone]
        return jsonify({'message': 'OTP verified successfully'})
    else:
        return jsonify({'message': 'Invalid OTP'}), 400

if __name__ == '__main__':
    app.run(port=5000)
