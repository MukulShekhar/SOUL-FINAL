require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const userRoutes = require("./routes/userActions");
const uploadRoutes = require("./routes/upload");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");

const app = express();

// ✅ CORS setup for frontend
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5001",
      "http://127.0.0.1:5001",
      "http://localhost:5002",
      "http://127.0.0.1:5002"
    ],
    credentials: true,
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(express.json());

// ✅ Ensure uploads dir exists & serve static
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use(
  "/uploads",
  express.static(uploadsDir, {
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);

// ✅ Health check
app.get("/api/ping", (req, res) => res.json({ ok: true }));

// ✅ MongoDB config
mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ DB Connection Successful"))
  .catch((err) => console.log("❌ DB Error:", err.message));

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// ✅ Start server with retry if port in use
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`🚀 Server started on port ${port}`);
  });

  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5001",
        "http://127.0.0.1:5001",
        "http://localhost:5002",
        "http://127.0.0.1:5002"
      ],
      credentials: true,
    },
  });

  global.onlineUsers = new Map();

  io.on("connection", (socket) => {
    global.chatSocket = socket;

    socket.on("add-user", (userId) => {
      onlineUsers.set(userId, socket.id);
    });

    socket.on("send-msg", (data) => {
      const sendUserSocket = onlineUsers.get(data.to);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("msg-recieve", data.msg);
      }
    });

    // ✅ Read receipt
    socket.on("message-seen", ({ to, from, messageId }) => {
      const sendUserSocket = onlineUsers.get(to);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("message-seen", { from, messageId });
      }
    });

    // ✅ Typing indicators
    socket.on("typing", ({ to, from }) => {
      const sendUserSocket = onlineUsers.get(to);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("typing", { from });
      }
    });

    socket.on("stop-typing", ({ to, from }) => {
      const sendUserSocket = onlineUsers.get(to);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("stop-typing", { from });
      }
    });
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`⚠️ Port ${port} in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      throw err;
    }
  });
};

const port = parseInt(process.env.PORT, 10) || 5000;
startServer(port);
