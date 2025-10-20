import { Routes, Route } from "react-router-dom";
import App from "./App"; // your landing page
import SignUp from "./SignUp";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Profile from "./Profile";
import ClubCreate from "./ClubCreate";
import ClubHome from "./ClubHome";
import ClubDiscover from "./ClubDiscover";


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/clubs/new" element={<ClubCreate />} />
      <Route path="/clubs/:id" element={<ClubHome />} />
      <Route path="/clubs" element={<ClubDiscover />} />
    </Routes>
  );
}
