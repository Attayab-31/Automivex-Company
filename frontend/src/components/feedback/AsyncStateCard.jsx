import { memo } from "react";

export const AsyncStateCard = memo(function AsyncStateCard({
  state = "idle",
  title,
  message,
}) {
  const resolvedTitle =
    title ||
    (state === "loading"
      ? "Loading"
      : state === "error"
        ? "Something went wrong"
        : "Status");

  return (
    <div className={`status-card status-card-${state}`} role={state === "error" ? "alert" : "status"}>
      <strong>{resolvedTitle}</strong>
      <p className="muted-note">{message}</p>
    </div>
  );
});
