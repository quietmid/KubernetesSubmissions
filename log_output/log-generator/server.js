import { createServer } from "node:http";

const port = Number(process.env.PORT) || 3000;
const randomId = process.env.RANDOM_ID;

if (!randomId) {
	throw new Error("RANDOM_ID must be set");
}

const server = createServer((request, response) => {
	if (request.method === "GET" && (request.url === "/" || request.url?.startsWith("/log-output"))) {
		response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
		response.end(`Timestamp: ${new Date().toISOString()}\nRandom ID: ${randomId}\n`);
		return;
	}

	response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
	response.end("Not Found\n");
});

server.listen(port);