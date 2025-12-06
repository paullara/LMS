import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import React, { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import {
    Phone,
    Mail,
    House,
    Building2,
    MapPin,
    BookOpen,
    School,
    GraduationCap,
} from "lucide-react";

export default function TestProfilePage({ classes, upcoming }) {
    const { auth } = usePage().props;
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);

    const firstname = auth?.user?.firstname;
    const lastname = auth?.user?.lastname;
    const fullname = firstname + " " + lastname;

    useEffect(() => {
        if (classes !== undefined) {
            setLoading(false);
        }
    }, [classes]);

    const getYearSuffix = (num) => {
        switch (num) {
            case 1:
                return "st";
            case 2:
                return "nd";
            case 3:
                return "rd";
            case 4:
                return "th";
            default:
                return "";
        }
    };

    const formatTime = (time) => {
        if (!time) return "";
        const [hour, minute] = time.split(":");
        const h = parseInt(hour);
        const suffix = h >= 12 ? "PM" : "AM";
        const hour12 = h % 12 || 12;

        return `${hour12}:${minute} ${suffix}`;
    };

    return (
        <AuthenticatedLayout>
            <div className="h-profile p-4 ml-4 flex flex-row justify-between gap-4">
                <div className="h-left w-2/5 flex flex-col gap-2">
                    <div className="w-full h-full flex flex-col justify-around">
                        <div className="w-full flex flex-row p-4 items-center">
                            {auth?.user?.profile_picture ? (
                                <img
                                    src={`/${auth.user.profile_picture}`}
                                    alt="Profile"
                                    className="w-24 h-24 rounded-md"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-md bg-bluepsu flex items-center justify-center text-white font-semibold text-lg">
                                    {auth?.user?.firstname
                                        ?.charAt(0)
                                        .toUpperCase()}
                                </div>
                            )}
                            <div className="flex flex-col ml-4">
                                <h1 className="text-lg font-semibold tracking-wide">
                                    {fullname}
                                </h1>
                                <h1 className="">{auth?.user?.student_id}</h1>

                                {/* EDIT PROFILE BUTTON */}
                                <button
                                    onClick={() => setIsEditMode(true)}
                                    className="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition"
                                >
                                    Edit Profile
                                </button>
                            </div>
                        </div>

                        {/* ABOUT */}
                        <div className="w-full flex flex-col items-start ml-4 gap-2">
                            <h1 className="text-md font-semibold">About</h1>
                            <div className="flex items-center gap-2">
                                <Phone className="w-5 h-5 text-gray-500" />
                                <h1 className="text-gray-500">
                                    Phone:
                                    <span className="text-black ml-1">
                                        {auth?.user?.contact_number}
                                    </span>
                                </h1>
                            </div>

                            <div className="flex items-center gap-2">
                                <Mail className="w-5 h-5 text-gray-500" />
                                <h1 className="text-gray-500">
                                    Email:
                                    <span className="text-black ml-1">
                                        {auth?.user?.email}
                                    </span>
                                </h1>
                            </div>
                        </div>
                    </div>

                    {/* ADDRESS */}
                    <div className="w-full flex flex-col items-start ml-4 gap-2">
                        <h1 className="text-md font-semibold">Address</h1>

                        <div className="flex items-start gap-2">
                            <House className="w-5 h-5 text-gray-500" />
                            <h1 className="text-gray-500">
                                Address:
                                <span className="text-black ml-1">
                                    {auth?.user?.address}
                                </span>
                            </h1>
                        </div>

                        <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-gray-500" />
                            <h1 className="text-gray-500">
                                City:
                                <span className="text-black ml-1">
                                    {auth?.user?.city}
                                </span>
                            </h1>
                        </div>

                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-gray-500" />
                            <h1 className="text-gray-500">
                                Zipcode:
                                <span className="text-black ml-1">
                                    {auth?.user?.zipcode}
                                </span>
                            </h1>
                        </div>
                    </div>

                    {/* SCHOOL DETAILS */}
                    <div className="w-full flex flex-col p-4 ml-2 gap-3">
                        <h1 className="text-md font-semibold">
                            School Details
                        </h1>

                        <div className="flex items-start gap-2">
                            <BookOpen className="w-5 h-5 text-gray-500" />
                            <h1 className="text-gray-500">
                                Course:
                                <span className="text-black ml-1">
                                    {auth?.user?.course}
                                </span>
                            </h1>
                        </div>

                        <div className="flex items-start gap-2">
                            <School className="w-5 h-5 text-gray-500" />
                            <h1 className="text-gray-500">
                                Campus:
                                <span className="text-black ml-1">
                                    {auth?.user?.campus}
                                </span>
                            </h1>
                        </div>

                        <div className="flex items-start gap-2">
                            <GraduationCap className="w-5 h-5 text-gray-500" />
                            <h1 className="text-gray-500">
                                Year Level:
                                <span className="text-black ml-1">
                                    {auth?.user?.year_level}
                                    {getYearSuffix(auth?.user?.year_level)} year
                                </span>
                            </h1>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE — Switch View vs Edit Mode */}
                <div className="h-full w-4/5 border rounded-md p-6 mt-4 flex flex-col">
                    {isEditMode ? (
                        <EditProfileForm
                            user={auth.user}
                            onCancel={() => setIsEditMode(false)}
                        />
                    ) : (
                        <RightContentView
                            loading={loading}
                            classes={classes}
                            upcoming={upcoming}
                            formatTime={formatTime}
                        />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function RightContentView({ loading, classes, upcoming, formatTime }) {
    return (
        <>
            <h2 className="text-lg font-semibold">My Classes</h2>

            <div className="w-full h-[53%] flex justify-center mt-4">
                {loading ? (
                    <p>Loading classes..</p>
                ) : classes.length === 0 ? (
                    <p>No Classes</p>
                ) : (
                    <div className="w-full overflow-x-auto rounded-lg shadow-sm bg-white">
                        <table className="w-full border-collapse">
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
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {classes.map((cls) => (
                                    <tr
                                        key={cls.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 font-medium text-gray-800">
                                            {cls.name}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-800">
                                            {cls.subcode}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {cls.day} •{" "}
                                            {formatTime(cls.start_time)} -{" "}
                                            {formatTime(cls.end_time)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {cls.instructor
                                                ? `${cls.instructor.firstname} ${cls.instructor.lastname}`
                                                : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* UPCOMING */}
            <div className="w-full h-[50%] mt-4">
                <h1 className="text-lg font-semibold">
                    Upcoming Quizzes & Assignments
                </h1>

                <div className="mt-3 flex flex-col gap-3">
                    {upcoming.length === 0 ? (
                        <p className="text-gray-500">No upcoming items</p>
                    ) : (
                        upcoming.map((item, i) => (
                            <div
                                key={i}
                                className="p-3 border rounded-md bg-white shadow-sm"
                            >
                                <h2 className="font-semibold">{item.title}</h2>
                                <p className="text-sm text-gray-600 capitalize">
                                    {item.type}
                                </p>
                                <p className="text-sm text-gray-800">
                                    Due:{" "}
                                    {new Date(item.deadline).toLocaleString()}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}

function EditProfileForm({ user, onCancel }) {
    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold mb-2">Edit Profile</h2>

            <div className="grid grid-cols-2 gap-4">
                <input
                    type="text"
                    defaultValue={user.firstname}
                    className="border rounded-md p-2"
                    placeholder="Firstname"
                />
                <input
                    type="text"
                    defaultValue={user.lastname}
                    className="border rounded-md p-2"
                    placeholder="Lastname"
                />
                <input
                    type="text"
                    defaultValue={user.contact_number}
                    className="border rounded-md p-2"
                    placeholder="Phone"
                />
                <input
                    type="text"
                    defaultValue={user.email}
                    className="border rounded-md p-2"
                    placeholder="Email"
                />
            </div>

            <div className="flex gap-2 mt-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md">
                    Save Changes
                </button>
                <button
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-300 rounded-md"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
