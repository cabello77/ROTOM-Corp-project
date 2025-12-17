import ThreadList from "../threads/ThreadList";

export default function DiscussionsPanel({ clubId, currentUser, member }) {
  return (
    <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-6 space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">
        Discussions
      </h3>
      <p className="text-sm text-gray-600">
        Join active discussions or start a new one.
      </p>

      {currentUser ? (
        <ThreadList
          clubId={clubId}
          currentUser={currentUser}
          role={member?.role}
        />
      ) : (
        <div className="text-center py-2 border border-[#e6dac8] bg-[#efe6d7] rounded">
          <p className="text-sm text-gray-600">Log in to view discussions.</p>
        </div>
      )}
    </div>
  );
}
