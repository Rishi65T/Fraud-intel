"""
FRAUDINTEL - Render Keep-Alive Ping Daemon
Periodically triggers Render web service health check to prevent free-tier spin down.
"""

import os
import sys
import time
import datetime
import urllib.request
import urllib.error

# Configurable via environment variable or CLI argument
RENDER_URL = os.getenv("RENDER_APP_URL", sys.argv[1] if len(sys.argv) > 1 else "https://fraudintel.onrender.com")
PING_INTERVAL_SECONDS = int(os.getenv("PING_INTERVAL_SECONDS", "600"))  # Default: 10 minutes (600s)

def ping_render(url: str):
    health_url = f"{url.rstrip('/')}/api/health"
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{now_str}] Pinging {health_url}...", end=" ", flush=True)
    
    start = time.time()
    try:
        req = urllib.request.Request(
            health_url,
            headers={"User-Agent": "FraudIntel-KeepAlive/1.0"}
        )
        with urllib.request.urlopen(req, timeout=45) as response:
            latency = round((time.time() - start) * 1000, 2)
            code = response.getcode()
            if code == 200:
                print(f"SUCCESS [HTTP {code}] - Latency: {latency} ms (Instance is Awake)")
            else:
                print(f"WARNING [HTTP {code}] - Latency: {latency} ms")
    except urllib.error.HTTPError as e:
        print(f"FAILED [HTTP {e.code}] - {e.reason}")
    except urllib.error.URLError as e:
        print(f"FAILED [Connection Error] - {e.reason}")
    except Exception as e:
        print(f"FAILED [Exception] - {e}")

def main():
    print("=====================================================")
    print("      FRAUDINTEL RENDER KEEP-ALIVE DAEMON            ")
    print("=====================================================")
    print(f"Target URL:    {RENDER_URL}")
    print(f"Ping Interval: {PING_INTERVAL_SECONDS} seconds ({PING_INTERVAL_SECONDS // 60} mins)")
    print("Press Ctrl+C to terminate.")
    print("=====================================================\n")

    # Initial ping immediately
    ping_render(RENDER_URL)

    # Periodic loop
    try:
        while True:
            time.sleep(PING_INTERVAL_SECONDS)
            ping_render(RENDER_URL)
    except KeyboardInterrupt:
        print("\nKeep-Alive daemon stopped by user.")

if __name__ == "__main__":
    main()
