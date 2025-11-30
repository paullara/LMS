import Chairman from "@/Layouts/Chairman";
import { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import axios from "axios";

export default function Classes() {
    const [createdClasses, setCreatedClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch function (can be reused for auto-refresh)
    const fetchCreatedClasses = async () => {
        try {
            const res = await axios.get("/chairman/created/classes");
            setCreatedClasses(res.data.createdClasses);
        } catch (err) {
            console.error("Error fetching created classes", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCreatedClasses();
        const interval = setInterval(fetchCreatedClasses, 10000); // 10 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <Chairman>
            <div className="p-4 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    {/* <h1 className="text-2xl font-semibold text-gray-800">
                        Classroom Monitoring
                    </h1>
                    <Link
                        href={route("chairman.create.classes")}
                        className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        + Create New
                    </Link> */}
                </div>

                {loading ? (
                    <p>Loading classes...</p>
                ) : createdClasses.length === 0 ? (
                    <p className="text-gray-500">No classes created yet.</p>
                ) : (
                    <div className="overflow-x-auto rounded-lg shadow-sm bg-white">
                        <table className="min-w-full border-collapse">
                            <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
                                <tr>
                                    <th className="px-4 py-3 text-left">
                                        Course Title
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Course Code
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Schedule
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Instructor
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Students
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {createdClasses.map((cls) => (
                                    <tr
                                        key={cls.id}
                                        className="hover:bg-gray-50 transition"
                                    >
                                        <td className="px-4 py-3 font-medium text-gray-800">
                                            {cls.name}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {cls.subcode}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {cls.day} • {cls.start_time} -{" "}
                                            {cls.end_time}
                                        </td>

                                        <td className="px-4 py-3 text-gray-600">
                                            {cls.instructor
                                                ? `${cls.instructor.firstname} ${cls.instructor.lastname}`
                                                : "—"}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {cls.students.length}
                                        </td>
                                        <td className="px-4 py-3">
                                            {cls.is_active_now ? (
                                                <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 text-xs font-semibold text-gray-600 bg-gray-200 rounded-full">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Chairman>
    );
}
