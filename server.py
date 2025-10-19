#!/usr/bin/env python3
"""
Simple HTTP server to run Langit Senja game.
Usage: python3 server.py
Then open: http://localhost:8000
"""

import http.server
import socketserver
import os

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def do_GET(self):
        # Serve index.html for root path
        if self.path == '/':
            self.path = '/index.html'
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

def run_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print("=" * 60)
        print("🎮 Langit Senja Game Server")
        print("=" * 60)
        print(f"Server running at: http://localhost:{PORT}")
        print(f"Opening browser automatically...")
        print("Press Ctrl+C to stop the server")
        print("=" * 60)

        # Try to open browser automatically
        try:
            import webbrowser
            webbrowser.open(f'http://localhost:{PORT}')
        except:
            pass

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\nServer stopped.")

if __name__ == "__main__":
    run_server()
