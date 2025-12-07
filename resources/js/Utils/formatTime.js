export default function formatTime(time) {
    if (!time) return "";
    const [hour, minute] = time.split(":");
    const h = parseInt(hour);
    const suffix = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${minute} ${suffix}`;
}
