import Chairman from "@/Layouts/Chairman";
import { useState, useEffect } from "react";
import axios from "axios";
import InputError from "@/Components/InputError";

export default function CreateClasses() {
    const [instructors, setInstructors] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        // description: "",
        subcode: "",
        start_time: "",
        end_time: "",
        instructor_id: "",
        yearlevel: "",
        section: "",
        program: "",
        day: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchInstructors = async () => {
            try {
                const res = await axios.get("/chairman/get/instructors");
                setInstructors(res.data.instructors);
            } catch (err) {
                console.error("Error fetching instructors");
            }
        };

        fetchInstructors();
        const interval = setInterval(fetchInstructors, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            await axios.post("/chairman/classes/draft", formData);

            alert("Class created successfully!");

            setFormData({
                name: "",
                // description: "",
                subcode: "",
                start_time: "",
                end_time: "",
                instructor_id: "",
                yearlevel: "",
                section: "",
                program: "",
                day: "",
            });
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Chairman>
            <div className="max-w-4xl mx-auto px-6 py-10">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-700">
                        Create New Class
                    </h2>

                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {/* LEFT */}
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                    Course Title
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="border rounded-lg p-3 w-full"
                                    placeholder="e.g., Data Structures"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                    Course Code
                                </label>
                                <input
                                    type="text"
                                    name="subcode"
                                    value={formData.subcode}
                                    onChange={handleChange}
                                    className="border rounded-lg p-3 w-full"
                                    placeholder="e.g., CS101"
                                />
                                <InputError message={errors.subcode} />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                    Day
                                </label>
                                <select
                                    name="day"
                                    value={formData.day}
                                    onChange={handleChange}
                                    className="border rounded-lg p-3 w-full"
                                >
                                    <option value="">Select Day</option>
                                    {[
                                        "Monday",
                                        "Tuesday",
                                        "Wednesday",
                                        "Thursday",
                                        "Friday",
                                        "Saturday",
                                        "Sunday",
                                    ].map((d) => (
                                        <option key={d} value={d}>
                                            {d}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.day} />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                    Instructor
                                </label>
                                <select
                                    name="instructor_id"
                                    value={formData.instructor_id}
                                    onChange={handleChange}
                                    className="border rounded-lg p-3 w-full"
                                >
                                    <option value="">Select Instructor</option>
                                    {instructors.map((inst) => (
                                        <option key={inst.id} value={inst.id}>
                                            {inst.firstname} {inst.lastname}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.instructor_id} />
                            </div>
                        </div>

                        {/* RIGHT */}
                        <div className="space-y-5">
                            {/* <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="border rounded-lg p-3 w-full h-24"
                                    placeholder="Class description..."
                                />
                                <InputError message={errors.description} />
                            </div> */}

                            <div className="flex gap-4">
                                <div className="w-full">
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Year Level
                                    </label>
                                    <input
                                        type="number"
                                        name="yearlevel"
                                        value={formData.yearlevel}
                                        onChange={handleChange}
                                        className="border rounded-lg p-3 w-full"
                                        placeholder="e.g., 3"
                                    />
                                    <InputError message={errors.yearlevel} />
                                </div>

                                <div className="w-full">
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Section
                                    </label>
                                    <input
                                        type="text"
                                        name="section"
                                        value={formData.section}
                                        onChange={handleChange}
                                        className="border rounded-lg p-3 w-full"
                                        placeholder="e.g., A"
                                    />
                                    <InputError message={errors.section} />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-full">
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Start Time
                                    </label>
                                    <input
                                        type="time"
                                        name="start_time"
                                        value={formData.start_time}
                                        onChange={handleChange}
                                        className="border rounded-lg p-3 w-full"
                                    />
                                </div>

                                <div className="w-full">
                                    <label className="block text-sm text-gray-600 mb-1">
                                        End Time
                                    </label>
                                    <input
                                        type="time"
                                        name="end_time"
                                        value={formData.end_time}
                                        onChange={handleChange}
                                        className="border rounded-lg p-3 w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SUBMIT BUTTON */}
                        <div className="col-span-1 md:col-span-2 flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 text-white py-3 px-8 rounded-lg text-lg"
                            >
                                {loading ? "Creating..." : "Create Class"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Chairman>
    );
}
