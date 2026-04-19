import { memo } from "react";

export const StatusCard = memo(function StatusCard({ children }) {
  return (
    <div className="status-card">
      <p className="muted-note">{children}</p>
    </div>
  );
});
