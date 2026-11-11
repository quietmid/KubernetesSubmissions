import http from "node:http";
import { randomUUID } from "node:crypto";

const port = Number(process.env.PORT) || 3000;
const maxTodoLength = 140;
const maxBodyBytes = 10 * 1024;
const todos = [];

function sendJson(response, status, body) {
	response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
	response.end(JSON.stringify(body));
}

async function readJsonBody(request) {
	let size = 0;
	const chunks = [];
	for await (const chunk of request) {
		size += chunk.length;
		if (size > maxBodyBytes) {
			throw Object.assign(new Error("Request body too large"), { status: 413 });
		}
		chunks.push(chunk);
	}

	try {
		return JSON.parse(Buffer.concat(chunks).toString("utf8"));
	} catch {
		throw Object.assign(new Error("Body must be valid JSON"), { status: 400 });
	}
}

const server = http.createServer(async (request, response) => {
	const path = request.url?.split("?")[0];

	if (path !== "/todos") {
		sendJson(response, 404, { error: "Not Found" });
		return;
	}

	if (request.method === "GET") {
		sendJson(response, 200, todos);
		return;
	}

	if (request.method === "POST") {
		try {
			const body = await readJsonBody(request);
			const text = typeof body?.todo === "string" ? body.todo.trim() : "";
			if (text.length === 0 || text.length > maxTodoLength) {
				sendJson(response, 400, { error: `"todo" must be 1-${maxTodoLength} characters` });
				return;
			}

			const todo = { id: randomUUID(), text };
			todos.push(todo);
			sendJson(response, 201, todo);
		} catch (error) {
			sendJson(response, error.status || 500, { error: error.message });
		}
		return;
	}

	response.setHeader("Allow", "GET, POST");
	sendJson(response, 405, { error: "Method Not Allowed" });
});

server.listen(port, () => {
	console.log(`Todo backend started in port ${port}`);
});
