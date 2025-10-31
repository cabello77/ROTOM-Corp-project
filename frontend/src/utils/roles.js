export function canCreateThread({ isHost = false, isMember = false } = {}) {
  // Allow any club member (including host) to create threads
  return Boolean(isHost || isMember);
}

export function canReply({ isLocked = false, isMember = false } = {}) {
  // Members (or host) can reply if not locked
  return !isLocked && Boolean(isMember);
}

export function canUseModeratorTools({ isHost = false } = {}) {
  // UI placeholder: show disabled for non-hosts; hidden for hosts until backend exists
  return false;
}

