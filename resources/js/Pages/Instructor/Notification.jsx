import { useEffect, useState } from "react";
import InstructorLayout from "@/Layouts/InstructorLayout";
import axios from "axios";
import { BellIcon } from "@heroicons/react/24/outline";

export default function Notification() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/notifications");

            console.log("Notifications response:", res.data);

            // ✅ Your backend response is { notifications: [...] }
            setNotifications(
                Array.isArray(res.data.notifications)
                    ? res.data.notifications
                    : []
            );
        } catch (error) {
            console.error(error);
            setNotifications([]);
        }
        setLoading(false);
    };

    const markAsRead = async (id) => {
        try {
            await axios.post(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <InstructorLayout>
            <div className="w-full max-w-2xl mx-auto p-6">
                <div className="flex items-center gap-3 mb-6">
                    <BellIcon className="h-8 w-8 text-purple-600" />
                    <h1 className="text-3xl font-bold">Notifications</h1>
                </div>

                {loading && (
                    <p className="text-gray-600 text-center">
                        Loading notifications...
                    </p>
                )}

                {!loading && notifications.length === 0 && (
                    <p className="text-gray-500 text-center">
                        No notifications.
                    </p>
                )}

                <div className="space-y-4">
                    {notifications.map((n) => (
                        <div
                            key={n.id}
                            className={`p-4 rounded-xl border ${
                                n.read_at
                                    ? "bg-gray-100 border-gray-200"
                                    : "bg-purple-50 border-purple-300"
                            }`}
                        >
                            <div className="flex justify-between">
                                <div>
                                    <p className="font-medium">
                                        {n.data.message}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {n.created_at}
                                    </p>
                                </div>

                                {!n.read_at && (
                                    <button
                                        onClick={() => markAsRead(n.id)}
                                        className="text-purple-600 text-sm font-semibold"
                                    >
                                        Mark as read
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </InstructorLayout>
    );
}
