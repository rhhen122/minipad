const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");
const chokidar = require("chokidar");

const PORT = 8000;
const ROOT = process.cwd();

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml"
};

const server = http.createServer((req, res) => {
  let safePath = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, "");
  let filePath = path.join(ROOT, safePath === "/" ? "index.html" : safePath);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      return res.end("Not Found");
    }

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || "text/plain";

    // Inject reload script only into HTML
    if (ext === ".html") {
      const reloadScript = `
        <script>
          const ws = new WebSocket("ws://localhost:${PORT}");
          ws.onmessage = () => location.reload();
        </script>
      `;
      content = content.toString().replace("</body>", reloadScript + "</body>");
    }

    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  });
});

const wss = new WebSocket.Server({ server });

chokidar.watch(ROOT, {
  ignored: /node_modules/,
  ignoreInitial: true
}).on("change", () => {
  console.log("File changed — reloading...");
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send("reload");
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});