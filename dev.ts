import { watch } from "fs";

const clients = new Set<WebSocket>();

// Watch for file changes
watch("./src", { recursive: true }, () => {
  for (const client of clients) {
    client.send("reload");
  }
});

watch("./dist", { recursive: true }, () => {
  for (const client of clients) {
    client.send("reload");
  }
});

const liveReloadScript = `
<script>
  const ws = new WebSocket("ws://localhost:3000/_reload");
  ws.onmessage = () => location.reload();
  ws.onclose = () => setTimeout(() => location.reload(), 1000);
</script>
`;

Bun.serve({
  port: 3000,
  async fetch(req, server) {
    const url = new URL(req.url);

    if (url.pathname === "/_reload") {
      if (server.upgrade(req)) return;
      return new Response("WebSocket upgrade failed", { status: 400 });
    }

    if (url.pathname === "/" || url.pathname === "/index.html") {
      const html = await Bun.file("./src/index.html").text();
      const injected = html.replace("</body>", liveReloadScript + "</body>");
      return new Response(injected, {
        headers: { "Content-Type": "text/html" },
      });
    }

    if (url.pathname === "/styles.css") {
      return new Response(Bun.file("./dist/styles.css"), {
        headers: { "Content-Type": "text/css" },
      });
    }

    if (url.pathname.startsWith("/assets/")) {
      const file = Bun.file(`./src${url.pathname}`);
      if (await file.exists()) {
        return new Response(file);
      }
    }

    return new Response("Not found", { status: 404 });
  },
  websocket: {
    open(ws) {
      clients.add(ws);
    },
    close(ws) {
      clients.delete(ws);
    },
    message() {},
  },
});

console.log("Dev server running at http://localhost:3000 (live reload enabled)");
