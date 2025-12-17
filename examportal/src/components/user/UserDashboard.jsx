import { useEffect, useState } from "react";
import "../../styles/styles.css";

export default function UserDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [exams, setExams] = useState([]);
  const [enrolledExamIds, setEnrolledExamIds] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const examRes = await fetch("http://localhost:5230/api/user/exams", {
        headers:  { Authorization: "Bearer " + localStorage.getItem("token") }
      });

      const examText = await examRes.text();
      let examData = [];

      if (examText.trim()) {
        try {
          examData = JSON.parse(examText);
        } catch (err) {
          console.error("Invalid JSON from /exams:", err);
        }
      }

      setExams(examData);
      const enrRes = await fetch(
        `http://localhost:5230/api/user/my-enrollments/${user.userId}`,
        {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") }
        }
      );

      const enrText = await enrRes.text();
      let enrData = [];

      if (enrText.trim()) {
        try {
          enrData = JSON.parse(enrText);
        } catch (err) {
          console.error("Invalid JSON from /my-enrollments:", err);
        }
      }

      setEnrolledExamIds(enrData.map(e => Number(e.examId)));

    } catch (err) {
      console.error("Dashboard Load Error:", err);
    }
  }

  const enroll = async (examId) => {
    try {
      await fetch(
        `http://localhost:5230/api/user/enroll?userId=${user.userId}&examId=${examId}`,
        {
          method: "POST",
          headers: { Authorization: "Bearer " + localStorage.getItem("token") }
        }
      );

      loadDashboard();
    } catch (err) {
      console.error("Enroll error:", err);
    }
  };

  return (
    <div>
      <h2>Available Exams</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
          gap: "15px",
        }}
      >
        {exams.map((exam) => {
          const examId = Number(exam.examId ?? exam.ExamId);
          const isEnrolled = enrolledExamIds.includes(examId);

          return (
            <div
              key={examId}
              style={{
                border: "1px solid #ccc",
                padding: 12,
                borderRadius: 8,
                background: "white",
              }}
            >
              <h3>{exam.title}</h3>
              <p>Marks: {exam.totalMarks}</p>
              <p>Duration: {exam.durationInMinutes} mins</p>

              {isEnrolled ? (
                <button className="disabled-btn" disabled>
                  Enrolled
                </button>
              ) : (
                <button
                  style={{
                    background: "#007bff",
                    color: "#fff",
                    width: "100%",
                  }}
                  onClick={() => enroll(examId)}
                >
                  Enroll
                </button>
              )}
            </div>
          );
        })}

        {exams.length === 0 && (
          <p style={{ gridColumn: "1/-1", textAlign: "center" }}>
            No exams available
          </p>
        )}
      </div>
    </div>
  );
}
