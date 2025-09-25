import { Link } from "@inertiajs/react";
import { useState, useEffect } from "react";
import axios from "axios";
import InstructorLayout from "@/Layouts/InstructorLayout";

export default function ClassListTest() {
    const [classList, setClassList] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let firstLoad = true;
        const fetchClasses = async () => {
            try {
                if (firstLoad) setLoading(true);
                const res = await axios.get("/instructor/classes/list");
                setCount(res.data.classList.length);
                setClassList(res.data.classList);
            } catch (error) {
                console.error("Error fetching Classes", error);
            } finally {
                if (firstLoad) {
                    setLoading(false);
                    firstLoad = false;
                }
            }
        };
        fetchClasses();
        const interval = setInterval(fetchClasses, 1000);
        return () => clearInterval(interval);
    }, []);

    const SkeletonCard = () => (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full border border-gray-200 animate-pulse">
            <div className="bg-gray-300 h-40 w-full"></div>
            <div className="p-5 space-y-3 flex flex-col flex-grow">
                <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="mt-auto space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
            </div>
        </div>
    );

    return (
        <InstructorLayout>
            <div className="min-h-screen bg-white p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8 gap-20">
                        <form class="w-5/6 mx-auto">
                            <label
                                for="default-search"
                                class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
                            >
                                Search
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                    <svg
                                        class="w-4 h-4 text-gray-500 dark:text-gray-400"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            stroke="currentColor"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                                        />
                                    </svg>
                                </div>
                                <input
                                    type="search"
                                    id="default-search"
                                    class="block w-full p-4 ps-10 text-sm text-gray-900 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    placeholder="Search Classes"
                                    required
                                />
                                <button
                                    type="submit"
                                    class="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                >
                                    Search
                                </button>
                            </div>
                        </form>

                        <Link
                            href={route("instructor.create")}
                            className="bg-blue-500 text-white border rounded-md p-4 w-80 flex justify-center items-center h-createclass
                            "
                        >
                            Create New
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {[...Array(6)].map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    ) : classList && classList.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {classList.map((cls) => (
                                <Link
                                    key={cls.id}
                                    href={route("test.classroom", cls.id)}
                                    className="group"
                                >
                                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full transform transition duration-300 hover:-translate-y-1 hover:shadow-2xl border border-transparent hover:border-indigo-300">
                                        {/* CARD GRID */}
                                        <div className="grid grid-rows-[auto_auto_auto_1fr_auto] h-full">
                                            {/* IMAGE */}
                                            <div className="aspect-w-16 aspect-h-9 bg-gray-100 flex items-center justify-center">
                                                {cls.photo ? (
                                                    <img
                                                        src={`/class/${cls.photo}`}
                                                        alt={cls.name}
                                                        className="w-full h-full object-contain"
                                                    />
                                                ) : (
                                                    <span className="text-gray-400 text-sm">
                                                        No Image
                                                    </span>
                                                )}
                                            </div>

                                            {/* NAME */}
                                            <div className="p-5 pb-1">
                                                <h3 className="text-xl font-bold text-black truncate">
                                                    {cls.name}
                                                </h3>
                                                <p className="text-sm text-green-600 font-semibold flex gap-2">
                                                    {cls.instructor
                                                        ?.firstname ||
                                                        "Unknown"}{" "}
                                                    {cls.instructor?.lastname ||
                                                        "Unkwown"}
                                                </p>
                                            </div>

                                            {/* DESCRIPTION (always same height) */}
                                            <div className="px-5 pb-2">
                                                <p className="text-gray-600 text-sm line-clamp-2 min-h-[2.5em]">
                                                    {cls.description ||
                                                        "No description available."}
                                                </p>
                                            </div>

                                            {/* DETAILS */}
                                            <div className="px-5 space-y-1 text-sm text-gray-700">
                                                <p>
                                                    <span className="font-semibold text-indigo-700">
                                                        Section:
                                                    </span>{" "}
                                                    {cls.section || "—"}
                                                </p>
                                                <p>
                                                    <span className="font-semibold text-indigo-700">
                                                        Year:
                                                    </span>{" "}
                                                    {cls.yearlevel || "—"}
                                                </p>
                                                <p>
                                                    <span className="font-semibold text-indigo-700">
                                                        Students Enrolled:
                                                    </span>{" "}
                                                    {cls.students_count ?? "0"}
                                                </p>
                                            </div>

                                            {/* EDIT BUTTON (always bottom row) */}
                                            <div className="px-5 py-3 text-right border-t">
                                                <Link
                                                    href={route(
                                                        "instructor.classroom.edit",
                                                        cls.id
                                                    )}
                                                    className="text-sm text-indigo-600 hover:underline"
                                                >
                                                    Edit
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex justify-center items-center h-64">
                            <span className="text-lg text-gray-500">
                                No classes yet. Click "Create New" to get
                                started.
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </InstructorLayout>
    );
}
