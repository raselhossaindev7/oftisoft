export const STATUS_COLORS: Record<string, string> = {
    "In Progress": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "Completed": "bg-green-500/10 text-green-500 border-green-500/20",
    "Review": "bg-purple-500/10 text-purple-500 border-purple-500/20",
    "Delayed": "bg-red-500/10 text-red-500 border-red-500/20",
    "Planning": "bg-orange-500/10 text-orange-500 border-orange-500/20",
    "On Hold": "bg-gray-500/10 text-gray-500 border-gray-500/20",
    "Cancelled": "bg-red-500/10 text-red-500 border-red-500/20",
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
    "Paid": "text-green-500 bg-green-500/10 border-green-500/20",
    "Unpaid": "text-red-500 bg-red-500/10 border-red-500/20",
    "Pending": "text-orange-500 bg-orange-500/10 border-orange-500/20",
    "Partial": "text-blue-500 bg-blue-500/10 border-blue-500/20",
};

export const STATUS_OPTIONS = ["Planning", "In Progress", "Review", "Completed", "Delayed", "On Hold", "Cancelled"];

export const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
