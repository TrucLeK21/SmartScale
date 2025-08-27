from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello, Flask!"

@app.route("/info")
def info():
    return jsonify({"status": "ok", "message": "Flask server is running"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)