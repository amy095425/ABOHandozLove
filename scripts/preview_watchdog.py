"""Restart the preview after unexpected exits, independently of the terminal."""
from pathlib import Path
import subprocess
import sys
import time

server = Path(__file__).with_name('preview_server.py')
while True:
    process = subprocess.Popen([sys.executable, '-u', str(server)])
    process.wait()
    time.sleep(2)
