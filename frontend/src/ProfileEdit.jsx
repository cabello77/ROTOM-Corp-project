import { useState, useEffect } from "react";

function ProfileEdit({ isOpen, onClose, user, onSave }) {
  const [editForm, setEditForm] = useState({
    name: user.name,
    email: user.email,
    bio: user.bio || "",
    avatar: user.avatar || ""
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEditForm({
        name: user.name,
        email: user.email,
        bio: user.bio || "",
        avatar: user.avatar || ""
      });
    }
  }, [isOpen, user]);

  const handleChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    onSave({ ...user, ...editForm });
    onClose();
  };

  const handleCancel = () => {
    setEditForm({
      name: user.name,
      email: user.email,
      bio: user.bio || "",
      avatar: user.avatar || ""
    });
    onClose();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setIsUploading(false);
      setEditForm((prev) => ({
        ...prev,
        avatar: typeof reader.result === "string" ? reader.result : prev.avatar
      }));
    };
    reader.onerror = () => {
      setIsUploading(false);
      console.error("Failed to read selected image");
    };
    reader.readAsDataURL(file);
  };

  const avatarPreview = editForm.avatar || user.avatar || "";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header - Matching theme colors */}
        <div className="text-white p-6 rounded-t-lg" style={{ backgroundColor: "#774C30" }}>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCancel}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold" style={{ fontFamily: "Times New Roman, serif" }}>
              Edit Profile
            </h2>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Left: Profile Picture Section */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center mb-4">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-4xl text-gray-600" style={{ fontFamily: "Times New Roman, serif" }}>
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="w-full bg-gray-200 border border-gray-400 rounded px-4 py-2 text-center cursor-pointer hover:bg-gray-300 transition-colors" style={{ fontFamily: "Times New Roman, serif" }}>
                  {isUploading ? "Uploading..." : "Upload Profile Pic"}
                </div>
              </label>
            </div>

            {/* Right: User Bio Section */}
            <div className="flex-grow">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "Times New Roman, serif" }}>
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  style={{ fontFamily: "Times New Roman, serif" }}
                  placeholder="Tell the community a little about yourself"
                />
              </div>

              {/* Additional editable fields */}
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "Times New Roman, serif" }}>
                    Display Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    style={{ fontFamily: "Times New Roman, serif" }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "Times New Roman, serif" }}>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    style={{ fontFamily: "Times New Roman, serif" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with DONE button */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg">
          <div className="flex justify-center">
            <button
              onClick={handleSave}
              className="text-gray-800 px-8 py-3 rounded border border-gray-400 hover:opacity-80 transition-opacity font-medium"
              style={{ fontFamily: "Times New Roman, serif", backgroundColor: "#D9D9D9" }}
            >
              DONE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileEdit;
