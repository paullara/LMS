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
import axios from "axios";

export default function TestProfilePage({ classes }) {
    const { auth } = usePage().props;
    const [loading, setLoading] = useState(true);
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
        const suffix = h == 12 ? "PM" : "AM";

        const hour12 = h % 12 || 12;

        return `${hour12}: ${minute} ${suffix}`;
    };

    // Confirming
    console.log("Address", auth?.user?.address);
    console.log("Authenticated Nigga!", auth?.user?.id);
    console.log("Clases:", classes);
    return (
        <AuthenticatedLayout>
            <div className="h-profile p-4 ml-4 flex flex-row justify-between gap-4">
                <div className="h-left w-2/5 flex flex-col gap-2">
                    {/* Basic Info */}
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
                                        .toUpperCase() ?? "U"}
                                </div>
                            )}
                            <div className="flex flex-col ml-4">
                                <h1 className="text-lg font-semibold tracking-wide">
                                    {fullname}
                                </h1>
                                <h1 className="">{auth?.user?.student_id}</h1>
                            </div>
                        </div>
                        <div className="w-full flex flex-col items-start justify-start ml-4 gap-2">
                            <h1 className="text-md font-semibold">About</h1>
                            <div className="flex flex-row items-center gap-2">
                                <Phone className="w-5 h-phone text-gray-500" />
                                <h1 className="text-gray-500">
                                    Phone:{" "}
                                    <span className="text-black font-md ml-1">
                                        {auth?.user?.contact_number}
                                    </span>
                                </h1>
                            </div>
                            <div className="flex flex-row items-center gap-2">
                                <Mail className="w-5 h-email text-gray-500" />
                                <h1 className="text-gray-500">
                                    Email: {""}
                                    <span className="text-black font-md ml-1">
                                        {auth?.user?.email}
                                    </span>
                                </h1>
                            </div>
                        </div>
                    </div>
                    <div className="w-full h-profile_info flex flex-col items-start ml-4 gap-2">
                        <h1 className="text-md font-semibold">Address</h1>
                        <div className="flex flex-row items-center justify-center gap-2">
                            <House className="w-5 h-phone text-gray-500" />
                            <h1 className="text-gray-500">
                                Address:{" "}
                                <span className="text-black font-md ml-1">
                                    {auth?.user?.address}
                                </span>
                            </h1>
                        </div>
                        <div className="flex flex-row items-center justify-center gap-2">
                            <Building2 className="w-5 h-building text-gray-500" />
                            <h1 className="text-gray-500">
                                City:{" "}
                                <span className="text-black font-md">
                                    {auth?.user?.city}
                                </span>
                            </h1>
                        </div>

                        <div className="flex flex-row items-center justify-center gap-2">
                            <MapPin className="w-5 h-pin text-gray-500" />
                            <h1 className="text-gray-500">
                                Zipcode:{" "}
                                <span className="text-black font-md">
                                    {auth?.user?.zipcode}
                                </span>
                            </h1>
                        </div>
                    </div>
                    <div className="w-full h-profile_info flex flex-col p-4 gap-3">
                        <h1 className="text-md font-semibold">
                            School Details
                        </h1>
                        <div className="flex items-start gap-2">
                            <BookOpen className="w-5 h-5 text-gray-500 mt-1" />
                            <h1 className="text-gray-500">
                                Course:{" "}
                                <span className="text-black font-medium">
                                    {auth?.user?.course}
                                </span>
                            </h1>
                        </div>
                        <div className="flex items-start gap-2">
                            <School className="w-5 h-5 text-gray-500" />
                            <h1 className="text-gray-500">
                                Campus: {""}{" "}
                                <span className="text-black font-md">
                                    {auth?.user?.campus}
                                </span>
                            </h1>
                        </div>

                        <div className="flex items-start gap-2">
                            <GraduationCap className="w-5 h-5 text-gray-500" />
                            <h1 className="text-gray-500">
                                Year Level:{" "}
                                <span className="text-black font-md">
                                    {auth?.user?.year_level}
                                    {getYearSuffix(auth?.user?.year_level)} year
                                </span>
                            </h1>
                        </div>
                    </div>
                </div>
                <div className="h-full w-4/5 p-4 border rounded-md p-6 mt-4 flex flex-col">
                    <h2 className="text-lg font-semibold">My Classes</h2>
                    <div className="w-full h-[90%] flex justify-center mt-4">
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
                                                transition
                                            >
                                                <td className="px-4 py-3 font-medium text-gray-800">
                                                    {cls.name}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-gray-800">
                                                    {cls.subcode}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    {cls.day} •{" "}
                                                    {formatTime(cls.start_time)}{" "}
                                                    - {formatTime(cls.end_time)}
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
