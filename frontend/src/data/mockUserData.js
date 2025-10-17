export const mockUserData = {
  id: "spooky-id",
  name: "spooky",
  email: "spooky@gmail.com",
  avatar: null,
  isDemo: true,
  bio: "Well, Hello There! I'm Spooky, a passionate book lover and avid reader. I enjoy exploring various genres, from thrilling mysteries to heartwarming romances. When I'm not lost in a book, you can find me sharing my thoughts on the latest reads and connecting with fellow book enthusiasts. Let's embark on literary adventures together!",
  joinDate: "2025-10-13",
  bookClubs: [
    { id: 1, name: "Fantasy Lovers", active: true },
    { id: 2, name: "Mystery Readers", active: false },
    { id: 3, name: "Sci-Fi Enthusiasts", active: false }
  ],
  friends: 8,
  friendsList: ["Jess", "Kai", "Morgan", "Tala", "River", "Sage", "Devi", "Lee"],
  readingProgress: [
    { book: "The Seven Husbands of Evelyn Hugo", progress: 75 },
    { book: "Project Hail Mary", progress: 45 },
    { book: "The Midnight Library", progress: 90 }
  ],
  recentActivity: [
    {
      id: 1,
      type: "post",
      title: "Just finished 'The Seven Husbands of Evelyn Hugo'",
      timestamp: "2025-01-10T10:30:00Z"
    },
    {
      id: 2,
      type: "comment",
      title: "Commented on 'Best Fantasy Books of 2024'",
      timestamp: "2025-01-09T15:45:00Z"
    },
    {
      id: 3,
      type: "club",
      title: "Joined 'Mystery Lovers' book club",
      timestamp: "2025-01-08T09:20:00Z"
    }
  ]
};

export default mockUserData;
