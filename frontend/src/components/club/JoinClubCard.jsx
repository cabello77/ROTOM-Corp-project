export default function JoinClubCard({ onJoin }) {
  return (
    <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-5 space-y-3">
      <h3 className="text-base font-semibold text-gray-800 mb-2" style={{}}>
        Join This Book Club
      </h3>
      <p className="text-sm text-gray-600 mb-4" style={{}}>
        Join to track your reading progress and see other members' progress.
      </p>
      <button
        type="button"
        onClick={onJoin}
        className="w-full text-gray-800 px-4 py-2 rounded border border-[#ddcdb7] bg-[#efe6d7] hover:bg-[#e3d5c2] transition-colors"
        style={{}}
      >
        Join Book Club
      </button>
    </div>
  );
}

