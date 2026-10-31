const { createServer } = require("node:http");
const { readFile } = require("node:fs/promises");

const port = Number(process.env.PORT) || 3000;
const logFile = process.env.LOG_FILE || "/var/log/log-generator/output.log";
const countFile = process.env.COUNT_FILE || "/data/count.txt";

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
		const [log, count] = await Promise.all([
			readFile(logFile, "utf8"),
			readFile(countFile, "utf8").catch((error) => {
				if (error.code === "ENOENT") {
					return "0";
				}
				throw error;
			}),
		]);
		const storedCount = count.trim();
		if (!/^\d+$/.test(storedCount) || !Number.isSafeInteger(Number(storedCount))) {
			throw new Error(`Invalid request count in "${countFile}"`);
		}

		response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
		response.end(`${log}${log.endsWith("\n") || log.length === 0 ? "" : "\n"}Ping / Pongs: ${storedCount}\n`);
	} catch (error) {
		console.error(`Failed to read log output or request count:`, error);
		response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
		response.end("Failed to read log output or request count\n");
	}
});

server.listen(port);
