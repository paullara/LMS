import React from "react";
import Threads from "@/Pages/Instructor/Classroom/Threads";
import Materials from "@/Pages/Instructor/Classroom/Materials";
import Assignments from "@/Pages/Instructor/Classroom/Assignments";
import Quiz from "@/Pages/Instructor/Classroom/Quiz";
import Members from "@/Pages/Instructor/Classroom/Members";
import Grade from "@/Pages/Instructor/Classroom/Average";

import { useState } from "react";
import AdminAuthenticatedLayout from "@/Layouts/AdminAuthenticatedLayout";

export default function ClassroomView({ classroom = { students: [] } }) {
    const [activeTab, setActiveTab] = useState("general");
    return (
        <AdminAuthenticatedLayout>
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                    <div className="flex flex-col items-start gap-4 ">
                        <div className="flex items-start "></div>
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
        </AdminAuthenticatedLayout>
    );
}
