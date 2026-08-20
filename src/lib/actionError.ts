type ErrorLike = { message?: unknown; code?: unknown; details?: unknown; hint?: unknown };

const errorText = (cause: unknown) => {
  if (cause instanceof Error) return cause.message;
  if (cause && typeof cause === "object") {
    const value = cause as ErrorLike;
    return [value.message, value.details, value.hint].filter(item => typeof item === "string").join(" ");
  }
  return typeof cause === "string" ? cause : "";
};

export const actionableError = (cause: unknown, fallback: string) => {
  const raw = errorText(cause).trim();
  const text = raw.toLowerCase();
  if (/jwt|session|not authenticated|sign.?in|unauthorized/.test(text)) return "Your staff session has expired. Sign in again, then retry this action.";
  if (/permission|policy|row.level|forbidden|not allowed|access denied/.test(text)) return "Your account does not have permission for this action. Ask an administrator to verify your role.";
  if (/invalid transition|current status|status changed|already (paid|completed|shipped)|conflict/.test(text)) return "This record changed before the action completed. Refresh the data and check its current stage before retrying.";
  if (/failed to fetch|network|timeout|timed out|unreachable|connection/.test(text)) return "The server could not be reached. Check your connection, then retry without closing this record.";
  if (/function .* does not exist|schema cache|pgrst202|404/.test(text)) return "The required server workflow is not available yet. Apply the latest database migration, then refresh this page.";
  if (raw) return `${fallback} ${raw}`;
  return `${fallback} Refresh the data and try again.`;
};
