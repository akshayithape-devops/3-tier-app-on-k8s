import { useEffect, useState } from "react";

export default function App() {
  const API = window._env_?.API_URL || "http://localhost:3000";

  const [activeTab, setActiveTab] = useState("tasks");
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // 🔥 CPU LOAD FUNCTION
  // =========================
  const burnCPU = (intensity = 300000) => {
    let x = 0;
    for (let i = 0; i < intensity; i++) {
      x += Math.sqrt(i) * Math.random();
    }
    return x;
  };

  // =========================
  // Fetch Tasks
  // =========================
  const fetchTasks = async () => {
    setLoading(true);

    // 🔥 CPU spike during fetch (simulates real processing)
    burnCPU(200000);

    try {
      const res = await fetch(`${API}/tasks`);
      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error("Invalid response:", data);
        setTasks([]);
      } else {
        setTasks(data);
      }
    } catch (err) {
      console.error("Error fetching tasks", err);
      setTasks([]);
    }

    setLoading(false);
  };

  // =========================
  // Create Task
  // =========================
  const createTask = async () => {
    if (!title.trim()) return;

    // 🔥 CPU load before POST
    burnCPU(300000);

    try {
      await fetch(`${API}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });

      setTitle("");
      fetchTasks();
      setActiveTab("tasks");
    } catch (err) {
      console.error("Error creating task", err);
    }
  };

  // =========================
  // Delete Task
  // =========================
  const deleteTask = async (id) => {
    if (!id) return;

    // 🔥 CPU load before DELETE
    burnCPU(250000);

    try {
      await fetch(`${API}/tasks/${id}`, {
        method: "DELETE",
      });
      fetchTasks();
    } catch (err) {
      console.error("Error deleting task", err);
    }
  };

  // =========================
  // Background CPU simulation (1000+ users effect)
  // =========================
  useEffect(() => {
    fetchTasks();

    const interval = setInterval(() => {
      fetchTasks();

      // 🔥 background CPU load (simulates active users)
      burnCPU(150000);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-60 bg-white shadow-md p-5">
        <h1 className="text-xl font-bold mb-6">🚀 TaskFlow</h1>

        <div className="flex flex-col gap-3">
          <button onClick={() => { burnCPU(200000); setActiveTab("tasks"); }}
            className={`text-left px-3 py-2 rounded ${
              activeTab === "tasks"
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-200"
            }`}>
            📋 Tasks
          </button>

          <button onClick={() => { burnCPU(200000); setActiveTab("create"); }}
            className={`text-left px-3 py-2 rounded ${
              activeTab === "create"
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-200"
            }`}>
            ➕ Create Task
          </button>

          <button onClick={() => { burnCPU(200000); setActiveTab("about"); }}
            className={`text-left px-3 py-2 rounded ${
              activeTab === "about"
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-200"
            }`}>
            ℹ️ About
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold capitalize">
            {activeTab}
          </h2>
          <span className="text-sm text-gray-500">
            Backend: {API}
          </span>
        </div>

        {/* TASKS */}
        {activeTab === "tasks" && (
          <div>
            <button
              onClick={fetchTasks}
              className="mb-4 px-4 py-2 bg-blue-500 text-white rounded shadow"
            >
              🔄 Refresh
            </button>

            {loading ? (
              <p>Loading tasks...</p>
            ) : tasks.length === 0 ? (
              <p className="text-gray-500">No tasks found. Create one 🚀</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks.map((t) => {
                  const id = t.id || t._id;

                  // 🔥 CPU load per render (important for demo scaling)
                  burnCPU(50000);

                  return (
                    <div key={id} className="bg-white p-4 rounded shadow hover:shadow-lg transition">
                      <h3 className="font-medium">{t.title}</h3>

                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-xs text-gray-400">ID: {id}</span>

                        <button
                          onClick={() => deleteTask(id)}
                          className="text-red-500 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CREATE */}
        {activeTab === "create" && (
          <div className="bg-white p-6 rounded shadow max-w-md">
            <h3 className="text-lg font-medium mb-4">Create New Task</h3>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              className="w-full border p-2 rounded mb-4"
            />

            <button
              onClick={createTask}
              disabled={!title.trim()}
              className="w-full px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
            >
              Create Task
            </button>
          </div>
        )}

        {/* ABOUT */}
        {activeTab === "about" && (
          <div className="bg-white p-6 rounded shadow max-w-lg">
            <h3 className="text-lg font-medium mb-3">About This App</h3>
            <p className="text-gray-600 mb-2">
              3-tier Kubernetes application with load simulation.
            </p>
            <ul className="text-gray-600 list-disc ml-5">
              <li>Frontend: React + Tailwind</li>
              <li>Backend: Node.js API</li>
              <li>Database: MongoDB</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}