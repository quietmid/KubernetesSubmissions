import { createServer } from "node:http"

const port = Number(process.env.PORT) || 3000;
let count = 0;

const server = createServer((request, response) => {
	if (request.method === "GET" && request.url === "/ping-pong") {
		response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
		response.end(`pong ${count}`);
		count += 1;
		return;
	}

	response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
	response.end("Not Found\n");
});

server.listen(port, () => {
	console.log(`Ping-pong server listening on port ${port}`)
});