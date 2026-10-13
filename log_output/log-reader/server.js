const { createServer } = require("node:http");
const { readFile } = require("node:fs/promises");

const port = Number(process.env.PORT) || 3000;
const logFile = process.env.LOG_FILE || "/var/log/log-generator/output.log";

const server = createServer(async (request, response) => {
	if (request.method !== "GET") {
		response.writeHead(405, {
			Allow: "GET",
			"Content-Type": "text/plain; charset=utf-8",
		});
		response.end("Method Not Allowed\n");
		return;
	}

	const path = new URL(request.url ?? "/", "http://localhost").pathname;
	if (path !== "/" && path !== "/log-output") {
		response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
		response.end("Not Found\n");
		return;
	}

	try {
		const log = await readFile(logFile, "utf8");
		response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
		response.end(log);
	} catch (error) {
		console.error(`Failed to read log file "${logFile}":`, error);
		response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
		response.end("Failed to read log file\n");
	}
});

server.listen(port);
