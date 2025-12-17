import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/styles.css";

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch (e) {
    console.error("JWT decode error:", e);
    return {};
  }
}

export default function Login() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5230/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password })
      });

      if (!res.ok) {
        setError("Invalid ID or password");
        return;
      }

      let token = await res.text();
      token = token.replace(/^"|"$/g, "");

      localStorage.setItem("token", token);

      const claims = decodeJwt(token);

      const userObj = {
        userId: claims.id,
        username: claims.unique_name,
        role: claims.role,
        isAdmin: claims.role === "Admin"
      };

      localStorage.setItem("user", JSON.stringify(userObj));

      navigate(userObj.isAdmin ? "/admin" : "/user");

    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError("Something went wrong");
    }
  };

  return (
    <div className="login-page">
      <h1 className="login-system-title">Freshers Examination System</h1>

      <form className="login-card" onSubmit={submit}>
        <h2 className="login-title">Login</h2>

        {error && <div className="login-error">{error}</div>}

        <input
          type="text"
          placeholder="Enter User ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="login-btn">Login</button>
      </form>

    </div>
  );
}
