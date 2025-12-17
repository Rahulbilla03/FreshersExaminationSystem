import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/styles.css";

export default function AttemptList() {
  const [attempts, setAttempts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await fetch("http://localhost:5230/api/admin/attempts", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token")
        }
      });

      if (!res.ok) {
        console.error("Failed to load attempts", res.status);
        setAttempts([]);
        setFiltered([]);
        return;
      }

      const data = await res.json();
      
      const completedAttempts = data.filter(a => a.isCompleted);

      setAttempts(completedAttempts);
      setFiltered(completedAttempts);

    } catch (err) {
      console.error("Fetch attempts error", err);
      setAttempts([]);
      setFiltered([]);
    }
  }

  const handleSearch = (text) => {
    setSearch(text);

    if (!text.trim()) {
      setFiltered(attempts);
      return;
    }

    const lower = text.toLowerCase();

    const result = attempts.filter(a =>
      a.examTitle?.toLowerCase().includes(lower)
    );

    setFiltered(result);
  };

  return (
    <div>
      <h2>Completed Exam Attempts</h2>

      <input
        type="text"
        placeholder="Search by exam name..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        style={{
          width: "250px",
          padding: "8px",
          marginBottom: "12px",
          borderRadius: "6px",
          border: "1px solid #ccc"
        }}
      />

      <table
        border="1"
        cellPadding="8"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>User</th>
            <th>Exam</th>
            <th>Total Marks</th>
            <th>Score</th>
            <th>Result</th>
            <th>Evaluation Status</th>
            <th>Evaluate</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((a) => (
            <tr key={a.examAttemptId}>
              <td>{a.userName}</td>
              <td>{a.examTitle}</td>
              <td>{a.totalMarks ?? "—"}</td>
              <td>{a.totalScore ?? "-"}</td>

              <td
                style={{
                  fontWeight: "bold",
                  color: a.isPassed ? "green" : "red"
                }}
              >
                {a.isPassed ? "Passed" : "Failed"}
              </td>

              <td style={{ color: a.isEvaluated ? "green" : "orange" }}>
                {a.isEvaluated ? "Evaluated" : "Pending"}
              </td>

              <td>
                <button
                  onClick={() =>
                    navigate(`/admin/evaluate/${a.examAttemptId}`)
                  }
                >
                  View / Evaluate
                </button>
              </td>
            </tr>
          ))}

          {filtered.length === 0 && (
            <tr>
              <td colSpan={7} style={{ textAlign: "center" }}>
                No completed attempts found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
