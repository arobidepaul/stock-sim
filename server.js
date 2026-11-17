// Minimal static file server. No framework dependency, no API calls.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const PORT = 8001;
const ROOT = path.dirname(new URL(import.meta.url).pathname);

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
};

const server = http.createServer((req, res) => {
  let filePath = req.url === "/" ? "/index.html" : req.url;
  filePath = path.join(ROOT, path.normalize(filePath).replace(/^(\.\.[/\\])+/, ""));

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Stock Sim running at http://localhost:${PORT}`);
});
