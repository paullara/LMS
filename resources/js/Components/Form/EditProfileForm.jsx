import { useForm } from "@inertiajs/react";
import { useState } from "react";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import TextInput from "@/Components/TextInput";
import axios from "axios";

export default function EditProfileForm({ user, authUser, onCancel }) {
    const isInstructor =
        authUser.role === "chairman" || authUser.role === "instructor";
    const isStudent = authUser.role === "student";

    const [form, setForm] = useState({
        firstname: user.firstname || "",
        middlename: user.middlename || "",
        lastname: user.lastname || "",
        email: user.email || "",
        contact_number: user.contact_number || "",
        specialization: user.specialization || "",
        bio: user.bio || "",
        profile_picture: null,
        address: user.address || "",
        city: user.city || "",
        zipcode: user.zipcode || "",
        course: user.course || "",
        campus: user.campus || "",
        year_level: user.year_level || "",
        student_id: !isInstructor ? user.student_id || "" : "",
        teacher_id: isInstructor ? user.teacher_id || "" : "",
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "profile_picture") {
            setForm({ ...form, profile_picture: files[0] });
        } else if (name === "year_level") {
            setForm({ ...form, year_level: Number(value) });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const formData = new FormData();
        Object.keys(form).forEach((key) => {
            if (isInstructor) {
                if (key === "student_id" || key === "year_level") return;
            } else {
                if (key === "teacher_id") return;
            }

            if (form[key] !== null) formData.append(key, form[key]);
        });

        try {
            const res = await axios.post(
                `/profile/update/${user.id}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            alert(res.data.message);
            setRecentlySuccessful(true);
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            }
            console.error(err.response?.data || err.message);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* ------------------ PERSONAL INFO ------------------ */}
            <div className="border rounded-md p-4">
                <h2 className="text-lg font-semibold mb-3">
                    Personal Information
                </h2>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="firstname" value="First Name" />
                        <TextInput
                            id="firstname"
                            name="firstname"
                            value={form.firstname}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full"
                        />
                        <InputError
                            className="mt-2"
                            message={errors.firstname}
                        />
                    </div>
                    <div>
                        <InputLabel htmlFor="lastname" value="Last Name" />
                        <TextInput
                            id="lastname"
                            name="lastname"
                            value={form.lastname}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full"
                        />
                        <InputError
                            className="mt-2"
                            message={errors.lastname}
                        />
                    </div>
                    <div>
                        <InputLabel
                            htmlFor="contact_number"
                            value="Contact Number"
                        />
                        <TextInput
                            id="contact_number"
                            name="contact_number"
                            value={form.contact_number}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full"
                        />
                        <InputError
                            className="mt-2"
                            message={errors.contact_number}
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full"
                        />
                        <InputError className="mt-2" message={errors.email} />
                    </div>
                    {isInstructor ? (
                        <div>
                            <InputLabel
                                htmlFor="teacher_id"
                                value="Instructor ID"
                            />
                            <TextInput
                                id="teacher_id"
                                name="teacher_id"
                                value={form.teacher_id}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full"
                            />
                            <InputError
                                className="mt-2"
                                message={errors.teacher_id}
                            />
                        </div>
                    ) : (
                        <div>
                            <InputLabel
                                htmlFor="student_id"
                                value="Student ID"
                            />
                            <TextInput
                                id="student_id"
                                name="student_id"
                                value={form.student_id}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full"
                            />
                            <InputError
                                className="mt-2"
                                message={errors.student_id}
                            />
                        </div>
                    )}

                    <div>
                        <InputLabel
                            htmlFor="profile_picture"
                            value="Profile Picture"
                        />
                        <input
                            type="file"
                            id="profile_picture"
                            name="profile_picture"
                            accept="image/*"
                            onChange={handleChange}
                            className="mt-1 block w-full"
                        />
                        <InputError
                            className="mt-2"
                            message={errors.profile_picture}
                        />
                    </div>
                </div>
            </div>

            {/* ------------------ ADDRESS INFO ------------------ */}
            <div className="border rounded-md p-4">
                <h2 className="text-lg font-semibold mb-3">
                    Address Information
                </h2>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="address" value="Address" />
                        <TextInput
                            id="address"
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full"
                        />
                        <InputError className="mt-2" message={errors.address} />
                    </div>

                    <div>
                        <InputLabel htmlFor="city" value="City" />
                        <TextInput
                            id="city"
                            name="city"
                            value={form.city}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full"
                        />
                        <InputError className="mt-2" message={errors.city} />
                    </div>

                    <div>
                        <InputLabel htmlFor="zipcode" value="ZipCode" />
                        <TextInput
                            id="zipcode"
                            name="zipcode"
                            value={form.zipcode}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full"
                        />
                        <InputError className="mt-2" message={errors.zipcode} />
                    </div>
                </div>
            </div>

            {/* ------------------ SCHOOL DETAILS ------------------ */}
            <div className="border rounded-md p-4">
                <h2 className="text-lg font-semibold mb-3">School Details</h2>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="course" value="Course" />
                        <TextInput
                            id="course"
                            name="course"
                            value={form.course}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full"
                        />
                        <InputError className="mt-2" message={errors.course} />
                    </div>

                    <div>
                        <InputLabel htmlFor="campus" value="Campus" />
                        <TextInput
                            id="campus"
                            name="campus"
                            value={form.campus}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full"
                        />
                        <InputError className="mt-2" message={errors.campus} />
                    </div>
                    {isStudent && (
                        <div>
                            <input
                                type="number"
                                id="year_level"
                                name="year_level"
                                min="1"
                                max="4"
                                value={form.year_level}
                                onChange={handleChange}
                                className="mt-1 block w-full border rounded-md p-2"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* ------------------ ACTION BUTTONS ------------------ */}
            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={processing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
                >
                    Save Changes
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-300 rounded-md"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

/* ------------------------------ REUSABLE INPUT ------------------------------ */
function Input({ label, type = "text", value, onChange, error, ...props }) {
    return (
        <div className="flex flex-col">
            <label className="text-sm mb-1 text-gray-700">{label}</label>

            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="border rounded-md p-2"
                {...props}
            />

            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </div>
    );
}
