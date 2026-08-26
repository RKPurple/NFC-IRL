import requests
import os

NTFY_TOPIC = os.environ.get('NTFY_TOPIC')

def send_notification(title: str, message: str, priority: int = 3):
    try:
        requests.post(
            f"https://ntfy.sh/{NTFY_TOPIC}",
            data=message.encode("utf-8"),
            headers={"Title": title, "Priority": str(priority)},
        )
    except requests.RequestException as e:
        print(f"Failed to send notification: {e}")
    