import InstructorLayout from "@/Layouts/InstructorLayout";
import { useState, useEffect } from "react";
import axios from "axios";
import { Sun, Cloudy, CloudMoon } from "lucide-react";

export default function Dashboard() {
    const [instructor, setInstructor] = useState(null);
    const [students, setStudents] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [classes, setClasses] = useState(0);
    const [dueToday, setDueToday] = useState(0);
    const [greeting, setGreeting] = useState("Good day");
    const [growth, setGrowth] = useState(0);
    const [classGrowth, setClassGrowth] = useState(0);
    const [icon, setIcon] = useState(
        <Sun className="w-10 h-10 text-yellow-500" />
    );

    useEffect(() => {
        const fetchInstructor = async () => {
            try {
                const res = await axios.get("/instructors/json");
                setInstructor(res.data.user);
            } catch (err) {
                console.error("Error fetching instructor", err);
            }
        };
        fetchInstructor();
    }, []);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await axios.get("/students/json");
                setStudents(res.data.students);
                setGrowth(res.data.growth);
            } catch (err) {
                console.error("Error fetching students", err);
            }
        };
        fetchStudents();
        const interval = setInterval(fetchStudents, 2000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const updateGreeting = () => {
            const hour = new Date().getHours();

            if (hour >= 5 && hour < 12) {
                setGreeting("Good morning");
                setIcon(<Sun className="w-10 h-10 text-bluepsu" />);
            } else if (hour >= 12 && hour < 18) {
                setGreeting("Good afternoon");
                setIcon(<Cloudy className="w-10 h-10 text-orange-400" />);
            } else {
                setGreeting("Good evening");
                setIcon(<CloudMoon className="w-10 h-10 text-blue-400" />);
            }
        };

        updateGreeting();
        const timer = setInterval(updateGreeting, 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await axios.get("/classes/json");
                setClasses(res.data.classes);
                setClassGrowth(res.data.new_this_week);
            } catch (error) {
                console.error("Error fetching classes", error);
            }
        };
        fetchClasses();
        // const interval = setInterval(fetchClasses, 2000);
        // return () => clearInterval(interval);
    });

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await axios.get("/tasks/json");
                setTasks(res.data.tasks);
                setDueToday(res.data.dueToday);
            } catch (error) {
                console.error("Error fetching tasks", error);
            }
        };
        fetchTasks();
    }, []);
    return (
        <InstructorLayout>
            <div className="w-full h-dashboard flex items-center justify-between">
                {/* Left side */}
                <div className="h-full w-left flex flex-col justify-between">
                    {/* Greetings card */}
                    <div className="h-greetings w-full flex flex-col p-6 gap-5">
                        <h1 className="text-7xl font-medium tracking-wide flex items-center gap-3">
                            {greeting}{" "}
                            <span className="text-bluepsu">
                                {instructor?.firstname || ""}
                            </span>
                            {icon}
                        </h1>
                        <p className="text-2xl font-medium ml-1">
                            Ready to inspire minds and make learning happen?
                        </p>
                    </div>

                    <div className="h-greetings w-full flex justify-evenly gap-6 px-6">
                        {/* Students Card */}
                        <div className="w-1/3 h-full bg-white shadow-md rounded-2xl p-6 flex flex-col justify-between border border-gray-100 hover:shadow-lg transition">
                            <div className="flex justify-between items-center">
                                <h1 className="text-gray-700 text-lg font-semibold">
                                    Total Students
                                </h1>
                                <div className="bg-blue-100 p-2 rounded-xl">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-6 h-6 text-blue-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M17 20h5v-2a4 4 0 00-4-4h-1m-6 6H2v-2a4 4 0 014-4h1m6 6v-6a4 4 0 00-8 0v6m8 0h2"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-4xl font-bold text-gray-900 mt-4">
                                {students.length}
                            </p>
                            <p
                                className={`text-sm ${
                                    growth >= 0
                                        ? "text-green-500"
                                        : "text-red-500"
                                }`}
                            >
                                {growth >= 0 ? "+" : ""}
                                {growth}% from last month
                            </p>
                        </div>

                        {/* Classes Card */}
                        <div className="w-1/3 h-full bg-gradient-to-br from-yellow-100 to-yellow-50 shadow-md rounded-2xl p-6 flex flex-col justify-between border border-yellow-200 hover:shadow-lg transition">
                            <div className="flex justify-between items-center">
                                <h1 className="text-gray-700 text-lg font-semibold">
                                    Active Classes
                                </h1>
                                <div className="bg-yellow-200 p-2 rounded-xl">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-6 h-6 text-yellow-700"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M3 7h18M3 12h18M3 17h18"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-4xl font-bold text-gray-900 mt-4">
                                {classes.length}
                            </p>
                            <p className="text-sm text-gray-500">
                                {classGrowth} {""}new this week
                            </p>
                        </div>

                        {/* Tasks Card */}
                        <div className="w-1/3 h-full bg-gradient-to-br from-blue-100 to-blue-50 shadow-md rounded-2xl p-6 flex flex-col justify-between border border-blue-200 hover:shadow-lg transition">
                            <div className="flex justify-between items-center">
                                <h1 className="text-gray-700 text-lg font-semibold">
                                    Pending Tasks
                                </h1>
                                <div className="bg-blue-200 p-2 rounded-xl">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-6 h-6 text-blue-700"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M12 8v4l3 3m6 1a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-4xl font-bold text-gray-900 mt-4">
                                {tasks?.length}
                            </p>
                            <p className="text-sm text-gray-500">
                                {dueToday} due today
                            </p>
                        </div>
                    </div>
                    {/* Students */}
                    <div className="w-full bg-white shadow-md rounded-2xl p-6 mt-5">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Recent Students
                        </h2>

                        {students.length === 0 ? (
                            <p className="text-gray-500">No students yet.</p>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {students.slice(0, 5).map((student) => (
                                    <li
                                        key={student.id}
                                        className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg px-2 transition"
                                    >
                                        {/* Left: Avatar + Name */}
                                        <div className="flex items-center gap-4">
                                            {student.profile_picture ? (
                                                <img
                                                    src={`/${student.profile_picture}`}
                                                    alt="Profile"
                                                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                                    onError={(e) => {
                                                        // fallback if file not found
                                                        e.target.onerror = null;
                                                        e.target.src = `https://ui-avatars.com/api/?name=${student.firstname}`;
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-bluepsu flex items-center justify-center text-white font-semibold text-lg uppercase">
                                                    {student.firstname?.charAt(
                                                        0
                                                    ) || "?"}
                                                </div>
                                            )}

                                            <div>
                                                <p className="font-medium text-gray-800">
                                                    {student.firstname}{" "}
                                                    {student.middlename && (
                                                        <span className="text-gray-600">
                                                            {
                                                                student
                                                                    .middlename[0]
                                                            }
                                                            .
                                                        </span>
                                                    )}{" "}
                                                    {student.lastname}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Joined{" "}
                                                    {new Date(
                                                        student.created_at
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        }
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Optional: Right tag */}
                                        <span
                                            className={`text-xs px-3 py-1 rounded-full ${
                                                student.is_online
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-500"
                                            }`}
                                        >
                                            {student.is_online
                                                ? "Online"
                                                : "Offline"}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="h-full w-right bg-blue-500 flex flex-col justify-between gap-2">
                    <div className="h-1/2 w-full bg-yellow-500"></div>
                    <div className="h-1/2 w-full bg-green-500"></div>
                </div>
            </div>
        </InstructorLayout>
    );
}
