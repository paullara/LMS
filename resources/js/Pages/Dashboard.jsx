import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useState, useEffect } from "react";
import axios from "axios";
import { Sun, Cloudy, CloudMoon } from "lucide-react";

export default function Dashboard() {
    const [student, setStudent] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [taskDisplay, setTaskDisplay] = useState([]);
    const [classes, setClasses] = useState([]);
    const [assignments, setAssignment] = useState([]);
    const [dueToday, setDueToday] = useState(0);
    const [greeting, setGreeting] = useState("Good day");
    const [growth, setGrowth] = useState(0);
    const [classGrowth, setClassGrowth] = useState(0);
    const [assignmentGrowth, setAssignmentGrowth] = useState(0);
    const [icon, setIcon] = useState(
        <Sun className="w-10 h-10 text-yellow-500" />
    );

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const res = await axios.get("/student/json");
                setStudent(res.data.student);
            } catch (err) {
                console.error("Error fetching instructor", err);
            }
        };
        fetchStudent();
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

    // useEffect(() => {
    //     const fetchClasses = async () => {
    //         try {
    //             const res = await axios.get("/classes/json");
    //             setClasses(res.data.classes);
    //             setClassGrowth(res.data.new_this_week);
    //         } catch (error) {
    //             console.error("Error fetching classes", error);
    //         }
    //     };
    //     fetchClasses();
    //     // const interval = setInterval(fetchClasses, 2000);
    //     // return () => clearInterval(interval);
    // });

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await axios.get("/task/json");
                setTasks(res.data.tasks);
                setTaskDisplay(res.data.taskCount);
                setDueToday(res.data.dueToday);
            } catch (error) {
                console.error("Error fetching tasks", error);
            }
        };
        fetchTasks();
    }, []);

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const res = await axios.get("/student/dashboard/data");
                setClasses(res.data.classes);
                setAssignment(res.data.assignments);
                console.log("Classes:", res.data.classes);
                console.log("Assignments:", res.data.assignments);
                setClassGrowth(res.data.new_this_week);
                setAssignmentGrowth(res.data.new_ass_this_week);
            } catch (err) {
                console.error("Error fetching data", err);
            }
        };
        fetchStudentData();
    }, []);
    return (
        <AuthenticatedLayout>
            <div className="w-full h-dashboard flex items-center justify-between ">
                {/* Left side */}
                <div className="h-full w-left flex flex-col justify-between">
                    {/* Greetings card */}
                    <div className="h-greetings w-full flex flex-col p-6 gap-5">
                        <h1 className="text-6xl font-medium tracking-wide flex items-center gap-3">
                            {greeting}{" "}
                            <span className="text-bluepsu">
                                {student?.firstname || ""}
                            </span>
                            {icon}
                        </h1>
                        <p className="text-2xl font-medium ml-1">
                            Let’s make today a productive day for your learning
                            journey!
                        </p>
                    </div>

                    <div className="h-greetings w-full flex justify-evenly gap-6 px-6">
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

                        {/* Assignments Card */}
                        <div className="w-1/3 h-full bg-gradient-to-br from-green-100 to-green-50 shadow-md rounded-2xl p-6 flex flex-col justify-between border border-green-200 hover:shadow-lg transition">
                            <div className="flex justify-between items-center">
                                <h1 className="text-gray-700 text-lg font-semibold">
                                    Assignments
                                </h1>
                                <div className="bg-green-200 p-2 rounded-xl">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-6 h-6 text-green-700"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M9 12h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h5l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-4xl font-bold text-gray-900 mt-4">
                                {assignments?.length || 0}
                            </p>
                            <p className="text-sm text-gray-500">
                                {assignmentGrowth || 0} new this week
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
                    {/* Schedule */}
                    <div className="w-full bg-white shadow-md rounded-2xl p-6 mt-5">
                        {classes.length === 0 ? (
                            <p className="text-gray-500 text-center">
                                No classes yet
                            </p>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {classes.slice(0, 8).map((item, index) => (
                                    <li
                                        key={index}
                                        className="flex justify-between items-center py-3"
                                    >
                                        {/* Class Name */}
                                        <span className="text-gray-800 font-medium">
                                            {item.name}
                                        </span>

                                        {/* Schedule */}
                                        <span className="text-gray-500 text-sm">
                                            {item.start_time && item.end_time
                                                ? `${item.start_time} - ${item.end_time}`
                                                : "No schedule set"}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="h-full w-right flex flex-col justify-between gap-2 p-2">
                    <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg flex flex-col items-center p-6 transition-all duration-300">
                        {/* Profile Image */}
                        <div className="relative">
                            <img
                                src={`/${student?.profile_picture}`}
                                alt="student"
                                className="w-24 h-24 rounded-full border-4 border-bluepsu object-cover shadow-md"
                            />
                        </div>

                        {/* Name & Bio */}
                        <h1 className="mt-1 text-xl font-semibold text-gray-800">
                            {student?.firstname} {student?.lastname}
                        </h1>
                        <p className="text-sm text-gray-500 text-center px-4">
                            {student?.bio ||
                                "Passionate about teaching and learning."}
                        </p>

                        {/* University */}
                        <p className="text-bluepsu font-medium text-sm mt-1">
                            Pangasinan State University
                        </p>

                        {/* Divider line */}
                        <div className="w-3/4 border-t border-gray-200 my-4"></div>

                        {/* Info Section */}
                        <div className="w-full px-6">
                            <div className="flex flex-col gap-3">
                                <div>
                                    <h2 className="text-gray-500 text-xs uppercase tracking-wider">
                                        Course
                                    </h2>
                                    <p className="text-gray-800 font-medium">
                                        {student?.course || "Not specified"}
                                    </p>
                                </div>

                                <div>
                                    <h2 className="text-gray-500 text-xs uppercase tracking-wider">
                                        Email
                                    </h2>
                                    <p className="text-gray-800 font-medium break-words">
                                        {student?.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full bg-white shadow-sm rounded-2xl p-6 border border-gray-100 h-1/2 flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                                📝 My Tasks
                            </h1>
                            {tasks?.length > 0 && (
                                <button className="text-sm text-blue-500 hover:text-blue-600 transition font-medium">
                                    View All
                                </button>
                            )}
                        </div>

                        {/* Content */}
                        {tasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center flex-1 text-gray-500">
                                <img
                                    src="/images/empty.gif"
                                    alt="No tasks"
                                    className="w-28 mb-3 opacity-70"
                                />
                                <p className="text-sm font-medium">
                                    No tasks yet.
                                </p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {tasks
                                    .sort(
                                        (a, b) =>
                                            new Date(b.created_at) -
                                            new Date(a.created_at)
                                    ) // latest first
                                    .slice(0, 4)
                                    .map((task) => (
                                        <li
                                            key={task.id}
                                            className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-blue-50 transition"
                                        >
                                            <div className="flex flex-col">
                                                <h2 className="text-base font-semibold text-gray-800">
                                                    {task.title}
                                                </h2>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {task.description}
                                                </p>
                                            </div>
                                            <span className="text-xs font-medium text-gray-400">
                                                {task.due_date
                                                    ? new Date(
                                                          task.due_date
                                                      ).toLocaleDateString()
                                                    : ""}
                                            </span>
                                        </li>
                                    ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
