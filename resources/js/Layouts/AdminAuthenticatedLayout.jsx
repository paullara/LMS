import ApplicationLogo from "@/Components/ApplicationLogo";
import NavLink from "@/Components/NavLink";
import Dropdown from "@/Components/Dropdown";
import { Link, usePage, router } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import { Menu, ChevronDown, Bell, MessageCircle, Search } from "lucide-react";
import axios from "axios";

export default function AdminAuthenticatedLayout({ header, children }) {
    // const user = usePage().props.auth.user;
    const { auth } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const resultsRef = useRef(null);

    console.log("Authenticated User:", auth?.user?.id);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                resultsRef.current &&
                !resultsRef.current.contains(event.target)
            ) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Live search function
    const handleSearch = async (e) => {
        const value = e.target.value;
        setQuery(value);

        if (value.trim().length < 2) {
            setResults([]);
            return;
        }

        try {
            const res = await axios.get("/search-instructors", {
                params: { q: value },
            });
            setResults(res.data);
            setShowResults(true);
        } catch (err) {
            console.error("Search error:", err);
        }
    };

    // Handle click on instructor
    const handleSelectInstructor = (instructor) => {
        setQuery("");
        setShowResults(false);
        router.get(route("search.result", instructor.id));
    };

    return (
        <div className="bg-white min-h-screen">
            {/* Sidebar (fixed) */}
            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 w-sidebar bg-gray-50 border-r transition-transform duration-300 transform z-30 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                } sm:translate-x-0 sm:flex flex-col justify-between`}
            >
                {/* Top Logo */}
                <div className="h-16 flex items-center justify-start gap-2 p-4">
                    <Link
                        href="/student/dashboard"
                        className="flex items-center gap-2"
                    >
                        <img src="/logo/psu.png" alt="" className="h-15 w-12" />

                        <h1 className="text-bluepsu text-2xl tracking-wide font-medium">
                            <span className="text-gold">PSU</span>Learn
                        </h1>
                    </Link>
                </div>

                {/* Main nav links (fills available space and scrolls if needed) */}
                <nav className="flex-1 overflow-y-auto flex flex-col gap-7 items-start p-9">
                    <Link
                        href={route("admin.dashboard")}
                        className="flex items-center gap-2"
                    >
                        <h1 className="text-black text-lg">Dashboard</h1>
                    </Link>
                    <Link
                        href={route("admin.instructor")}
                        className="flex items-center gap-2"
                    >
                        <h1 className="text-black text-lg">Instructor</h1>
                    </Link>

                    <Link
                        href={route("students.account")}
                        className="flex items-center gap-2"
                    >
                        <h1 className="text-black text-lg">Students</h1>
                    </Link>
                </nav>

                {/* Profile + Logout stuck to the bottom */}
                <div className="mt-auto p-4 border-t bg-gray-50 flex flex-col gap-2">
                    <Link
                        href={route("admin.profile")}
                        className="w-full px-3 py-2 text-left rounded-md text-sm font-medium text-black hover:bg-gray-100 flex items-center gap-2"
                    >
                        <h1 className="text-black text-lg">Profile</h1>
                    </Link>

                    <Link
                        href={route("logout")}
                        method="post"
                        as="button"
                        className="w-full px-3 py-2 text-left rounded-md text-sm font-medium text-black hover:bg-red-800 hover:bg-gray-100"
                    >
                        <h1 className="text-lg">Log Out</h1>
                    </Link>
                </div>
            </div>

            {/* Main content area (header fixed, main scrolls) */}
            <div className="sm:ml-48">
                <header className="fixed top-0 right-0 left-0 sm:left-48 h-16 bg-white px-4 sm:px-6 lg:px-8 gap-4 shadow-sm flex items-center justify-between z-20">
                    <div className="flex items-center gap-3">
                        <button
                            className="sm:hidden p-2 rounded-md hover:bg-gray-100"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <Menu className="w-6 h-6 text-gray-700" />
                        </button>

                        <div className="flex items-center ">
                            {route().current("student.dashboard") && (
                                <h1 className="text-xl font-medium tracking-wide">
                                    Dashboard
                                </h1>
                            )}
                            {route().current("student.groups") && (
                                <h1 className="text-xl font-medium tracking-wide">
                                    My Group
                                </h1>
                            )}
                            {route().current("student.groups.show") && (
                                <h1 className="text-xl font-medium tracking-wide">
                                    My Group
                                </h1>
                            )}
                            {route().current("classroom") && (
                                <h1 className="text-xl font-medium tracking-wide">
                                    My Class
                                </h1>
                            )}
                            {route().current("student.test.profile") && (
                                <h1 className="text-xl font-medium tracking-wide">
                                    Profile
                                </h1>
                            )}
                        </div>
                    </div>

                    <div className="flex items-end justify-end gap-3 w-1/2">
                        <div className="relative flex flex-row items-center gap-4">
                            <button className="relative p-2 rounded-full hover:bg-gray-100">
                                <Bell className="w-5 h-5 text-gray-700" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>

                            <Link href={route("student.groups")}>
                                <button className="relative p-2 rounded-full hover:bg-gray-100">
                                    <MessageCircle className="w-5 h-5 text-gray-700" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                                </button>
                            </Link>

                            <div className="relative flex flex-row items-center">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md">
                                            {auth?.user?.profile_picture ? (
                                                <img
                                                    src={`/${auth.user.profile_picture}`}
                                                    alt="Profile"
                                                    className="w-8 h-8 rounded-full"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-bluepsu flex items-center justify-center text-white font-semibold text-lg">
                                                    {auth?.user?.firstname
                                                        ?.charAt(0)
                                                        .toUpperCase() ?? "U"}
                                                </div>
                                            )}
                                        </button>
                                    </Dropdown.Trigger>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main scrolling area (respect header height) */}
                <div className="pt-10">
                    <main className="bg-white p-8 h-[calc(100vh-4rem)] overflow-auto ">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
