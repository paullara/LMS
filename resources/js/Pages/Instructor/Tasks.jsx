import InstructorLayout from "@/Layouts/InstructorLayout";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await axios.get("/tasks/json");
                setTasks(res.data || []);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    // Get card color based on status or priority
    const getTaskColor = (task) => {
        if (task.status === "cancelled") return "bg-gray-100 border-gray-300";
        if (task.status === "completed") return "bg-blue-100 border-blue-300";

        switch (task.priority) {
            case "urgent":
                return "bg-red-100 border-red-300";
            case "high":
                return "bg-orange-100 border-orange-300";
            case "medium":
                return "bg-yellow-100 border-yellow-300";
            case "low":
                return "bg-green-100 border-green-300";
            default:
                return "bg-white border-gray-200";
        }
    };

    const renderTaskCard = (task) => (
        <div
            key={task.id}
            className={`rounded-xl shadow-md p-4 border ${getTaskColor(
                task
            )} hover:shadow-lg transition-all duration-300`}
        >
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
                {task.title}
            </h2>
            <p className="text-sm text-gray-500 mb-3">{task.description}</p>

            {/* Progress bar only for in-progress */}
            {task.status === "in-progress" && (
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div
                        className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${task.progress || 0}%` }}
                    ></div>
                </div>
            )}

            {task.due_date && (
                <p className="text-xs text-gray-400 mt-2">
                    Due: {new Date(task.due_date).toLocaleDateString()}
                </p>
            )}
        </div>
    );

    const statusOrder = ["pending", "in-progress", "cancelled", "completed"];
    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    return (
        <InstructorLayout>
            <div className="p-6">
                <h1 className="text-2xl font-semibold text-gray-800 mb-6">
                    Tasks Overview
                </h1>

                {loading ? (
                    <p>Loading tasks...</p>
                ) : tasks.length === 0 ? (
                    <p>No tasks found.</p>
                ) : (
                    <div className="flex space-x-6 overflow-x-auto pb-4">
                        {statusOrder.map((status) => {
                            const tasksByStatus = tasks.filter(
                                (t) => t.status === status
                            );
                            return (
                                <div
                                    key={status}
                                    className="min-w-[280px] flex-1 flex flex-col bg-gray-50 rounded-2xl p-4 shadow-sm"
                                >
                                    <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-700">
                                        {capitalize(status.replace("-", " "))}
                                    </h2>
                                    <div className="space-y-4">
                                        {tasksByStatus.length === 0 ? (
                                            <p className="text-gray-400 text-sm">
                                                No tasks
                                            </p>
                                        ) : (
                                            tasksByStatus.map((task) =>
                                                renderTaskCard(task)
                                            )
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </InstructorLayout>
    );
}
