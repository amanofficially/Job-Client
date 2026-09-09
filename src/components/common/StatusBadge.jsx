import { STATUS_COLORS } from "@/utils/constants";

const StatusBadge = ({ status }) => {
  const colorClasses = STATUS_COLORS[status] || "bg-gray-100 text-gray-600";

  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${colorClasses}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
