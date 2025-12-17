import { useEffect, useState } from "react";
import "../../styles/styles.css";

export default function Dashboard() {
  const [exams, setExams] = useState([]);

  const loadExams = async () => {
    try {
      const res = await fetch("http://localhost:5230/api/admin/exams", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token")
        }
      });

      if (!res.ok) {
        console.error("Fetch failed:", res.status);
        return;
      }

      const data = await res.json();
      setExams(data);
    } catch (err) {
      console.error("FETCH ERROR:", err);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const publishExam = async (examId) => {
    try {
      const res = await fetch(
        `http://localhost:5230/api/admin/publish-exam/${examId}`,
        {
          method: "PUT",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        }
      );

      if (!res.ok) {
        console.error("Publish failed:", res.status);
        return;
      }

      await loadExams();
    } catch (err) {
      console.error("Publish failed", err);
    }
  };

  return (
    <div>
      <h2>All Exams</h2>

      <div className="exam-grid">
        {exams.map(e => (
          <div key={e.examId} className="exam-card">
            <div className="exam-title">{e.title}</div>
            <div className="exam-info">Marks: {e.totalMarks}</div>
            <div className="exam-info">Duration: {e.durationInMinutes} min</div>
            <div className="exam-info">
              Published: {e.isPublished ? "Yes" : "No"}
            </div>

            {!e.isPublished && (
              <button
                className="publish-btn"
                onClick={() => publishExam(e.examId)}
              >
                Publish
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
