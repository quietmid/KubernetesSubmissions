import http from "http";

const port = Number(process.env.PORT) || 3000;

const server = http.createServer((request, response) => {
	response.writeHead(200, { "Content-Type": "text/plain" });
	response.end("Todo app\n");
});

server.listen(port, () => {
	console.log(`Server started in port ${port}`);
});