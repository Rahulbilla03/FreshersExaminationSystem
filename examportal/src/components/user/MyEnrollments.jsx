import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/styles.css";

export default function MyEnrollments() {
  const [enrollments, setEnrollments] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.userId;
  const userName = user?.username;

  const navigate = useNavigate();

  useEffect(() => {
    if (userId) loadEnrollments();
  }, [userId]);

  const loadEnrollments = async () => {
    try {
      const res = await fetch(
        `http://localhost:5230/api/user/my-enrollments/${userId}`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        }
      );

      const data = await res.json();
      const result = [];

      for (const e of data) {
        const statusRes = await fetch(
          `http://localhost:5230/api/user/attempt-status/${e.enrollmentId}`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token")
            }
          }
        );

        const status = await statusRes.json();
        result.push({ ...e, isCompleted: status.isCompleted });
      }

      setEnrollments(result);
    } catch (err) {
      console.error(err);
      alert("Failed to load enrollments");
    }
  };

  const startTest = async (enrollmentId, examId) => {
    try {
      const res = await fetch(
        `http://localhost:5230/api/user/start?enrollmentId=${enrollmentId}`,
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        }
      );

      if (!res.ok) {
        alert("Cannot start exam");
        return;
      }

      const attemptId = await res.json();

      navigate(`/user/take-test/${enrollmentId}/${examId}`, {state:{attemptId}});
    } catch (err) {
      console.error(err);
      alert("Failed to start test");
    }
  };

  return (
    <div>
      <div
        style={{
          marginBottom: "15px",
          padding: "12px",
          background: "#f5f7fa",
          borderRadius: "8px"
        }}
      >
        <h3 style={{ margin: 0 }}>
          Welcome, {userName}
        </h3>
        <p style={{ margin: "4px 0 0", color: "#555" }}>
          User ID: {userId}
        </p>
      </div>

      <h2>My Enrolled Exams</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
          gap: "15px",
          marginTop: "20px"
        }}
      >
        {enrollments.map((e) => {
          const now = new Date();
          const endTime = new Date(e.endTime);
          const isTimeUp = now > endTime;

          return (
            <div
              key={e.enrollmentId}
              style={{
                padding: "15px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                background: "#fafafa"
              }}
            >
              <h3>{e.title}</h3>
              <p><b>Duration:</b> {e.durationInMinutes} mins</p>
              <p><b>Total Marks:</b> {e.totalMarks}</p>

              <p><b>Start:</b> {new Date(e.startTime).toLocaleString()}</p>
              <p><b>End:</b> {new Date(e.endTime).toLocaleString()}</p>

              {e.isCompleted ? (
                <button className="disabled-btn" disabled>
                  Completed
                </button>
              ) : isTimeUp ? (
                <button className="disabled-btn" disabled>
                  Time Up
                </button>
              ) : (
                <button
                  style={{
                    background: "#0a66c2",
                    color: "white",
                    width: "100%"
                  }}
                  onClick={() =>
                    startTest(e.enrollmentId, e.examId)
                  }
                >
                  Take Test
                </button>
              )}
            </div>
          );
        })}
      </div>

      {enrollments.length === 0 && (
        <p style={{ color: "gray", marginTop: "20px" }}>
          You haven't enrolled in any exams yet.
        </p>
      )}
    </div>
  );
}
