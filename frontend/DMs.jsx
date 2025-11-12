import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function DMs() {
  const navigate = useNavigate();

  return (
    <div className="border rounded-2xl bg-amber-50 shadow-sm p-4">
      <h2 className="text-lg font-semibold text-gray-800">Direct Messages</h2>
      <p className="text-sm text-gray-600 mt-1">
        No messages yet. Start chatting with a friend!
      </p>

      <div className="flex justify-center mt-3">
        <button
          onClick={() => navigate('/dms')}
          className="bg-amber-100 hover:bg-amber-200 text-gray-800 font-medium py-1.5 px-4 rounded-md transition"
        >
          View Messages
        </button>
      </div>
    </div>
  );
}
