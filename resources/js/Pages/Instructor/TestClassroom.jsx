import React from "react";
import { Link } from "@inertiajs/react";
import { FiVideo } from "react-icons/fi";
import Threads from "./Classroom/Threads";
import Materials from "./Classroom/Materials";
import Assignments from "./Classroom/Assignments";
import Quiz from "./Classroom/Quiz";
import Members from "./Classroom/Members";
import Grade from "./Classroom/Average";
import { useState } from "react";
import InstructorLayout from "@/Layouts/InstructorLayout";

export default function TestClassroom({ classroom = { students: [] } }) {
    const [activeTab, setActiveTab] = useState("general");
    return (
        <InstructorLayout>
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                    <div className="flex flex-col items-start gap-4 ">
                        <div className="flex items-start ">
                            <Link
                                href={route("test.list")}
                                className="hover:text-blue-600 pointer-cursor"
                            >
                                <h2>View All Classroom</h2>
                            </Link>
                        </div>
                        <div className="">
                            {""}
                            <h1 className="text-3xl font-semibold text-black">
                                {classroom?.name || "Classroom"}
                            </h1>
                            <p className="text-gray-600">
                                {classroom?.description || ""}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={route("video.call.start", classroom.id)}
                        title="Start Video Call"
                        className="text-purple-600 hocver:text-purple-800 text-3xl p-2 rounded-md transition"
                    >
                        <FiVideo />
                    </Link>
                </div>

                <div className="flex space-x-4 border-b mb-4">
                    {[
                        "general",
                        "materials",
                        "assignments",
                        "quiz",
                        "members",
                        "grade",
                    ].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-2 px-4 text-sm font-medium capitalize border-b-2 transition ${
                                activeTab === tab
                                    ? "border-black-600 text-black-600"
                                    : "border-transparent text-gray-500 hover:text-purple-600"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="mt-4">
                    {activeTab === "general" && (
                        <Threads classId={classroom.id}></Threads>
                    )}
                    {activeTab === "materials" && (
                        <Materials classId={classroom.id}></Materials>
                    )}
                    {activeTab === "assignments" && (
                        <Assignments classId={classroom.id}></Assignments>
                    )}
                    {activeTab === "quiz" && (
                        <Quiz classId={classroom.id}></Quiz>
                    )}
                    {activeTab === "members" && (
                        <Members classId={classroom.id}></Members>
                    )}
                    {activeTab === "grade" && (
                        <Grade classId={classroom.id}></Grade>
                    )}
                </div>
            </div>
        </InstructorLayout>
    );
}
