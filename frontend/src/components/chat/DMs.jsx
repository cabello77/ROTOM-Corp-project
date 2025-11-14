import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DMChat from './DMChat';

export default function DMs() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  // Get user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Load conversations
  useEffect(() => {
    if (!user) return;
    
    const loadConversations = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiBase}/api/dms/conversations`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!res.ok) throw new Error('Failed to load conversations');
        const data = await res.json();
        setConversations(data || []);
        
        // Check if there's a conversationId in URL params
        const conversationId = searchParams.get('conversation');
        if (conversationId) {
          const conv = data.find(c => c.id === conversationId);
          if (conv) setSelectedConversation(conv);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [user, apiBase, searchParams]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-amber-50/30">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Messages</h1>
              <p className="text-sm text-gray-600 mt-1">
                Chat with your friends
              </p>
            </div>
            <button
              onClick={() => navigate('/friends')}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-sm font-medium"
            >
              Start New Chat
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Conversations</h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">Loading...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 mb-3">No conversations yet</p>
                  <button
                    onClick={() => navigate('/friends')}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                  >
                    Message a friend →
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conv) => {
                    // Get the friend (the other user in the conversation)
                    const friend = conv.user1?.id === user.id ? conv.user2 : conv.user1;
                    
                    return (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-amber-50 transition text-left ${
                          selectedConversation?.id === conv.id ? 'bg-amber-100' : ''
                        }`}
                      >
                        <img
                          src={
                            friend?.profile?.profilePicture
                              ? (friend.profile.profilePicture.startsWith('http')
                                  ? friend.profile.profilePicture
                                  : `${apiBase}${friend.profile.profilePicture}`)
                              : 'https://via.placeholder.com/40'
                          }
                          alt={friend?.name || 'Friend'}
                          className="w-10 h-10 rounded-full object-cover border-2 border-amber-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">
                            {friend?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {conv.lastMessage?.content || 'Start chatting...'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <DMChat
                conversationId={selectedConversation.id}
                user={user}
                apiBase={apiBase}
                friend={selectedConversation.user1?.id === user.id ? selectedConversation.user2 : selectedConversation.user1}
              />
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center">
                <div className="max-w-sm mx-auto">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-sm text-gray-600">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}