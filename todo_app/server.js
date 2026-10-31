import http from "http";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const port = Number(process.env.PORT) || 3000;
const cacheFile = process.env.IMAGE_CACHE_FILE || "/data/todo-image-cache.json";
const cacheDurationMs = 10 * 60 * 1000;
let refreshInProgress;

async function readCachedImage() {
	try {
		const cached = JSON.parse(await readFile(cacheFile, "utf8"));
		if (
			typeof cached.fetchedAt !== "number" ||
			!Number.isFinite(cached.fetchedAt) ||
			typeof cached.contentType !== "string" ||
			!cached.contentType.startsWith("image/") ||
			typeof cached.image !== "string" ||
			!Buffer.from(cached.image, "base64").length
		) {
			throw new Error(`Invalid image cache format in "${cacheFile}"`);
		}
		return cached;
	} catch (error) {
		if (error.code === "ENOENT") {
			return undefined;
		}
		throw error;
	}
}

async function fetchAndCacheImage() {
	const response = await fetch("https://picsum.photos/1200", {
		signal: AbortSignal.timeout(15000),
	});
	if (!response.ok) {
		throw new Error(`Picsum returned HTTP ${response.status}`);
	}

	const contentType = response.headers.get("content-type") || "";
	if (!contentType.startsWith("image/")) {
		throw new Error(`Picsum returned unexpected content type "${contentType}"`);
	}

	const cached = {
		fetchedAt: Date.now(),
		contentType,
		image: Buffer.from(await response.arrayBuffer()).toString("base64"),
	};
	if (!cached.image) {
		throw new Error("Picsum returned an empty image");
	}

	await mkdir(dirname(cacheFile), { recursive: true });
	const temporaryFile = `${cacheFile}.${process.pid}.${Date.now()}.tmp`;
	try {
		await writeFile(temporaryFile, JSON.stringify(cached), { flag: "wx" });
		await rename(temporaryFile, cacheFile);
	} catch (error) {
		console.error(`Failed to write image cache "${cacheFile}":`, error);
		throw error;
	}
	return cached;
}

function refreshImageCache() {
	if (!refreshInProgress) {
		refreshInProgress = fetchAndCacheImage().finally(() => {
			refreshInProgress = undefined;
		});
	}
	return refreshInProgress;
}

async function serveImage(response) {
	let cached = await readCachedImage();
	if (!cached) {
		cached = await refreshImageCache();
	} else if (Date.now() - cached.fetchedAt >= cacheDurationMs) {
		try {
			await refreshImageCache();
		} catch (error) {
			console.error("Failed to refresh expired Picsum image; serving cached image:", error);
		}
	}

	response.writeHead(200, {
		"Content-Type": cached.contentType,
		"Cache-Control": "no-store",
	});
	response.end(Buffer.from(cached.image, "base64"));
}

const server = http.createServer((request, response) => {
	if (request.method === "GET" && request.url?.split("?")[0] === "/image") {
		serveImage(response).catch((error) => {
			console.error("Failed to serve Todo app image:", error);
			if (!response.headersSent) {
				response.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
			}
			response.end("Unable to load image\n");
		});
		return;
	}

	if (request.method === "GET" && request.url === "/") {
		response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
		response.end(`
			<!doctype html>
			<html>
				<head><title>Todo App</title></head>
				<body style="text-align: center;">
					<h1>Todo App is running</h1>
					<img src="/image" alt="Random landscape photo" style="max-width: 50%; height: auto;">
					<h1>DevOps with Kubernete 2026</h1>
				</body>
				</html>
		`);
		return;
	}
	response.writeHead(404, { "Content-Type": "text/plain" });
	response.end("Not Found\n");
});

server.listen(port, () => {
	console.log(`Server started in port ${port}`);
});