import { useEffect, useState } from "react";
import AttemptDetail from "./AttemptDetail";
import "../../styles/styles.css";

export default function Results() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.userId;

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAttemptId, setOpenAttemptId] = useState(null);

  useEffect(() => {
    if (!userId) return;
    loadAttempts();
  }, [userId]);

  async function loadAttempts() {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5230/api/user/my-attempts/${userId}`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        }
      );

      if (!res.ok) {
        setAttempts([]);
        return;
      }

      const data = await res.json();
      const completedAttempts = data.filter(a => a.isCompleted);

      completedAttempts.sort(
        (a, b) =>
          new Date((b.completedAt || b.startedAt) + "Z") -
          new Date((a.completedAt || a.startedAt) + "Z")
      );

      setAttempts(completedAttempts);
    } catch {
      setAttempts([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="results-page">
      <h2>My Attempts & Results</h2>

      {loading && <p>Loading...</p>}

      <div className="results-grid">
        {attempts.map(at => (
          <div key={at.examAttemptId} className="result-card">
            <h3>{at.examTitle}</h3>

            <div className="meta-row">
              <div><b>Status:</b> Completed</div>
              <div><b>Evaluated:</b> {at.isEvaluated ? "Yes" : "No"}</div>
            </div>

            <div className="meta-row">
              <div><b>Score:</b> {at.isEvaluated ? at.totalScore : "Pending"}</div>
              <div>
                <b>Result:</b>{" "}
                {at.isEvaluated ? (at.isPassed ? "Pass" : "Fail") : "Pending"}
              </div>
            </div>

            <div className="meta-row small">
              <div>
                <b>Started:</b>{" "}
                {new Date(at.startedAt + "Z").toLocaleString()}
              </div>
              <div>
                <b>Completed:</b>{" "}
                {at.completedAt
                  ? new Date(at.completedAt + "Z").toLocaleString()
                  : "-"}
              </div>
            </div>

            <button
              className="btn-view"
              onClick={() =>
                setOpenAttemptId(
                  openAttemptId === at.examAttemptId
                    ? null
                    : at.examAttemptId
                )
              }
            >
              {openAttemptId === at.examAttemptId
                ? "Hide Details"
                : "View Details"}
            </button>

            {openAttemptId === at.examAttemptId && (
              <AttemptDetail attemptId={at.examAttemptId} />
            )}
          </div>
        ))}
      </div>

      {!loading && attempts.length === 0 && (
        <p>No completed attempts found.</p>
      )}
    </div>
  );
}
