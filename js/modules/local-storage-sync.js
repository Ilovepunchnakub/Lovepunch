const STORAGE_PREFIX = "soft-love-user-state:";
const cache = new Map();

function getStorageKey(userId){
  return `${STORAGE_PREFIX}${userId}`;
}

function readState(userId){
  if(!userId) return null;
  if(cache.has(userId)) return cache.get(userId);

  try{
    const raw = localStorage.getItem(getStorageKey(userId));
    if(!raw){
      cache.set(userId, null);
      return null;
    }
    const parsed = JSON.parse(raw);
    const normalized = parsed && typeof parsed === "object" ? parsed : null;
    cache.set(userId, normalized);
    return normalized;
  }catch{
    cache.set(userId, null);
    return null;
  }
}

function writeState(userId, state){
  if(!userId || !state || typeof state !== "object") return;
  cache.set(userId, state);
  try{
    localStorage.setItem(getStorageKey(userId), JSON.stringify(state));
  }catch(err){
    console.warn("Local save failed:", err);
  }
}

export function primeUserState(){
  // no-op: kept for API compatibility
}

export async function loadUserState(userId){
  return readState(userId);
}

export function saveUserState(userId, patch){
  if(!userId || !patch || typeof patch !== "object") return;
  const current = readState(userId) || { user_id: userId };
  writeState(userId, {
    ...current,
    ...patch,
    updated_at: new Date().toISOString()
  });
}
