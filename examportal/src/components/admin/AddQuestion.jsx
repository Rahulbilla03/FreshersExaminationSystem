import { useState, useEffect } from "react";
import "../../styles/styles.css";
import { useNavigate } from "react-router-dom";

export default function AddQuestion() {
  const navigate = useNavigate();
  const examId = Number(localStorage.getItem("currentExamId"));

  const [questions, setQuestions] = useState([
    {
      questionText: "",
      isMultipleChoice: false,
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOption: "",
      marks: "1"
    }
  ]);

  const [totalMarksAllowed, setTotalMarksAllowed] = useState(0);
  const [currentTotalMarks, setCurrentTotalMarks] = useState(0);
  useEffect(() => {
    async function loadExam() {
      try {
        const res = await fetch("http://localhost:5230/api/admin/exams", {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") }
        });

        if (!res.ok) {
          console.error("Exam fetch failed", res.status);
          return;
        }
        const text = await res.text();
        if (!text.trim()) {
          console.error("Empty exam list returned");
          return;
        }
        const exams = JSON.parse(text);
        const exam = exams.find(
          (e) => Number(e.examId ?? e.ExamId) === examId
        );
        if (exam) {
          setTotalMarksAllowed(exam.totalMarks ?? exam.TotalMarks ?? 0);
        }
      } catch (err) {
        console.error("loadExam error:", err);
      }
    }
    loadExam();
  }, [examId]);
  useEffect(() => {
    const sum = questions.reduce(
      (acc, q) => acc + Number(q.marks || 0), 
      0
    );
    setCurrentTotalMarks(sum);
  }, [questions]);
  //ADD MORE QUESTIONS//
  const addMore = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: "",
        isMultipleChoice: false,
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctOption: "",
        marks: "1"
      }
    ]);
  };

  //SUBMIT ALL QUESTIONS//
  const submitAll = async () => {
    const body = questions.map((q) => ({
      questionText: q.questionText,
      isMultipleChoice: q.isMultipleChoice,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      marks: Number(q.marks),
      examId: examId,
      correctOption: q.isMultipleChoice ? q.correctOption : null
    }));

    try {
      const res = await fetch("http://localhost:5230/api/admin/add-questions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        alert("Failed to add questions");
        return;
      }

      alert("Questions added successfully!");
      localStorage.removeItem("currentExamId");
      navigate("/admin");

    } catch (err) {
      console.error("Error submitting questions", err);
      alert("Submission failed");
    }
  };

  const marksMatch = currentTotalMarks === totalMarksAllowed;

  return (
    <div className="form-container">
      <h2>Add Questions</h2>

      <p><b>Total Marks Required:</b> {totalMarksAllowed}</p>
      <p><b>Current Marks:</b> {currentTotalMarks}</p>

      {!marksMatch && (
        <p className="marks-warning">
          Total marks must equal {totalMarksAllowed}.
        </p>
      )}

      {questions.map((q, id) => (
        <div key={id} className="question-block">
          <h4>Question {id + 1}</h4>

          <input
            placeholder="Question Text"
            value={q.questionText}
            onChange={(e) => {
              const copy = [...questions];
              copy[id].questionText = e.target.value;
              setQuestions(copy);
            }}
          />
          <label className="mc-inline">
            <input
              type="checkbox"
              checked={q.isMultipleChoice}
              onChange={(e) => {
                const copy = [...questions];
                copy[id].isMultipleChoice = e.target.checked;

                if (!e.target.checked) {
                  copy[id].optionA = "";
                  copy[id].optionB = "";
                  copy[id].optionC = "";
                  copy[id].optionD = "";
                  copy[id].correctOption = "";
                }

                setQuestions(copy);
              }}
            />{" "}
            Multiple Choice?
          </label><br />  <br />

          {q.isMultipleChoice && (
            <>
              <input placeholder="Option A" value={q.optionA}
                onChange={(e) => {
                  const c = [...questions]; c[id].optionA = e.target.value; setQuestions(c);
                }}
              />
              <input placeholder="Option B" value={q.optionB}
                onChange={(e) => {
                  const c = [...questions]; c[id].optionB = e.target.value; setQuestions(c);
                }}
              />
              <input placeholder="Option C" value={q.optionC}
                onChange={(e) => {
                  const c = [...questions]; c[id].optionC = e.target.value; setQuestions(c);
                }}
              />
              <input placeholder="Option D" value={q.optionD}
                onChange={(e) => {
                  const c = [...questions]; c[id].optionD = e.target.value; setQuestions(c);
                }}
              />
              <input placeholder="Correct Option (A/B/C/D)" value={q.correctOption}
                onChange={(e) => {
                  const c = [...questions]; c[id].correctOption = e.target.value; setQuestions(c);
                }}
              />
            </>
          )}

          <label className="marks-label">Marks</label>
          <input
            type="text"
            value={q.marks}
            onChange={(e) => {
              const copy = [...questions];
              copy[id].marks = e.target.value;
              setQuestions(copy);
            }}
          />

          <hr />
        </div>
      ))}

      <button onClick={addMore} className="add-question-btn">
        Add Another Question
      </button>

      <br /><br />

      <button
        onClick={submitAll}
        disabled={!marksMatch}
        className="submit-questions-btn"
      >
        Submit All Questions
      </button>
    </div>
  );
}
