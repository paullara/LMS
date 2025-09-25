import ApplicationLogo from "@/Components/ApplicationLogo";
import NavLink from "@/Components/NavLink";
import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import { Menu } from "lucide-react";

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex bg-gray-100 h-screen">
            {/* Sidebar */}
            <div
                className={`h-screen w-64 bg-white border-r transition-all duration-300 flex flex-col ${
                    sidebarOpen ? "block" : "hidden"
                } sm:flex`}
            >
                {/* Top Logo */}
                <div className="h-16 flex items-center justify-start gap-2 p-4">
                    <Link
                        href="/student/dashboard"
                        className="flex items-center gap-2"
                    >
                        <img src="/logo/psu.png" alt="" className="h-15 w-12" />

                        <h1 className="text-bluepsu text-2xl tracking-wide font-semibold">
                            <span className="text-gold">PSU</span>Learn
                        </h1>
                    </Link>
                </div>

                {/* Main nav links */}
                <div className="flex flex-col gap-2 flex-1 p-4">
                    <p className="text-gray-600 font-normal">Overview</p>

                    <NavLink
                        href={route("student.dashboard")}
                        active={route().current("student.dashboard")}
                        className="w-full block text-left font-semibold"
                    >
                        Dashboard
                    </NavLink>

                    <NavLink
                        href={route("classroom")}
                        active={route().current("classroom")}
                        className="w-full block text-left font-bold"
                    >
                        Class
                    </NavLink>

                    <NavLink
                        href={route("student.notifications")}
                        active={route().current("student.notifications")}
                        className="w-full block text-left font-bold"
                    >
                        Notifation
                    </NavLink>
                </div>

                {/* Sticky Profile + Logout */}
                <div className="p-4 border-t bg-white sticky bottom-0">
                    <NavLink
                        href={route("profile.edit")}
                        active={route().current("profile.edit")}
                        className="w-full px-3 py-2 rounded-md text-sm font-medium"
                    >
                        Profile
                    </NavLink>
                    <Link
                        href={route("logout")}
                        method="post"
                        as="button"
                        className="w-full px-3 py-2 text-left rounded-md text-sm font-medium text-black hover:text-red-800"
                    >
                        Log Out
                    </Link>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex-col overflow-y-auto">
                {/* Top Bar */}
                <header className="flex items-center h-16 bg-white px-4 sm:px-6 lg:px-8 gap-4">
                    {/* Sidebar Toggle */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="sm:hidden text-gray-600 hover:text-gray-800"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Search input */}
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                        />
                    </div>

                    {/* User Name */}
                    <div className="text-gray-800 font-medium whitespace-nowrap">
                        {user.firstname}
                    </div>
                </header>

                {/* Content scrolls independently if needed */}
                <div className="flex-1 overflow-y-auto">
                    <main className="p-4 sm:p-6 lg:p-8 bg-white">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
