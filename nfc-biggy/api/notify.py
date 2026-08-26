import requests
import os

PUSHOVER_USER_KEY = os.environ.get('PUSHOVER_USER_KEY')
PUSHOVER_API_TOKEN = os.environ.get('PUSHOVER_API_TOKEN')

def send_notification(title: str, message: str, priority: int = 0):
    """
        priority: -2 (lowest) to 2(emergency), Pushover's scale. 0 is normal/default
    """
    try:
        requests.post(
            "https://api.pushover.net/1/messages.json",
            data={
                "token": PUSHOVER_API_TOKEN,
                "user": PUSHOVER_USER_KEY,
                "title": title,
                "message": message,
                "priority": priority,
            },
            timeout=5
        )
    except requests.RequestException as e:
        print(f"Failed to send notification: {e}")