import Chairman from "@/Layouts/Chairman";
import { useState, useEffect } from "react";
import axios from "axios";
import InputError from "@/Components/InputError";

export default function CreateClasses() {
    const [instructors, setInstructors] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        subcode: "",
        start_time: "",
        end_time: "",
        instructor_id: "",
        // photo: null,
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
                console.error("Error fetching instructors", err);
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
                description: "",
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
            } else {
                console.error("Error creating class:", err);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Chairman>
            <div className="p-8 max-w-5xl mx-auto bg-white rounded-2xl shadow-lg">
                <h1 className="text-2xl font-semibold mb-6 text-gray-800">
                    Create New Classroom
                </h1>

                <form
                    onSubmit={handleSubmit}
                    encType="multipart/form-data"
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    {/* LEFT SIDE - Important Fields */}
                    <div className="space-y-4">
                        <div>
                            <input
                                type="text"
                                name="name"
                                placeholder="Course Title"
                                value={formData.name}
                                onChange={handleChange}
                                className="border rounded-lg p-2 w-full"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div>
                            <input
                                type="text"
                                name="subcode"
                                placeholder="Course Code"
                                value={formData.subcode}
                                onChange={handleChange}
                                className="border rounded-lg p-2 w-full"
                            />
                            <InputError message={errors.subcode} />
                        </div>

                        <div className="flex gap-3">
                            <input
                                type="time"
                                name="start_time"
                                value={formData.start_time}
                                onChange={handleChange}
                                className="border rounded-lg p-2 w-1/2"
                            />
                            <input
                                type="time"
                                name="end_time"
                                value={formData.end_time}
                                onChange={handleChange}
                                className="border rounded-lg p-2 w-1/2"
                            />
                        </div>
                        <InputError
                            message={errors.start_time || errors.end_time}
                        />

                        <select
                            name="day"
                            value={formData.day}
                            onChange={handleChange}
                            className="border rounded-lg p-2 w-full"
                        >
                            <option value="">Select Day</option>
                            <option value="Monday">Monday</option>
                            <option value="Tuesday">Tuesday</option>
                            <option value="Wednesday">Wednesday</option>
                            <option value="Thursday">Thursday</option>
                            <option value="Friday">Friday</option>
                            <option value="Saturday">Saturday</option>
                            <option value="Sunday">Sunday</option>
                        </select>
                        <InputError message={errors.day} />

                        <select
                            name="instructor_id"
                            value={formData.instructor_id}
                            onChange={handleChange}
                            className="border rounded-lg p-2 w-full"
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

                    {/* RIGHT SIDE - Less Important Fields */}
                    <div className="space-y-4">
                        <textarea
                            name="description"
                            placeholder="Description"
                            value={formData.description}
                            onChange={handleChange}
                            className="border rounded-lg p-2 w-full h-24"
                        />
                        <InputError message={errors.description} />

                        <div className="flex w-full items-center justify-between">
                            <div>
                                <input
                                    type="number"
                                    name="yearlevel"
                                    placeholder="Year Level"
                                    value={formData.yearlevel}
                                    onChange={handleChange}
                                    className="border rounded-lg p-2 w-full"
                                />
                                <InputError message={errors.yearlevel} />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    name="section"
                                    placeholder="Section"
                                    value={formData.section}
                                    onChange={handleChange}
                                    className="border rounded-lg p-2 w-full"
                                />
                                <InputError message={errors.section} />
                            </div>
                        </div>
                        {/* <input
                            type="file"
                            name="photo"
                            accept="image/*"
                            onChange={handleChange}
                            className="border rounded-lg p-2 w-full"
                        />
                        <InputError message={errors.photo} />
                        <div className="mt-2 w-full h-40 border border-solid border-gray-400 rounded flex items-center justify-center overflow-hidden">
                            {formData.photo ? (
                                <img
                                    src={URL.createObjectURL(formData.photo)}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-gray-500">
                                    No image selected
                                </span>
                            )}
                        </div> */}
                    </div>

                    {/* Full width submit button */}
                    <div className="col-span-1 md:col-span-2 flex justify-end mt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-200"
                        >
                            {loading ? "Creating..." : "Create Class"}
                        </button>
                    </div>
                </form>
            </div>
        </Chairman>
    );
}
