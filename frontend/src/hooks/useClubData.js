import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export default function useClubData(id, user) {
  const [club, setClub] = useState(null);
  const [currentBook, setCurrentBook] = useState(null);
  const [readingGoal, setReadingGoal] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");
  const [readingGoalPageStart, setReadingGoalPageStart] = useState(null);
  const [readingGoalPageEnd, setReadingGoalPageEnd] = useState(null);

  const [members, setMembers] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [currentUserMemberData, setCurrentUserMemberData] = useState(null);

  // ⭐ THIS is the fixed progress field
  const [userProgress, setUserProgress] = useState(0);

  /* ---------------------------------------------------------
     FETCH CLUB
  --------------------------------------------------------- */
  useEffect(() => {
    const fetchClub = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/clubs/${id}`);
        const clubData = res.data;

        setClub(clubData);

        if (clubData.currentBookData) {
          setCurrentBook(clubData.currentBookData);
        }

        if (clubData.readingGoal) {
          setReadingGoal(clubData.readingGoal);
        }

        if (clubData.goalDeadline) {
          const deadline = new Date(clubData.goalDeadline)
            .toISOString()
            .split("T")[0];
          setGoalDeadline(deadline);
        }

        // ⭐ Load assigned page range
        setReadingGoalPageStart(clubData.readingGoalPageStart ?? null);
        setReadingGoalPageEnd(clubData.readingGoalPageEnd ?? null);

      } catch (error) {
        console.error("Error loading club:", error);
      }
    };

    if (id) fetchClub();
  }, [id]);

  /* ---------------------------------------------------------
     FETCH MEMBERS + LOAD USER PROGRESS
  --------------------------------------------------------- */
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/clubs/${id}/members`);
        const membersData = res.data;

        setMembers(membersData);

        if (user && club) {
          const userMember = membersData.find((m) => m.userId === user.id);
          const isCreator = user.id === club.creatorId;

          if (userMember) {
            setIsMember(true);
            setCurrentUserMemberData(userMember);

            // ⭐ FIX: use pageNumber instead of progress
            setUserProgress(userMember.pageNumber ?? 0);

          } else if (isCreator) {
            setIsMember(true);
            setUserProgress(0);
          } else {
            setIsMember(false);
          }
        }
      } catch (error) {
        console.error("Error loading members:", error);
      }
    };

    if (id) fetchMembers();
  }, [id, user, club]);

  return {
    club,
    setClub,
    currentBook,
    setCurrentBook,
    readingGoal,
    setReadingGoal,
    goalDeadline,
    setGoalDeadline,

    readingGoalPageStart,
    setReadingGoalPageStart,
    readingGoalPageEnd,
    setReadingGoalPageEnd,

    members,
    setMembers,
    isMember,
    setIsMember,
    currentUserMemberData,
    setCurrentUserMemberData,

    userProgress,
    setUserProgress,
  };
}
