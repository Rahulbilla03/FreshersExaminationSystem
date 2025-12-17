import "../../styles/styles.css";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="logo"><b>Admin</b></div>

      <NavLink to="/admin" className="menu-link">Dashboard</NavLink>
      <NavLink to="/admin/create-user" className="menu-link">Create User</NavLink>
      <NavLink to="/admin/create-exam" className="menu-link">Create Exam</NavLink>
      <NavLink to="/admin/enrollments" className="menu-link">Enrollments</NavLink>
      <NavLink to="/admin/attempts" className="menu-link">View Attempts</NavLink>
    </div>
  );
}
