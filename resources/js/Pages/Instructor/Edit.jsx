import React from "react";
import { useForm } from "@inertiajs/react";
import InstructorLayout from "@/Layouts/InstructorLayout";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";

export default function Edit({ classModel }) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        delete: destroy,
    } = useForm({
        name: classModel.name || "",
        description: classModel.description || "",
        subcode: classModel.subcode || "",
        start_time: classModel.start_time || "",
        end_time: classModel.end_time || "",
        yearlevel: classModel.yearlevel || "",
        section: classModel.section || "",
        photo: null,
        _method: "PUT", // ✅ method spoofing
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        post(`/instructor/classroom/${classModel.id}`, {
            forceFormData: true, // ✅ important for file uploads
            preserveScroll: true,
        });
    };

    return (
        <InstructorLayout>
            <div className="bg-white shadow-md rounded-md p-5">
                <div className="flex items-center gap-3 mb-5">
                    <a href={route("instructor.classList")}>← Back</a>
                    <h1 className="text-2xl font-semibold">Edit Class</h1>
                </div>

                <form
                    onSubmit={handleSubmit}
                    encType="multipart/form-data"
                    className="space-y-4"
                >
                    {classModel.photo && (
                        <div>
                            <img
                                src={`/class/${classModel.photo}`}
                                alt="Current Class Photo"
                                className="w-full h-48 object-cover border rounded mb-2"
                            />
                            <p className="text-sm text-gray-500">
                                Current Photo
                            </p>
                        </div>
                    )}

                    <div>
                        <InputLabel
                            htmlFor="photo"
                            value="Upload New Photo (Optional)"
                        />
                        <input
                            type="file"
                            id="photo"
                            name="photo"
                            onChange={(e) =>
                                setData("photo", e.target.files[0])
                            }
                            className="w-full border rounded px-3 py-2"
                        />
                        <InputError message={errors.photo} />
                    </div>

                    <div>
                        <InputLabel htmlFor="name" value="Class Name" />
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="description" value="Description" />
                        <textarea
                            id="description"
                            value={data.description}
                            onChange={(e) =>
                                setData("description", e.target.value)
                            }
                            className="w-full border rounded px-3 py-2"
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel
                                htmlFor="subcode"
                                value="Subject Code"
                            />
                            <input
                                id="subcode"
                                type="text"
                                name="subcode"
                                value={data.subcode}
                                onChange={(e) =>
                                    setData("subcode", e.target.value)
                                }
                                className="w-full border rounded px-3 py-2"
                            />
                            <InputError message={errors.subcode} />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="yearlevel"
                                value="Year Level"
                            />
                            <input
                                id="yearlevel"
                                type="number"
                                name="yearlevel"
                                value={data.yearlevel}
                                onChange={(e) =>
                                    setData("yearlevel", e.target.value)
                                }
                                className="w-full border rounded px-3 py-2"
                            />
                            <InputError message={errors.yearlevel} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="section" value="Section" />
                            <input
                                id="section"
                                type="text"
                                name="section"
                                value={data.section}
                                onChange={(e) =>
                                    setData("section", e.target.value)
                                }
                                className="w-full border rounded px-3 py-2"
                            />
                            <InputError message={errors.section} />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="start_time"
                                value="Start Time"
                            />
                            <input
                                id="start_time"
                                type="time"
                                name="start_time"
                                value={data.start_time?.slice(0, 5) || ""}
                                onChange={(e) =>
                                    setData(
                                        "start_time",
                                        e.target.value + ":00"
                                    )
                                }
                                className="w-full border rounded px-3 py-2"
                            />
                            <InputError message={errors.start_time} />
                        </div>

                        <div>
                            <InputLabel htmlFor="end_time" value="End Time" />
                            <input
                                id="end_time"
                                type="time"
                                name="end_time"
                                value={data.end_time?.slice(0, 5) || ""}
                                onChange={(e) =>
                                    setData("end_time", e.target.value + ":00")
                                }
                                className="w-full border rounded px-3 py-2"
                            />
                            <InputError message={errors.end_time} />
                        </div>
                    </div>

                    <div className="flex gap-4 mt-5">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            Update
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                if (
                                    window.confirm(
                                        "Are you sure you want to delete this class?"
                                    )
                                ) {
                                    destroy(
                                        `/instructor/classroom/${classModel.id}`
                                    );
                                }
                            }}
                            className="bg-red-500 text-white px-4 py-2 rounded"
                        >
                            Delete
                        </button>
                    </div>
                </form>
            </div>
        </InstructorLayout>
    );
}
