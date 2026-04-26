const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

// =========================
// ENV CONFIG
// =========================
const PORT = process.env.PORT || 3000;
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/tasks";

const ENABLE_LOAD = process.env.ENABLE_LOAD === "true";

// =========================
// REQUEST LOGGING
// =========================
app.use((req, res, next) => {
  const start = Date.now();

  console.log(`[REQ] ${req.method} ${req.url}`);

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[RES] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`
    );
  });

  next();
});

// =========================
// MONGO CONNECTION
// =========================
mongoose.set("debug", false);

mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    retryWrites: true,
    maxPoolSize: 20,
    minPoolSize: 5,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ Mongo connection failed:", err.message);
    process.exit(1);
  });

mongoose.connection.on("connected", () => {
  console.log("🟢 MongoDB connection established");
});

mongoose.connection.on("error", (err) => {
  console.error("🔴 MongoDB error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("🟡 MongoDB disconnected");
});

// =========================
// SCHEMA
// =========================
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// 🔥 INDEX for performance
TaskSchema.index({ createdAt: -1 });

const Task = mongoose.model("Task", TaskSchema);

// =========================
// CPU LOAD FUNCTION
// =========================
const burnCPU = (n = 2e6) => {
  let x = 0;
  for (let i = 0; i < n; i++) {
    x += Math.sqrt(i) * Math.random();
  }
  return x;
};

// =========================
// ROUTES
// =========================

// Health check
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// 🔥 Controlled load endpoint (for AB / k6 testing)
app.get("/load", (req, res) => {
  if (ENABLE_LOAD) {
    burnCPU(3e6);
  }
  res.send("Load executed");
});

// GET tasks
app.get("/tasks", async (req, res) => {
  try {
    if (ENABLE_LOAD) burnCPU(1e6);

    const tasks = await Task.find().sort({ createdAt: -1 });

    res.json(
      tasks.map((t) => ({
        id: t._id,
        title: t.title,
        createdAt: t.createdAt,
      }))
    );
  } catch (err) {
    console.error("GET /tasks error:", err.message);
    res.status(500).send("Server Error");
  }
});

// CREATE task
app.post("/tasks", async (req, res) => {
  try {
    if (ENABLE_LOAD) burnCPU(2e6);

    const task = new Task({ title: req.body.title });
    await task.save();

    res.json({
      id: task._id,
      title: task.title,
      createdAt: task.createdAt,
    });
  } catch (err) {
    console.error("POST /tasks error:", err.message);
    res.status(500).send("Server Error");
  }
});

// DELETE task
app.delete("/tasks/:id", async (req, res) => {
  try {
    if (ENABLE_LOAD) burnCPU(1e6);

    await Task.findByIdAndDelete(req.params.id);
    res.send("Deleted");
  } catch (err) {
    console.error("DELETE error:", err.message);
    res.status(400).send("Invalid ID");
  }
});

// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});