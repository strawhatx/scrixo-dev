/**
 * Rate limiting utility for PDF operations
 * Uses localStorage for session-based rate limiting
 */

const RATE_LIMIT_KEYS = {
  MERGE: "scrixo_rate_limit_merge",
  SPLIT: "scrixo_rate_limit_split",
  ROTATE: "scrixo_rate_limit_rotate",
  REARRANGE: "scrixo_rate_limit_rearrange",
} as const;

const RATE_LIMITS = {
  MERGE_COOLDOWN_MS: 60 * 1000, // 1 minute between merges
  MAX_OPERATIONS_PER_SESSION: 50, // Max operations per session (reset on page reload)
} as const;

interface RateLimitResult {
  allowed: boolean;
  remainingTime?: number; // milliseconds until next operation allowed
  message?: string;
}

function getSessionCounts(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const data = localStorage.getItem("scrixo_session_counts");
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function incrementSessionCount(operation: string): void {
  if (typeof window === "undefined") return;
  try {
    const counts = getSessionCounts();
    counts[operation] = (counts[operation] || 0) + 1;
    localStorage.setItem("scrixo_session_counts", JSON.stringify(counts));
  } catch {
    // Ignore localStorage errors
  }
}

function checkTimeBasedCooldown(operation: string, cooldownMs: number): RateLimitResult {
  if (typeof window === "undefined") return { allowed: true };
  
  try {
    const key = RATE_LIMIT_KEYS[operation as keyof typeof RATE_LIMIT_KEYS] || `scrixo_rate_limit_${operation}`;
    const lastOperation = localStorage.getItem(key);
    
    if (!lastOperation) {
      return { allowed: true };
    }
    
    const lastTime = parseInt(lastOperation, 10);
    const now = Date.now();
    const elapsed = now - lastTime;
    
    if (elapsed < cooldownMs) {
      const remainingTime = cooldownMs - elapsed;
      return {
        allowed: false,
        remainingTime,
        message: `Please wait ${Math.ceil(remainingTime / 1000)} seconds before ${operation}ing again.`,
      };
    }
    
    return { allowed: true };
  } catch {
    return { allowed: true }; // Fail open if localStorage fails
  }
}

function recordOperation(operation: string): void {
  if (typeof window === "undefined") return;
  
  try {
    const key = RATE_LIMIT_KEYS[operation as keyof typeof RATE_LIMIT_KEYS] || `scrixo_rate_limit_${operation}`;
    localStorage.setItem(key, Date.now().toString());
    incrementSessionCount(operation);
  } catch {
    // Ignore localStorage errors
  }
}

export function checkRateLimit(operation: "merge" | "split" | "rotate" | "rearrange"): RateLimitResult {
  const upperOp = operation.toUpperCase() as keyof typeof RATE_LIMIT_KEYS;
  
  // Check session count
  const counts = getSessionCounts();
  const sessionCount = counts[operation] || 0;
  if (sessionCount >= RATE_LIMITS.MAX_OPERATIONS_PER_SESSION) {
    return {
      allowed: false,
      message: `Maximum ${RATE_LIMITS.MAX_OPERATIONS_PER_SESSION} ${operation} operations per session. Please refresh the page.`,
    };
  }
  
  // Check time-based cooldown (only for merge)
  if (operation === "merge") {
    const cooldownCheck = checkTimeBasedCooldown(upperOp, RATE_LIMITS.MERGE_COOLDOWN_MS);
    if (!cooldownCheck.allowed) {
      return cooldownCheck;
    }
  }
  
  return { allowed: true };
}

export function recordRateLimit(operation: "merge" | "split" | "rotate" | "rearrange"): void {
  const upperOp = operation.toUpperCase() as keyof typeof RATE_LIMIT_KEYS;
  recordOperation(upperOp);
}

