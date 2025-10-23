import Instructor from "@/Layouts/InstructorLayout";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Announcement() {
    const [announcements, setAnnouncements] = useState([]);
    const [formData, setFormData] = useState({
        title: "",
        message: "",
        class_id: "",
        class_code: "",
        is_public: false,
    });
    const [loading, setLoading] = useState(false);

    // Fetch announcements from API
    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const res = await axios.get("/instructor/announcements");
                setAnnouncements(res.data.announcements || []);
            } catch (err) {
                console.error("Error fetching announcements:", err);
            }
        };
        fetchAnnouncements();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post("/instructor/announcements", formData);
            setAnnouncements((prev) => [res.data.announcement, ...prev]);
            setFormData({
                title: "",
                message: "",
                class_id: "",
                class_code: "",
                is_public: false,
            });
        } catch (err) {
            console.error("Error posting announcement:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Instructor>
            <div className="p-6 max-w-3xl mx-auto space-y-6">
                <h1 className="text-2xl font-semibold text-gray-800">
                    Announcements
                </h1>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-6 rounded-2xl shadow-md space-y-4"
                >
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Title"
                        className="w-full border px-3 py-2 rounded-md"
                        required
                    />

                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Write your announcement..."
                        className="w-full border px-3 py-2 rounded-md"
                        rows="4"
                        required
                    />

                    <input
                        type="text"
                        name="class_code"
                        value={formData.class_code}
                        onChange={handleChange}
                        placeholder="Class Code (optional)"
                        className="w-full border px-3 py-2 rounded-md"
                    />

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="is_public"
                            checked={formData.is_public}
                            onChange={handleChange}
                        />
                        <span className="text-sm text-gray-700">
                            Make this public
                        </span>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                    >
                        {loading ? "Posting..." : "Post Announcement"}
                    </button>
                </form>

                {/* Display announcements */}
                <div className="space-y-4">
                    {announcements.length === 0 ? (
                        <p className="text-gray-500 text-center mt-4">
                            No announcements yet.
                        </p>
                    ) : (
                        announcements.map((a) => (
                            <div
                                key={a.id}
                                className="bg-white border rounded-xl p-4 shadow-sm"
                            >
                                <h3 className="font-semibold text-gray-800">
                                    {a.title}
                                </h3>
                                <p className="text-gray-600 mt-1">
                                    {a.message}
                                </p>
                                <div className="text-xs text-gray-500 mt-2">
                                    {a.class
                                        ? `Class: ${a.class.name}`
                                        : a.is_public
                                        ? "Public"
                                        : "Private"}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Instructor>
    );
}
