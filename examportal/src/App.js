import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/auth/Login";

import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./components/admin/Dashboard";
import CreateUser from "./components/admin/CreateUser";
import CreateExam from "./components/admin/CreateExam";
import AddQuestion from "./components/admin/AddQuestion";
import Enrollments from "./components/admin/Enrollments";
import AttemptList from "./components/admin/AttemptList";
import EvaluateAttempt from "./components/admin/EvaluateAttempt";

import UserLayout from "./components/user/UserLayout";
import UserDashboard from "./components/user/UserDashboard";
import MyEnrollments from "./components/user/MyEnrollments";
import TakeTest from "./components/user/TakeTest";
import Results from "./components/user/Results";

import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="create-user" element={<CreateUser />} />
          <Route path="create-exam" element={<CreateExam />} />
          <Route path="add-question" element={<AddQuestion />} />
          <Route path="enrollments" element={<Enrollments />} />
          <Route path="attempts" element={<AttemptList />} />
          <Route path="evaluate/:attemptId" element={<EvaluateAttempt />} />
        </Route>

        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserDashboard />} />
          <Route path="my-enrollments" element={<MyEnrollments />} />
          <Route path="take-test/:enrollmentId/:examId" element={<TakeTest />} />
          <Route path="results" element={<Results />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </Router>
  );
}

export default App;
