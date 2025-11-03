import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import NavLink from "@/Components/NavLink";
import { Link, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { Menu, Bell, MessageCircle, ChevronDown } from "lucide-react";
import axios from "axios";

export default function InstructorLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // ✅ Notification State
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    // ✅ Fetch Notifications
    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/notifications");
            setNotifications(
                Array.isArray(res.data.notifications)
                    ? res.data.notifications
                    : []
            );
        } catch (err) {
            setNotifications([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await axios.post(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (err) {
            console.log(err);
        }
    };

    // ✅ Unread Count
    const unreadCount = notifications.filter((n) => !n.read_at).length;

    return (
        <div className="h-screen flex">
            {/* Sidebar */}
            <aside className="bg-gray-50 border-r w-64 flex flex-col h-screen">
                {/* Logo */}
                <div className="flex items-center justify-start mb-6 p-4">
                    <Link href="/" className="flex items-center gap-2">
                        <img
                            src="/logo/psu.png"
                            alt="Logo"
                            className="h-15 w-12"
                        />
                        <h1 className="text-bluepsu text-2xl tracking-wide font-medium">
                            <span className="text-gold">PSU</span>Learn
                        </h1>
                    </Link>
                </div>

                {/* Nav links (scrollable area) */}
                <div className="flex-1 overflow-y-auto px-6">
                    <Link
                        href={route("instructor.dashboard")}
                        className="flex items-center gap-2 mb-6"
                    >
                        <h1 className="text-black text-lg font-medium">
                            Dashboard
                        </h1>
                    </Link>

                    <Link
                        href={route("test.list")}
                        className="flex items-center gap-2 mb-6"
                    >
                        <h1 className="text-black text-lg font-medium">
                            Classroom
                        </h1>
                    </Link>

                    <Link
                        href={route("tasks.index")}
                        className="flex items-center gap-2 mb-6"
                    >
                        <h1 className="text-profile text-lg font-medium">
                            Task
                        </h1>
                    </Link>
                    <Link
                        href={route("instructor.announcement")}
                        className="flex items-center gap-2 mb-6"
                    >
                        <h1 className="text-profile text-lg font-medium">
                            Announcement
                        </h1>
                    </Link>

                    <Link
                        href={route("instructor.student.progress")}
                        className="flex items-center gap-2"
                    >
                        <h1 className="text-profile text-lg font-medium">
                            Student Progress
                        </h1>
                    </Link>
                </div>

                {/* Sticky Profile + Logout (sticks to sidebar bottom) */}
                <div className="sticky bottom-0 bg-gray-50 border-t p-4">
                    <NavLink
                        href={route("instructor.profile")}
                        className="w-full px-3 py-2 rounded-md text-sm font-medium text-lg"
                    >
                        <h1 className="text-lg">Profile</h1>
                    </NavLink>
                    <Link
                        href={route("logout")}
                        method="post"
                        as="button"
                        className="w-full px-3 py-2 text-left rounded-md text-sm font-medium text-black hover:text-red-800 "
                    >
                        <h1 className="text-lg">Log Out</h1>
                    </Link>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between bg-white ">
                    <div className="flex items-center p-6">
                        {route().current("instructor.dashboard") && (
                            <h1 className="text-xl font-medium tracking-wide">
                                Dashboard
                            </h1>
                        )}

                        {route().current("test.list") && (
                            <h1 className="text-xl font-medium">My Class</h1>
                        )}
                        {route().current("instructor.profile") && (
                            <h1 className="text-xl font-medium">Profile</h1>
                        )}
                        {route().current("test.classroom") && (
                            <h1 className="text-xl font-medium">Classroom</h1>
                        )}
                        {route().current("tasks.index") && (
                            <h1 className="text-xl font-medium">Manage Task</h1>
                        )}
                        {route().current("instructor.student.progress") && (
                            <h1 className="text-xl font-medium">
                                Student Progress Overview
                            </h1>
                        )}
                    </div>
                    <header className="bg-white h-16 px-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                className="md:hidden"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <Menu className="w-6 h-6 text-gray-600" />
                            </button>

                            {header && (
                                <h2 className="text-lg font-semibold text-gray-700">
                                    {header}
                                </h2>
                            )}
                        </div>
                        <div className="relative flex flex-row items-center gap-4">
                            {/* Notification Icon */}
                            <button
                                className="relative p-2 rounded-full hover:bg-gray-100"
                                onClick={() => setNotifOpen(true)}
                            >
                                <Bell className="w-5 h-5 text-gray-700" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                )}
                            </button>

                            {/* Message Icon */}
                            <button className="relative p-2 rounded-full hover:bg-gray-100">
                                <MessageCircle className="w-5 h-5 text-gray-700" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                            </button>

                            {/* Profile + Dropdown */}
                            <div className="relative flex flex-row items-center">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100">
                                            <img
                                                src={`/${user.profile_picture}`}
                                                alt="Profile"
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                            <ChevronDown className="w-4 h-4 text-gray-600" />
                                        </button>
                                    </Dropdown.Trigger>
                                </Dropdown>
                            </div>
                        </div>
                    </header>
                </div>

                {/* Scrollable children */}
                <main className="flex-1 overflow-y-auto p-2 bg-white">
                    {children}
                </main>

                {/* ✅ Notification Drawer */}
                {notifOpen && (
                    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l shadow-xl p-6 overflow-y-auto z-50">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">
                                Notifications
                            </h2>
                            <button
                                className="text-gray-500 hover:text-black"
                                onClick={() => setNotifOpen(false)}
                            >
                                ✕
                            </button>
                        </div>

                        {loading && <p className="text-gray-500">Loading...</p>}

                        {!loading && notifications.length === 0 && (
                            <p className="text-gray-500">No notifications.</p>
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
                                    <p className="font-medium">
                                        {n.data.message}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {n.created_at}
                                    </p>

                                    {!n.read_at && (
                                        <button
                                            onClick={() => markAsRead(n.id)}
                                            className="text-purple-600 text-sm font-semibold mt-2"
                                        >
                                            Mark as read
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
