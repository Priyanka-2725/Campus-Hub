import { Bell } from "lucide-react";

export default function NotificationBell({ count = 0 }) {
  return (
    <div className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-card">
      <Bell size={18} className="text-pine" />
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-clay px-1.5 text-xs font-semibold text-white">
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </div>
  );
}
