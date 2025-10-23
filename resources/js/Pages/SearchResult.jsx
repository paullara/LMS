import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { usePage } from "@inertiajs/react";
import { useState } from "react";

export default function SearchResult() {
    const { instructor, announcements } = usePage().props;
    const [activeTab, setActiveTab] = useState("announcements");

    return (
        <AuthenticatedLayout>
            <div className="h-dashboard">
                {/* Profile Cover + Info */}
                <div className="relative">
                    {/* Cover Photo */}
                    <div className="h-64 rounded-b-lg overflow-hidden">
                        <img
                            src={`/${
                                instructor.coverphoto || "default-cover.jpg"
                            }`}
                            alt="Cover Photo"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Profile Section */}
                    <div className="max-w-5xl mx-auto px-6 relative">
                        <div className="flex flex-col sm:flex-row items-center md:items-end gap-6 -mt-20">
                            {/* Profile Picture */}
                            <img
                                src={`/${
                                    instructor.profile_picture ||
                                    "default-avatar.png"
                                }`}
                                alt="Instructor"
                                className="w-36 h-36 rounded-full border-4 border-white shadow-md object-cover"
                            />

                            {/* Name */}
                            <div className="flex-1 text-center sm:text-left">
                                <h1 className="text-3xl font-semibold mb-2 mr-20">
                                    {instructor.firstname} {instructor.lastname}
                                </h1>
                            </div>

                            {/* Follow / Message Buttons */}
                            <div className="flex gap-3 mb-3">
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-gray-300 transition">
                                    Message
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b mt-6">
                    <div className="max-w-5xl mx-auto flex gap-6 px-6 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab("announcements")}
                            className={`py-3 font-medium ${
                                activeTab === "announcements"
                                    ? "text-blue-600 border-b-2 border-blue-600"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Announcements
                        </button>
                        <button
                            onClick={() => setActiveTab("about")}
                            className={`py-3 font-medium ${
                                activeTab === "about"
                                    ? "text-blue-600 border-b-2 border-blue-600"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            About
                        </button>
                    </div>
                </div>

                {/* Announcements Feed */}
                {activeTab === "announcements" && (
                    <div className="max-w-5xl mx-auto p-6 space-y-4">
                        {announcements && announcements.length > 0 ? (
                            announcements.map((a) => (
                                <div
                                    key={a.id}
                                    className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition"
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-lg">
                                            {a.title}
                                        </h3>
                                        <span className="text-sm text-gray-400">
                                            {a.created_at
                                                ? new Date(
                                                      a.created_at
                                                  ).toLocaleDateString()
                                                : ""}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 mt-2">
                                        {a.message}
                                    </p>
                                    {a.class_code && (
                                        <p className="text-sm text-blue-600 mt-1">
                                            Class Code: {a.class_code}
                                        </p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center mt-6">
                                No announcements yet.
                            </p>
                        )}
                    </div>
                )}

                {activeTab === "about" && (
                    <div className="w-11/12 mx-auto p-6">
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">
                                About Instructor
                            </h2>

                            <div className="flex flex-col gap-5 text-gray-700">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                                        Role
                                    </p>
                                    <p className="font-medium capitalize">
                                        {instructor.role || "N/A"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                                        Email
                                    </p>
                                    <p className="font-medium break-all">
                                        {instructor.email || "N/A"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                                        Contact Number
                                    </p>
                                    <p className="font-medium">
                                        {instructor.contact_number || "N/A"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                                        Specialization
                                    </p>
                                    <p className="font-medium capitalize">
                                        {instructor.specialization || "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
