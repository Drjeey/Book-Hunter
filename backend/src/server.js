import { createServer } from "node:http";

const port = Number(process.env.PORT ?? 8000);

const server = createServer((request, response) => {
  if (request.method === "GET" && request.url === "/api/v1/health") {
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ status: "ok", service: "book-hunt-api" }));
    return;
  }

  response.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify({ error: "Route not found" }));
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Book Hunt API listening at http://127.0.0.1:${port}`);
});
