import { Link } from "react-router-dom";
import UserDropdown from "../UserDropdown";

export default function ClubHeader({ onOpenEditProfile }) {
  return (
    <header className="text-white shadow" style={{ backgroundColor: "#774C30" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <Link to="/user-home" className="text-6xl md:text-8xl italic cursor-pointer hover:opacity-80 transition-opacity" style={{ fontFamily: "Dancing Script, cursive", textDecoration: "none", color: "white" }}>
            Plotline
          </Link>
          <div className="flex space-x-3">
            <UserDropdown onEditProfile={onOpenEditProfile} />
          </div>
        </div>
      </div>
    </header>
  );
}

