import { useEffect, useState } from "react";

function ProfileEdit({ isOpen, onClose, user, onSave, isSaving }) {
  const [form, setForm] = useState({
    fullName: user.profile?.fullName || "",
    email: user.email || "",
    bio: user.profile?.bio || "",
    username: user.profile?.username || user.username || "", // ⭐ GOOD
  });


  const [avatarPreview, setAvatarPreview] = useState(
    user.profile?.profilePicture || ""
  );
  const [avatarFile, setAvatarFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // ⭐ Reset form when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setForm({
      fullName: user.profile?.fullName || "",
      email: user.email || "",
      bio: user.profile?.bio || "",
      username: user.username || "",
    });


    setAvatarPreview(user.profile?.profilePicture || "");
    setAvatarFile(null);
  }, [isOpen, user]);

  if (!isOpen) return null;

  // --------------------------
  // Handlers
  // --------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onloadend = () => {
      setIsUploading(false);
      setAvatarPreview(reader.result);
      setAvatarFile(file);
    };

    reader.readAsDataURL(file);
  };

const handleSave = async () => {
  const payload = {
    fullName: form.fullName,
    email: form.email,
    profile: {
      bio: form.bio,
      username: form.username,
    },
  };

  console.log("🔥 PAYLOAD FROM MODAL (before onSave):", payload);

  await onSave(payload);

  if (avatarFile) {
    await uploadAvatar(user.id, avatarFile);
  }

  onClose();
};

  const handleCancel = () => {
    setForm({
      fullName: user.profile?.fullName || "",
      email: user.email || "",
      bio: user.profile?.bio || "",
      username: user.username || "",
    });

    setAvatarPreview(user.profile?.profilePicture || "");
    setAvatarFile(null);

    onClose();
  };

  const avatarInitial =
    form.username?.charAt(0)?.toUpperCase() ||
    user.username?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div
          className="text-white p-6 rounded-t-lg"
          style={{ backgroundColor: "#774C30" }}
        >
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="text-white hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold">Edit Profile</h2>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-8">

            {/* AVATAR */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden mb-4 flex items-center justify-center">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-4xl text-gray-600">{avatarInitial}</span>
                )}
              </div>

              <label className="block">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <div className="w-full bg-gray-200 border border-gray-400 rounded px-4 py-2 text-center cursor-pointer hover:bg-gray-300">
                  {isUploading ? "Uploading..." : "Upload Profile Pic"}
                </div>
              </label>
            </div>

            {/* FORM FIELDS */}
            <div className="flex-grow space-y-4">

              {/* USERNAME */}
              <div>
                <label className="block text-sm mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full border rounded p-3"
                />
              </div>

              {/* FULL NAME */}
              <div>
                <label className="block text-sm mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  className="w-full border rounded p-3"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-sm mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border rounded p-3"
                />
              </div>

              {/* BIO */}
              <div>
                <label className="block text-sm mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  className="w-full border rounded p-3 resize-none"
                  rows="3"
                />
              </div>

            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-gray-50 px-6 py-4 flex justify-center space-x-3 rounded-b-lg">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border rounded hover:bg-gray-200"
            disabled={isSaving}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 border rounded font-medium"
            style={{ backgroundColor: "#EFE6D7" }}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Done"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default ProfileEdit;
