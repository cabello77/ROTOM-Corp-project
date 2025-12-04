import ThreadList from "../threads/ThreadList";

export default function DiscussionsPanel({ clubId, user, isMember, isHost }) {
  return (
    <div className="bg-white border border-[#e3d8c8] rounded-xl shadow-sm p-6 space-y-4">
      <h3 className="text-xl font-semibold text-gray-800" style={{}}>
        Discussions
      </h3>
      <p className="text-sm text-gray-600" style={{}}>
        Join active discussions or start a new one.
      </p>
      {user ? (
        <ThreadList
          clubId={clubId}
          currentUser={user}
          isHost={isHost}
          isMember={Boolean(isMember || isHost)}
        />
      ) : (
        <div className="text-center py-2 border border-[#e6dac8] bg-[#efe6d7] rounded" style={{}}>
          <p className="text-sm text-gray-600">Log in to view discussions.</p>
        </div>
      )}
    </div>
  );
}

