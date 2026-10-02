export const getStatusColor = (status) => {
  if (!status) return "bg-gray-100 text-gray-800";

  switch (status.toString().toLowerCase()) {
    // Success / Active states
    case "completed":
    case "active":
    case "paid":
    case "approved":
    case "success":
      return "bg-blue-600 text-white"; // Using the design system's green

    // Processing / In Progress states
    case "processing":
    case "shipped":
    case "in_progress":
      return "bg-[#0073b6] text-white"; // Using the design system's blue

    // Warning / Pending states
    case "pending":
    case "unverified":
    case "on_hold":
      return "bg-[#FDAC41] text-white"; // Using a warning yellow/orange

    // Danger / Failed states
    case "cancelled":
    case "banned":
    case "refunded":
    case "failed":
    case "rejected":
      return "bg-[#FF5B5C] text-white"; // Using the design system's red

    default:
      return "bg-gray-400 text-white";
  }
};
