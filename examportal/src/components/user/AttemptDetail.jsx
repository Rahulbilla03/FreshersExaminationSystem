import { useEffect, useState } from "react";
import "../../styles/styles.css";

export default function AttemptDetail({ attemptId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!attemptId) return;
    loadDetail();
  }, [attemptId]);

  async function loadDetail() {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5230/api/user/attempt/${attemptId}`,
        {headers: { Authorization: "Bearer " + localStorage.getItem("token") }}
      );
      if (!res.ok) return setData(null);
      const d = await res.json();
      setData(d);
    } catch (err) {
      console.error(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading details...</div>;
  if (!data) return <div style={{ color: "red" }}>Details not available</div>;

  return (
    <div className="attempt-detail">
      <div className="attempt-header">
        <div><b>Exam:</b> {data.examTitle}</div>
        <div><b>Total Score:</b> {data.isEvaluated ? data.totalScore : "Pending"}</div>
        <div><b>Passed:</b> {data.isEvaluated ? (data.isPassed ? "Yes" : "No") : "Pending"}</div>
      </div>

      {!data.isEvaluated && (
        <div className="not-evaluated">Note: This attempt is not evaluated yet.</div>
      )}

      <div className="questions-list">
        {data.questions.map((q, idx) => (
          <div className="q-block" key={q.examAttemptAnswerId ?? idx}>
            <div className="q-row">
              <div className="q-left"><strong>Q{idx + 1}.</strong> {q.questionText}</div>
              <div className="q-right"><small>Marks: {q.questionMarks}</small></div>
            </div>

            <div className="answer-row">
              <div><b>Your answer:</b> <span className="mono">{q.userAnswer ?? "-"}</span></div>

              {q.isMultipleChoice && (
                <div><b>Correct:</b> {q.correctOption ?? "-"} 
                  <small> (A: {q.optionA} | B: {q.optionB} | C: {q.optionC} | D: {q.optionD})</small>
                </div>
              )}

              <div><b>Awarded:</b> {q.awardedMarks ?? (data.isEvaluated ? 0 : "Pending")}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
