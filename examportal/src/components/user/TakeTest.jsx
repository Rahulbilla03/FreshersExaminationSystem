import { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import "../../styles/styles.css";

export default function TakeTest() {
  const { enrollmentId, examId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const initialAttemptId = location.state?.attemptId ?? null;

  const [attemptId, setAttemptId] = useState(initialAttemptId);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [durationMinutes, setDurationMinutes] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const examIdNum = Number(examId);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);

        const qRes = await fetch(
          `http://localhost:5230/api/user/questions/${examIdNum}`,
          { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
        );
        if (!qRes.ok) throw new Error();

        const qData = await qRes.json();
        setQuestions(qData);

        setAnswers(
          qData.map(q => ({
            questionId: q.questionId,
            answerText: ""
          }))
        );

        const examRes = await fetch(
          "http://localhost:5230/api/user/exams",
          { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
        );

        if (examRes.ok) {
          const exams = await examRes.json();
          const exam = exams.find(e => Number(e.examId ?? e.ExamId) === examIdNum);
          setDurationMinutes(exam?.durationInMinutes ?? 30);
        } else {
          setDurationMinutes(30);
        }

      } catch {
        alert("Failed to load test");
        navigate("/user/my-enrollments");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [examIdNum, navigate]);

  useEffect(() => {
    async function createAttempt() {
      if (attemptId) return;

      try {
        const res = await fetch(
          `http://localhost:5230/api/user/start?enrollmentId=${enrollmentId}`,
          {
            method: "POST",
            headers: { Authorization: "Bearer " + localStorage.getItem("token") }
          }
        );

        const id = await res.json();
        setAttemptId(id);
      } catch {
        alert("Cannot start test");
        navigate("/user/my-enrollments");
      }
    }

    if (!loading) createAttempt();
  }, [loading, attemptId, enrollmentId, navigate]);

  useEffect(() => {
    if (!durationMinutes) return;

    setSecondsLeft(durationMinutes * 60);
  }, [durationMinutes]);

  useEffect(() => {
    if (secondsLeft === null) return;

    if (secondsLeft === 0) {
      submitAnswers(true);
      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const setAnswer = (questionId, value) => {
    setAnswers(prev =>prev.map(a =>a.questionId === questionId? { ...a, answerText: value }: a));
    };

  const allAnswered = answers.every(a => a.answerText.trim() !== "");

  async function submitAnswers(isAuto = false) {
    if (submitting) return;
    setSubmitting(true);

    try {
      await fetch("http://localhost:5230/api/user/submit-all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({ attemptId, answers })
      });

      await fetch(
        `http://localhost:5230/api/user/complete-attempt/${attemptId}`,
        {
          method: "POST",
          headers: { Authorization: "Bearer " + localStorage.getItem("token") }
        }
      );

      if (!isAuto) alert("Test submitted successfully!");
    } catch {
      if (!isAuto) alert("Submit failed");
    } finally {
      navigate("/user/my-enrollments");
    }
  }

  const manualSubmit = () => {
    if (!allAnswered) {
      if (!window.confirm("Some questions are unanswered. Submit anyway?")) return;
    }
    submitAnswers(false);
  };

  if (loading) return <div>Loading test…</div>;

  return (
    <div className="take-test-container">
      <h2 className="take-test-title">Take Test</h2>

      <div className="timer-box">
        Time Left: {formatTime(secondsLeft)}
      </div>

      {questions.map((q, idx) => (
        <div key={q.questionId} className="test-question-box">
          <div className="question-title">
            Q{idx + 1}. {q.questionText}
          </div>

          {q.isMultipleChoice ? (
            <div className="test-options">
              {["A", "B", "C", "D"].map(opt => (
                <label key={opt}>
                  <input
                    type="radio"
                    name={`q_${q.questionId}`}
                    checked={
                      answers.find(a => a.questionId === q.questionId)?.answerText === opt
                    }
                    onChange={() => setAnswer(q.questionId, opt)}
                  />
                  <span>{q[`option${opt}`]}</span>
                </label>
              ))}
            </div>
          ) : (
            <textarea
              value={
                answers.find(a => a.questionId === q.questionId)?.answerText ?? ""
              }
              onChange={e => setAnswer(q.questionId, e.target.value)}
            />
          )}
        </div>
      ))}

      <button
        onClick={manualSubmit}
        disabled={submitting}
        className="test-submit"
      >
        {submitting ? "Submitting..." : "Submit Test"}
      </button>
    </div>
  );
}
