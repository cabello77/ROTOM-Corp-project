import { Routes, Route } from "react-router-dom";
import App from "./App"; // your landing page
import SignUp from "./SignUp";
import Login from "./Login";
import UserHome from "./UserHome";
import ClubCreate from "./ClubCreate";
import ClubHome from "./ClubHome";
import ClubDiscover from "./ClubDiscover";
import Friends from "./Friends";
import AddFriend from "./AddFriend";
import Notifications from "./Notifications";
import FriendProfile from "./FriendProfile";
import DMs from "./components/chat/DMs";


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/user-home" element={<UserHome />} />
      <Route path="/clubs/new" element={<ClubCreate />} />
      <Route path="/clubs/:id" element={<ClubHome />} />
      <Route path="/clubs" element={<ClubDiscover />} />
      <Route path="/friends" element={<Friends />} />
      <Route path="/friends/:friendId" element={<FriendProfile />} />
      <Route path="/add-friend" element={<AddFriend />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/dms" element={<DMs />} />
    </Routes>
  );
}
