import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export default function useClubData(id, user) {
  const [club, setClub] = useState(null);
  const [currentBook, setCurrentBook] = useState(null);
  const [readingGoal, setReadingGoal] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");
  const [members, setMembers] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [currentUserMemberData, setCurrentUserMemberData] = useState(null);
  const [userProgress, setUserProgress] = useState(0);

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/clubs/${id}`);
        const clubData = res.data;
        setClub(clubData);
        if (clubData.currentBookData) setCurrentBook(clubData.currentBookData);
        if (clubData.readingGoal) setReadingGoal(clubData.readingGoal);
        if (clubData.goalDeadline) {
          const deadline = new Date(clubData.goalDeadline).toISOString().split('T')[0];
          setGoalDeadline(deadline);
        }
      } catch (error) {
        console.error("Error loading club:", error);
      }
    };
    if (id) fetchClub();
  }, [id]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/clubs/${id}/members`);
        const membersData = res.data;
        setMembers(membersData);
        if (user && club) {
          const userMember = membersData.find(m => m.userId === user.id);
          const isCreator = user.id === club.creatorId;
          if (userMember) {
            setIsMember(true);
            setCurrentUserMemberData(userMember);
            setUserProgress(userMember.progress);
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

