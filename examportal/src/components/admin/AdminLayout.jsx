import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import "../../styles/styles.css";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <>
      <Navbar />
      <div className="layout">
        <Sidebar />
        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </>
  );
}
