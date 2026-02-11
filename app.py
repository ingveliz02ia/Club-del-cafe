from flask import Flask, send_from_directory
import os

app = Flask(__name__, static_folder='.')

@app.route('/')
def home():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

@app.route('/health')
def health():
    return "ok"

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
