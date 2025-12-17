import { useEffect, useState } from "react";
import "../../styles/styles.css";

export default function Enrollments() {
  const [list, setList] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [mode, setMode] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);
  const loadAll = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5230/api/admin/enrollments",
        { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
      );

      if (!res.ok) {
        console.error("Fetch failed:", res.status);
        setList([]);
        return;
      }

      const data = await res.json();
      setList(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load enrollments");
    } finally {
      setLoading(false);
    }
  };
  const searchExam = async () => {
    if (!searchId) return;

    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:5230/api/admin/enrollments/exam/${searchId}`,
        { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
      );

      if (!res.ok) {
        console.error("Fetch failed:", res.status);
        setList([]);
        return;
      }

      const data = await res.json();
      setList(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load exam enrollments");
    } finally {
      setLoading(false);
    }
  };
  const searchUser = async () => {
    if (!searchId) return;

    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:5230/api/admin/enrollments/user/${searchId}`,
        {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") }
        }
      );

      if (!res.ok) {
        console.error("Fetch failed:", res.status);
        setList([]);
        return;
      }

      const data = await res.json();
      setList(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load user enrollments");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Enrollments</h2>

      <div className="form-group">
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="all">ALL</option>
          <option value="exam">By Exam ID</option>
          <option value="user">By User ID</option>
        </select>
      </div>

      {mode !== "all" && (
        <div className="form-group">
          <input
            placeholder="Enter ID"
            type="number"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
          <button
            style={{ marginTop: "10px" }}
            onClick={mode === "exam" ? searchExam : searchUser}
          >
            Search
          </button>
        </div>
      )}

      <button style={{ marginBottom: "15px" }} onClick={loadAll}>
        Show All
      </button>

      {loading && <p>Loading...</p>}

      <table border="1" cellPadding={8} style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Enrollment ID</th>
            <th>User ID</th>
            <th>User</th>
            <th>Exam</th>
            <th>ExamId</th>
            <th>Enrolled Date</th>
          </tr>
        </thead>

        <tbody>
          {list.map((e) => (
            <tr key={e.enrollmentId}>
              <td>{e.enrollmentId}</td>
              <td>{e.user?.userId ?? e.userId ?? "-"}</td>
              <td>{e.user?.username}</td>
              <td>{e.exam?.title}</td>
              <td>{e.examId}</td>
              <td>{new Date(e.enrollmentDate + "Z").toLocaleString()} </td>

            </tr>
          ))}

          {list.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: "center" }}>
                No enrollments found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
