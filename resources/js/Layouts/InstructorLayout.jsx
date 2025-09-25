import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import NavLink from "@/Components/NavLink";
import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import { Menu } from "lucide-react";

export default function InstructorLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
                        <h1 className="text-bluepsu text-2xl tracking-wide font-semibold">
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
                        href={route("instructor.profile")}
                        className="flex items-center gap-2"
                    >
                        <h1 className="text-profile text-lg font-medium">
                            Profile
                        </h1>
                    </Link>
                </div>

                {/* Sticky Profile + Logout (sticks to sidebar bottom) */}
                <div className="sticky bottom-0 bg-white border-t p-4">
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
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between bg-white border-b">
                    <div className="flex items-center p-4">
                        {route().current("instructor.dashboard") && (
                            <h1 className="text-4xl font-semibold">
                                Dashboard
                            </h1>
                        )}

                        {route().current("test.list") && (
                            <h1 className="text-4xl font-semibold">My Class</h1>
                        )}
                        {route().current("instructor.profile") && (
                            <h1 className="text-4xl font-semibold">Profile</h1>
                        )}
                        {route().current("test.classroom") && (
                            <h1 className="text-4xl font-semibold">
                                Classroom
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
                        <div className="relative">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md">
                                        <img
                                            src={`/${user.profile_picture}`}
                                            alt="Profile"
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                        {/* <span>{user.firstname}</span> */}
                                    </button>
                                </Dropdown.Trigger>
                            </Dropdown>
                        </div>
                    </header>
                </div>

                {/* Scrollable children */}
                <main className="flex-1 overflow-y-auto p-4 bg-white">
                    {children}
                </main>
            </div>
        </div>
    );
}
