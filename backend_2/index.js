const express = require("express");
const http = require("node:http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

// Redis connection (replaces MongoDB)
const { connectRedis, redisClient } = require("./db/redis-client");

// Create express application
const app = express();

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
	cors: {
		origin: ['*',`${process.env.CORS_ORIGIN}`],
		methods: ["GET", "POST"],
		credentials: true,
	},
});

// Middlewares
app.use(
	cors({
		origin: ["http://localhost:3000"],
		methods: ["GET", "POST", "PUT", "DELETE"],
		credentials: true,
	}),
);
app.use(express.json());
app.use(cookieParser());

// Make Redis client and Socket.io available in routes
app.locals.redisClient = redisClient;
app.locals.io = io;

// Load routes
const teacher = require("./routes/teacher");
const student = require("./routes/student");

// Use routes
app.use("/api/teachers", teacher);
app.use("/api/students", student);

// Health check endpoint
app.get("/health", async (_req, res) => {
	try {
		await redisClient.ping();
		res.json({
			status: "OK",
			redis: "Connected",
			socketio: "Active",
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		res.status(503).json({
			status: "ERROR",
			redis: "Disconnected",
			error: error.message,
		});
	}
});

// Socket.io event handlers
require("./socket-handlers")(io);

// Error handling middleware
app.use((err, _req, res, _next) => {
	console.error("Error:", err);
	res.status(err.status || 500).json({
		error: err.message || "Internal Server Error",
		...(process.env.NODE_ENV === "development" && { stack: err.stack }),
	});
});

// 404 handler
app.use((_req, res) => {
	res.status(404).json({ error: "Route not found" });
});

// Initialize server
const PORT = process.env.PORT || 3001;

async function startServer() {
	try {
		// Connect to Redis first
		console.log("🔄 Connecting to Redis...");
		await connectRedis();

		// Start Express + Socket.io server
		server.listen(PORT, () => {
			console.log(`✓ Server listening on port ${PORT}`);
			console.log(`✓ Socket.io server active on port ${PORT}`);
			console.log(`✓ Health check: http://localhost:${PORT}/health`);
			console.log(`✓ API endpoints:`);
			console.log(`  - Teachers: http://localhost:${PORT}/api/teachers`);
			console.log(`  - Students: http://localhost:${PORT}/api/students`);
		});
	} catch (error) {
		console.error("❌ Failed to start server:", error);
		process.exit(1);
	}
}

// Start the server
startServer();

// Graceful shutdown
process.on("SIGINT", async () => {
	console.log("\n🔄 Shutting down gracefully...");
	io.close();
	await redisClient.quit();
	process.exit(0);
});

process.on("SIGTERM", async () => {
	console.log("\n🔄 Shutting down gracefully...");
	io.close();
	await redisClient.quit();
	process.exit(0);
});

module.exports = app;
