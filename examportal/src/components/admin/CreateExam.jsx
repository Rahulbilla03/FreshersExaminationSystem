import { useState } from "react";
import "../../styles/styles.css";
import { useNavigate } from "react-router-dom";

export default function CreateExam() {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [marks, setMarks] = useState("");
  const [pass, setPass] = useState(40);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const navigate = useNavigate();

  const submit = async () => {
    if (!title||!duration||!marks||!startTime||!endTime) {
      alert("All fields are required");
      return;
    }

    const payload = {
      title,
      durationInMinutes: Number(duration),
      totalMarks: Number(marks),
      passPercentage: Number(pass),
      startTime,
      endTime
    };

    try {
      const res = await fetch("http://localhost:5230/api/admin/create-exam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        alert("Failed to create exam");
        return;
      }
      const text = await res.text();
      if (!text.trim()) {
        alert("Exam created but no response body!");
        return;
      }
      const exam = JSON.parse(text);

      const examId = exam.examId ?? exam.ExamId;

      alert("Exam created successfully!");
      localStorage.setItem("currentExamId", examId);

      navigate(`/admin/add-question`);

    } catch (err) {
      console.error("Create exam failed", err);
      alert("Failed to create exam");
    }
  };

  return (
    <div className="form-container">
      <h3>Create Exam</h3>

      <div className="form-group">
        <label>Title</label>
        <input placeholder="Enter Exam Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="form-group">
        <label>Duration (minutes)</label>
        <input placeholder="Enter Duration in minutes" type="text" value={duration} onChange={(e) => setDuration(e.target.value)} />
      </div>

      <div className="form-group">
        <label>Total Marks</label>
        <input placeholder="Enter Total Marks" type="text" value={marks} onChange={(e) => setMarks(e.target.value)} />
      </div>

      <div className="form-group">
        <label>Pass Percentage</label>
        <input placeholder="Enter Pass Percentage" type="text" value={pass} onChange={(e) => setPass(e.target.value)} />
      </div>

      <div className="form-group">
        <label>Start Date & Time</label>
        <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
      </div>

      <div className="form-group">
        <label>End Date & Time</label>
        <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
      </div>

      <button onClick={submit}>Create Exam</button>
    </div>
  );
}
