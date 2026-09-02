import { useEffect, useState } from "react";
import { getProjects, getClients, createProject, updateStatus } from "./api";

const STATUS_OPTIONS = ["planning", "in_progress", "completed"];



export default function App() {
  const [errorMessage, setErrorMessage] = useState(null);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [newProject, setNewProject] = useState({ name: "", client_id: "" });

  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, []);

  function fetchProjects() {
    getProjects()
      .then(setProjects)
      .catch((err) => setErrorMessage(err.message));
  }

  function fetchClients() {
    getClients()
      .then(setClients)
      .catch((err) => setErrorMessage(err.message));
  }

  function handleStatusChange(projectId, newStatus) {
    setErrorMessage(null); // เคลียร์ error เก่าก่อน
    updateStatus(projectId, newStatus)
      .then(() => {
        setProjects(
          projects.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p))
        );
      })
      .catch((err) => setErrorMessage(err.message));
  }

  function handleCreate(e) {
    e.preventDefault();
    setErrorMessage(null);

    if (!newProject.name.trim() || !newProject.client_id) {
      setErrorMessage("กรุณากรอกชื่อโปรเจกต์และเลือกลูกค้าให้ครบถ้วน");
      return;
    }

    createProject({
      name: newProject.name.trim(),
      client_id: Number(newProject.client_id),
    })
      .then(() => {
        setNewProject({ name: "", client_id: "" });
        fetchProjects();
      })
      .catch((err) => setErrorMessage(err.message));
  }


  return (
    <div className="app">
      <header className="app-header">
        {errorMessage && (
          <div style={{
            background: "#ffebee",
            color: "#c62828",
            padding: "12px 16px",
            borderRadius: "6px",
            marginBottom: "20px",
            border: "1px solid #ef9a9a"
          }}>
            ⚠️ {errorMessage}
          </div>
        )}

        <h1>Client Project Tracker</h1>
        <p>Internal tool for tracking active client projects.</p>
      </header>

      <section className="new-project">
        <h2>Add Project</h2>
        <form onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="Project name"
            required
            value={newProject.name}
            onChange={(e) =>
              setNewProject({ ...newProject, name: e.target.value })
            }
          />
          <select
            required
            value={newProject.client_id}
            onChange={(e) =>
              setNewProject({ ...newProject, client_id: e.target.value })
            }
          >
            <option value="">Select client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button type="submit">Add</button>
        </form>
      </section>

      <section className="project-list">
        <h2>Projects</h2>
        <table>
          <thead>
            <tr>
              <th>Project</th>
              <th>Client</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.client_name}</td>
                <td>
                  <span className="status-badge">{p.status}</span>
                  <select
                    value={p.status}
                    onChange={(e) => handleStatusChange(p.id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
