import InstructorLayout from "@/Layouts/InstructorLayout";
import { usePage, router } from "@inertiajs/react";
import React from "react";

export default function StudentProgress() {
    const { students, classes, selectedClass } = usePage().props;

    const handleClassChange = (e) => {
        const classId = e.target.value;
        router.get(route("instructor.student.progress"), { classId });
    };

    return (
        <InstructorLayout>
            <div className="p-3 w-full h-screen font-[Poppins]">
                {/* Header */}
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-black text-xl font-medium">
                            Track your students’ learning journey here.
                        </p>
                    </div>

                    <div className="mt-4 sm:mt-0">
                        <select
                            value={selectedClass || ""}
                            onChange={handleClassChange}
                            className="bg-white border border-gray-300 text-gray-700 rounded-xl px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                        >
                            <option value="">Select a class</option>
                            {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table or Empty State */}
                {students.length > 0 ? (
                    <div className="bg-white shadow-md rounded-sm border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-700">
                                <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
                                    <tr>
                                        <th className="py-3 px-4 rounded-tl-xl ">
                                            Student
                                        </th>
                                        <th className="py-3 px-4">
                                            Assignments
                                        </th>
                                        <th className="py-3 px-4">Quizzes</th>
                                        <th className="py-3 px-4 rounded-tr-xl">
                                            Progress
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((s, index) => (
                                        <tr
                                            key={s.id}
                                            className={`${
                                                index % 2 === 0
                                                    ? "bg-white"
                                                    : "bg-gray-50"
                                            } hover:bg-blue-50 transition`}
                                        >
                                            <td className="py-3 px-4 font-medium text-gray-800">
                                                <div className="flex items-center gap-3">
                                                    <span className="truncate">
                                                        {s.name}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="py-3 px-4">
                                                <span className="font-semibold text-blue-600">
                                                    {s.assignments_completed}
                                                </span>{" "}
                                                / {s.assignments_total}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="font-semibold text-green-600">
                                                    {s.quizzes_completed}
                                                </span>{" "}
                                                / {s.quizzes_total}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                                        <div
                                                            className={`h-3 rounded-full ${
                                                                s.progress >= 80
                                                                    ? "bg-green-500"
                                                                    : s.progress >=
                                                                      50
                                                                    ? "bg-yellow-400"
                                                                    : "bg-red-400"
                                                            }`}
                                                            style={{
                                                                width: `${s.progress}%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm text-gray-700 w-10 text-right">
                                                        {s.progress}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-10 rounded-2xl shadow-sm flex flex-col items-center border border-gray-100">
                        <img
                            src="/images/empty.gif"
                            alt="No data"
                            className="w-48 mb-6 opacity-80"
                        />
                        <h2 className="text-lg font-semibold text-gray-700">
                            No data available
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                            Select a class to view your students’ progress.
                        </p>
                    </div>
                )}
            </div>
        </InstructorLayout>
    );
}
