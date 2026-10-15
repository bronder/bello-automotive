#!/usr/bin/env python3
"""Local dev server mimicking the Cloudflare worker's pretty URLs:
/gallery resolves to gallery.html; unknown paths serve 404.html."""
import http.server, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def translate_path(self, path):
        p = super().translate_path(path)
        if os.path.isdir(p):
            for idx in ("index.html",):
                c = os.path.join(p, idx)
                if os.path.exists(c):
                    return c
        if not os.path.exists(p) and not p.endswith(".html"):
            c = p + ".html"
            if os.path.exists(c):
                return c
        return p

    def send_response(self, code, *a):
        # send_head serves 404.html for unknown paths; report the real status
        if getattr(self, "_serving_404", False) and code == 200:
            code = 404
        super().send_response(code, *a)

    def send_head(self):
        path = self.translate_path(self.path)
        if not os.path.exists(path) or os.path.isdir(path):
            self._serving_404 = True
            self.path = "/404.html"
            try:
                return super().send_head()
            finally:
                self.path = self.path  # keep translated 404 path for this request
        return super().send_head()

if __name__ == "__main__":
    http.server.ThreadingHTTPServer(("127.0.0.1", 8000), Handler).serve_forever()
