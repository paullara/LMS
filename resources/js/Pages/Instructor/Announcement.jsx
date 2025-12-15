import { useEffect, useState } from "react";
import axios from "axios";
import InstructorLayout from "@/Layouts/InstructorLayout";

export default function AnnouncementCreate() {
    const [classList, setClassList] = useState([]);
    const [classId, setClassId] = useState("");
    const [announcement, setAnnouncement] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");

    useEffect(() => {
        let firstLoad = true;

        const fetchClasses = async () => {
            try {
                if (firstLoad) setLoading(true);

                const res = await axios.get("/instructor/classes/list");

                setClassList(res.data.classList || []);
            } catch (error) {
                console.error("Error fetching classes", error);
            } finally {
                if (firstLoad) {
                    setLoading(false);
                    firstLoad = false;
                }
            }
        };

        fetchClasses();

        const interval = setInterval(fetchClasses, 1000);
        return () => clearInterval(interval);
    }, []);

    const submit = () => {
        setLoading(true);
        setSuccess("");

        axios
            .post("/instructor/announcements", {
                class_id: classId,
                announcement,
            })
            .then(() => {
                setAnnouncement("");
                setClassId("");
                setSuccess("Announcement sent to students 🎉");
            })
            .finally(() => setLoading(false));
    };

    return (
        <InstructorLayout>
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
                <h1 className="text-2xl font-semibold mb-4">
                    Post Announcement
                </h1>

                <label className="block text-sm font-medium mb-1">
                    Select Class
                </label>
                <select
                    className="w-full border rounded p-2 mb-4"
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    disabled={loading}
                >
                    <option value="">-- Select Class --</option>
                    {classList.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                            {cls.name}
                        </option>
                    ))}
                </select>

                <label className="block text-sm font-medium mb-1">
                    Announcement
                </label>
                <textarea
                    rows="4"
                    className="w-full border rounded p-2 mb-4"
                    value={announcement}
                    onChange={(e) => setAnnouncement(e.target.value)}
                />

                <button
                    onClick={submit}
                    disabled={!classId || !announcement || loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    {loading ? "Sending..." : "Send Announcement"}
                </button>

                {success && <p className="text-green-600 mt-3">{success}</p>}
            </div>
        </InstructorLayout>
    );
}
