import requests
import os
import socket
import urllib3.util.connection as urllib3_connection

NTFY_TOPIC = os.environ.get('NTFY_TOPIC')

# Railway does not support outbound IPv6 - any connection that resolves
# to an IPv6 address fails with "Network is unreachable" (Errno 101).
# ntfy.sh has both A and AAAA records, so depending on DNS resolution
# order this fails intermittently unless we force IPv4 here.
def _allowed_gai_family():
    return socket.AF_INET

urllib3_connection.allowed_gai_family = _allowed_gai_family

def send_notification(title: str, message: str, priority: int = 3):
    try:
        requests.post(
            f"https://ntfy.sh/{NTFY_TOPIC}",
            data=message.encode("utf-8"),
            headers={"Title": title, "Priority": str(priority)},
            timeout=5,
        )
    except requests.RequestException as e:
        print(f"Failed to send notification: {e}")