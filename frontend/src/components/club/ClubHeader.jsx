import UserDropdown from "../UserDropdown";

export default function ClubHeader({ onOpenEditProfile }) {
  return (
    <header className="text-white shadow" style={{ backgroundColor: "#774C30" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="text-6xl md:text-8xl italic" style={{ fontFamily: "Kapakana, cursive" }}>
            Plotline
          </div>
          <div className="flex space-x-3">
            <UserDropdown onEditProfile={onOpenEditProfile} />
          </div>
        </div>
      </div>
    </header>
  );
}

