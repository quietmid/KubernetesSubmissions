const { createServer } = require("node:http");
const { mkdirSync, readFileSync, renameSync, writeFileSync } = require("node:fs");
const { dirname } = require("node:path");

const port = Number(process.env.PORT) || 3000;
const countFile = process.env.COUNT_FILE || "/data/count.txt";

mkdirSync(dirname(countFile), { recursive: true });
try {
	writeFileSync(countFile, "0", { flag: "wx" });
} catch (error) {
	if (error.code !== "EEXIST") {
		throw error;
	}
}

const server = createServer((request, response) => {
	if (request.method === "GET" && request.url === "/pingpong") {
		try {
			const storedCount = readFileSync(countFile, "utf8").trim();
			if (!/^\d+$/.test(storedCount)) {
				throw new Error(`Invalid request count in "${countFile}"`);
			}

			const count = Number(storedCount);
			if (!Number.isSafeInteger(count) || count === Number.MAX_SAFE_INTEGER) {
				throw new Error(`Request count in "${countFile}" is outside the safe integer range`);
			}

			const temporaryCountFile = `${countFile}.${process.pid}.tmp`;
			writeFileSync(temporaryCountFile, String(count + 1));
			renameSync(temporaryCountFile, countFile);
			response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
			response.end(`pong ${count}`);
		} catch (error) {
			console.error(`Failed to update request count in "${countFile}":`, error);
			response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
			response.end("Failed to update request count\n");
		}
		return;
	}

	response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
	response.end("Not Found\n");
});

server.listen(port, () => {
	console.log(`Ping-pong server listening on port ${port}`);
});