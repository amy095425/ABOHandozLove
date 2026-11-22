"""Start a detached, supervised local preview without a terminal session."""
import os
from pathlib import Path
import subprocess
import sys
import time
from urllib.request import urlopen

project = Path(__file__).resolve().parent.parent
logs = project / '.local-preview'
logs.mkdir(exist_ok=True)

def available():
    try:
        with urlopen('http://127.0.0.1:8000/', timeout=1) as response:
            return response.status == 200 and b'<title>ABOHandozLove</title>' in response.read()
    except OSError:
        return False

if not available():
    pid_file = logs / 'watchdog.pid'
    running = False
    try:
        pid = int(pid_file.read_text())
        os.kill(pid, 0)
        running = True
    except (OSError, ValueError):
        pass
    if not running:
        with (logs / 'server.log').open('ab', buffering=0) as output:
            process = subprocess.Popen(
                [sys.executable, '-u', str(project / 'scripts' / 'preview_watchdog.py')],
                cwd=project, stdin=subprocess.DEVNULL, stdout=output, stderr=output,
                start_new_session=True,
            )
        pid_file.write_text(str(process.pid))
    for _ in range(40):
        if available():
            break
        time.sleep(.2)
    else:
        raise SystemExit(f'启动失败，请检查 {logs / "server.log"}')
print('ABOHandozLove 已启动：http://127.0.0.1:8000/')
