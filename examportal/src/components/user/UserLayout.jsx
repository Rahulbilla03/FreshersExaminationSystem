import Navbar from "../admin/Navbar"; 
import { Outlet, NavLink } from "react-router-dom";
import "../../styles/styles.css";

export default function UserLayout() {
  return (
    <>
      <Navbar />

      <div className="layout">
        <div className="sidebar">
          <div className="logo"><b>User</b></div>

          <NavLink to="/user" className="menu-link">Home</NavLink>
          <NavLink to="/user/my-enrollments" className="menu-link">My Enrollments</NavLink>
          <NavLink to="/user/results" className="menu-link">My Results</NavLink>
        </div>

        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </>
  );
}
