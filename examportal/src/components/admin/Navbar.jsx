import {  useNavigate } from "react-router-dom";
import "../../styles/styles.css";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  function logout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  return (
    <div className="navbarc">
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <img
          src="/image.png"
          alt="icon"
          style={{ width: "90px", height: "30px" }}
        />
        <span style={{ fontSize: "22px", color: "black" }}>
          ||
        </span>
        <h1 style={{ margin: 0, fontSize: 20, color: "white" }}>
          Welcome to Freshers Examination System
        </h1>
      </div>

      <div>
        {token && (
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        )}
      </div>
    </div>
  );
}
