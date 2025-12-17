import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/styles.css";

export default function EvaluateAttempt() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);

  useEffect(() => {
    loadAttempt();
  }, []);

  async function loadAttempt() {
    try {
      const res = await fetch(
        `http://localhost:5230/api/admin/attempt/${attemptId}`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        }
      );

      if (!res.ok) {
        alert("Failed to load attempt");
        return;
      }
      
      const data = await res.json();
      setAttempt(data);
    } catch (err) {
      console.error(err);
      alert("Error loading attempt");
    }
  }

  async function submitEvaluation() {
    try {
      const payload = attempt.questions.map(q => ({
        examAttemptAnswerId: q.examAttemptAnswerId,
        awardedMarks: Number(q.awardedMarks || 0)
      }));

      const res = await fetch(
        `http://localhost:5230/api/admin/evaluate/${attemptId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token")
          },
          body: JSON.stringify(payload)
        }
      );

      if (!res.ok) {
        const msg = await res.text();
        alert(msg);
        return;
      }

      alert("Evaluation completed successfully!");
      navigate("/admin/attempts");

    } catch (err) {
      console.error(err);
      alert("Evaluation failed");
    }
  }

  function updateAwardedMarks(idx, value, maxMarks) {
    if (attempt.isEvaluated) return;

    let marks = Number(value);
    if (marks > maxMarks) marks = maxMarks;
    if (marks < 0) marks = 0;

    setAttempt(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === idx ? { ...q, awardedMarks: marks } : q
      )
    }));
  }

  if (!attempt) return <p>Loading...</p>;

  const isReadOnly = attempt.isEvaluated;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Evaluate Attempt</h2>

      {isReadOnly && (
        <p style={{ color: "green", fontWeight: "bold" }}>
          This attempt has already been evaluated
        </p>
      )}

      {attempt.questions.map((q, idx) => (
        <div
          key={q.examAttemptAnswerId}
          style={{
            padding: "12px",
            marginTop: "12px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            background: "#fafafa"
          }}
        >
          <h4>Q{idx + 1}. {q.questionText}</h4>

          {q.isMultipleChoice && (
            <p><b>Correct Option:</b> {q.correctOption}</p>
          )}

          <p><b>User Answer:</b> {q.userAnswer}</p>
          <p><b>Total Marks:</b> {q.marks}</p>

          <label>
            <b>Award Marks:</b>
            <input
              type="text"
              value={q.awardedMarks ?? ""}
              disabled={isReadOnly}
              style={{
                marginLeft: 10,
                width: 80,
                background: isReadOnly ? "#eee" : "white"
              }}
              onChange={(e) =>
                updateAwardedMarks(idx, e.target.value, q.marks)
              }
            />
          </label>
        </div>
      ))}

      {!isReadOnly && (
        <button
          onClick={submitEvaluation}
          style={{
            marginTop: 20,
            padding: "10px 16px",
            background: "#0a66c2",
            color: "white",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer"
          }}
        >
          Submit Evaluation
        </button>
      )}
    </div>
  );
}
