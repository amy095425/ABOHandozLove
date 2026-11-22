"""Local static preview, managed by the user's macOS LaunchAgent."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

PROJECT = Path(__file__).resolve().parent.parent

class PreviewHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Always revalidate local edits, including the ES module dependency graph.
        self.send_header('Cache-Control', 'no-store, max-age=0')
        super().end_headers()

if __name__ == '__main__':
    server = ThreadingHTTPServer(('127.0.0.1', 8000), partial(PreviewHandler, directory=str(PROJECT)))
    server.daemon_threads = True
    server.serve_forever()
