import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";

import Avatar from "@/Components/Profile/Avatar";
import AboutSection from "@/Components/Profile/AboutSection";
import AddressSection from "@/Components/Profile/AddressSection";
import SchoolSection from "@/Components/Profile/SchoolSection";
import ClassesTable from "@/Components/Profile/ClassesTable";
import UpcomingList from "@/Components/Profile/UpcomingList";
import EditProfileForm from "@/Components/Form/EditProfileForm";

import formatTime from "@/Utils/formatTime";

export default function TestProfilePage({ classes, upcoming }) {
    const { auth } = usePage().props;
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        if (classes !== undefined) setLoading(false);
    }, [classes]);

    return (
        <AuthenticatedLayout>
            <div className="p-4 ml-4 flex gap-4">
                {/* LEFT SIDE */}
                <div className="w-2/5 flex flex-col gap-4">
                    <div className="flex p-4 items-center">
                        <Avatar user={auth.user} />

                        <div className="ml-4">
                            <h1 className="text-lg font-semibold">
                                {auth.user.firstname} {auth.user.lastname}
                            </h1>
                            <p>{auth.user.student_id}</p>

                            <button
                                onClick={() => setIsEditMode(true)}
                                className="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm"
                            >
                                Edit Profile
                            </button>
                        </div>
                    </div>

                    <AboutSection user={auth.user} />
                    <AddressSection user={auth.user} />
                    <SchoolSection user={auth.user} authUser={auth.user} />
                </div>

                {/* RIGHT SIDE */}
                <div className="w-4/5 border rounded-md p-6 mt-4">
                    {isEditMode ? (
                        <EditProfileForm
                            user={auth.user}
                            authUser={auth.user}
                            onCancel={() => setIsEditMode(false)}
                        />
                    ) : (
                        <>
                            <h2 className="text-lg font-semibold">
                                My Classes
                            </h2>
                            {loading ? (
                                <p>Loading…</p>
                            ) : (
                                <ClassesTable
                                    classes={classes}
                                    formatTime={formatTime}
                                />
                            )}

                            <h2 className="text-lg font-semibold mt-6">
                                Upcoming Quizzes & Assignments
                            </h2>
                            <UpcomingList upcoming={upcoming} />
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
