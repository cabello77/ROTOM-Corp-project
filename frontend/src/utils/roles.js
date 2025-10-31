export function canCreateThread({ isHost = false } = {}) {
  // MVP: only host can create threads
  return Boolean(isHost);
}

export function canReply({ isLocked = false, isMember = false } = {}) {
  // Members (or host) can reply if not locked
  return !isLocked && Boolean(isMember);
}

export function canUseModeratorTools({ isHost = false } = {}) {
  // UI placeholder: show disabled for non-hosts; hidden for hosts until backend exists
  return false;
}

