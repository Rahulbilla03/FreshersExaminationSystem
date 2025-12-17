import { useState } from "react";
import "../../styles/styles.css";

export default function CreateUser() {
  const [username, setUsername] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const submit = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      alert("All fields are required.");
      return; 
    }

    try {
      const res = await fetch("http://localhost:5230/api/admin/create-user", {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          Authorization: "Bearer " + localStorage.getItem("token")
        },
        body:JSON.stringify({ username, email, password, isAdmin:false })
      });

      if (!res.ok) {
        const msg = await res.text();
        alert("Failed to create user: " + msg);
        return;
      }

      alert("User created successfully!");
      setUsername("");
      setEmail("");
      setPassword("");

    } catch (err) {
      console.error("Create user failed", err);
      alert("Failed to create user");
    }
  };

  return (
    <div className="form-container">
      <h3>Create User</h3>

      <div className="form-group">
        <label>Name</label>
        <input 
          required
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Enter user name"
        />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input 
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter email"
        />
      </div>

      <div className="form-group">
        <label>Password</label>
        <input 
          required
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter password"
        />
      </div>

      <button onClick={submit}>Create</button>
    </div>
  );
}
