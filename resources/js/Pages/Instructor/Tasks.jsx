import InstructorLayout from "@/Layouts/InstructorLayout";
import { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { usePage } from "@inertiajs/react";

export default function TasksIndex() {
    const { props } = usePage();
    const { tasks = [] } = props;

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        due_date: "",
        priority: "medium",
    });

    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleAddTask = () => {
        if (!formData.title.trim()) return;

        Inertia.post("/tasks", formData, {
            onSuccess: () => {
                setFormData({
                    title: "",
                    description: "",
                    due_date: "",
                    priority: "medium",
                });
                setShowForm(false);
            },
        });
    };

    const getTaskColor = (priority) => {
        switch (priority) {
            case "urgent":
                return "bg-red-700 text-white";
            case "high":
                return "bg-orange-500 text-white";
            case "medium":
                return "bg-yellow-400 text-black";
            case "low":
                return "bg-green-400 text-black";
            case "completed":
                return "bg-blue-400 text-white";
            case "cancelled":
                return "bg-gray-700 text-white";
            default:
                return "bg-gray-200 text-black";
        }
    };

    const renderColumn = (status) =>
        tasks
            .filter((task) => task.status === status)
            .map((task) => (
                <div
                    key={task.id}
                    className={`p-4 rounded-2xl shadow-md ${getTaskColor(
                        task.priority
                    )} hover:scale-105 transform transition w-48 h-48 flex flex-col justify-between`}
                >
                    <div>
                        <h3 className="font-semibold text-lg">{task.title}</h3>
                        {task.description && (
                            <p className="mt-2 text-sm">{task.description}</p>
                        )}
                    </div>
                    {task.due_date && (
                        <p className="mt-4 text-xs opacity-80">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                        </p>
                    )}
                </div>
            ));

    return (
        <InstructorLayout>
            <div className="w-full h-screen flex flex-col font-[Poppins] bg-gray-50">
                {/* Top Bar */}
                <div className="h-20 w-full flex items-center justify-between px-6 bg-white border-b border-gray-200">
                    <h1 className="text-xl font-semibold text-gray-800">
                        {today}
                    </h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                    >
                        {showForm ? "Close" : "Add Task"}
                    </button>
                </div>

                {/* Add Task Form */}
                {showForm && (
                    <div className="p-6 border-b border-gray-200 bg-white flex flex-col gap-3 shadow-md rounded-b-xl mx-6 -mt-2">
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Task title"
                            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Task description"
                            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <input
                            type="date"
                            name="due_date"
                            value={formData.due_date}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="urgent">Urgent</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                            onClick={handleAddTask}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
                        >
                            Save Task
                        </button>
                    </div>
                )}

                {/* Task Columns */}
                <div className="flex-1 w-full flex gap-6 p-6 overflow-y-auto">
                    <div className="flex-1 bg-gray-100 p-4 rounded-xl shadow-inner">
                        <h2 className="font-semibold text-lg mb-4">Pending</h2>
                        <div className="flex flex-wrap gap-4">
                            {renderColumn("pending")}
                        </div>
                    </div>

                    <div className="flex-1 bg-gray-100 p-4 rounded-xl shadow-inner">
                        <h2 className="font-semibold text-lg mb-4">
                            In Progress
                        </h2>
                        <div className="flex flex-wrap gap-4">
                            {renderColumn("in-progress")}
                        </div>
                    </div>

                    <div className="flex-1 bg-gray-100 p-4 rounded-xl shadow-inner">
                        <h2 className="font-semibold text-lg mb-4">
                            Completed
                        </h2>
                        <div className="flex flex-wrap gap-4">
                            {renderColumn("completed")}
                        </div>
                    </div>
                </div>
            </div>
        </InstructorLayout>
    );
}
