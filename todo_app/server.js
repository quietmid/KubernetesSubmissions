import http from "http";

const port = Number(process.env.PORT) || 3000;

const server = http.createServer((request, response) => {
	if (request.method === "GET" && request.url === "/") {
		response.writeHead(200, { "Content-Type": "text/html" });
		response.end(`
			<!doctype html>
			<html>
				<head><title>Todo App</title></head>
				<body><h1>Todo app is running</h1></body>
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