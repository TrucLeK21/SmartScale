import sys
import io
import json

class StdoutCapture:
    def __init__(self):
        self._captured_output = io.StringIO()
        self._old_stdout = sys.stdout

    def start(self):
        sys.stdout = self._captured_output

    def stop(self):
        sys.stdout = self._old_stdout

    def get_output(self):
        return self._captured_output.getvalue()

    def __enter__(self):
        self.start()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.stop()

def send_to_frontend(data):
    json_data = json.dumps(data)
    print(json_data)

capture = StdoutCapture()

# Only capture specific output
with capture:
    send_to_frontend({"message": "Hello from Python!", "status": "success"})
    
# This won't be captured
print("hello world!")

captured_output = capture.get_output()
print("Captured:", captured_output)