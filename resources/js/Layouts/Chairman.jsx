import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import NavLink from "@/Components/NavLink";
import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import { Menu } from "lucide-react";

export default function Chairman({ header, children }) {
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
                        <h1 className="text-bluepsu text-2xl tracking-wide font-medium">
                            <span className="text-gold">PSU</span>Learn
                        </h1>
                    </Link>
                </div>

                {/* Nav links (scrollable area) */}
                <div className="flex-1 overflow-y-auto px-6">
                    {/* <Link
                        href={route("chairman.dashboard")}
                        className="flex items-center gap-2 mb-6"
                    >
                        <h1 className="text-black text-lg font-medium">
                            Dashboard
                        </h1>
                    </Link> */}

                    <Link
                        href={route("chairman.created.classes")}
                        className="flex items-center gap-2"
                    >
                        <h1 className="text-profile text-lg font-medium">
                            Monitor Classes
                        </h1>
                    </Link>
                    <Link
                        href={route("chairman.create.classes")}
                        className="flex items-center gap-2"
                    >
                        <h1 className="text-profile text-lg font-medium mt-6">
                            Mananage Schedule
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
                        {route().current("chairman.created.classes") && (
                            <h1 className="text-xl font-medium tracking-wide">
                                Classroom Monitoring
                            </h1>
                        )}
                        {route().current("chairman.create.classes") && (
                            <h1 className="text-xl font-medium tracking-wide">
                                Create & Assign Schedule
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
                                        {user.profile_picture ? (
                                            <img
                                                src={`/${user.profile_picture}`}
                                                alt="Profile"
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-bluepsu flex items-center justify-center text-white font-semibold text-lg">
                                                {user.firstname
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                        )}
                                    </button>
                                </Dropdown.Trigger>
                            </Dropdown>
                        </div>
                    </header>
                </div>

                {/* Scrollable children */}
                <main className="flex-1 overflow-y-auto p-2 bg-white">
                    {children}
                </main>
            </div>
        </div>
    );
}
