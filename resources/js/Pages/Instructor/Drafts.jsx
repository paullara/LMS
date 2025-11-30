import InstructorLayout from "@/Layouts/InstructorLayout";
import { useForm } from "@inertiajs/react";
import { useState } from "react";

export default function Drafts({ drafts: initialDrafts, options }) {
    const [successMessage, setSuccessMessage] = useState("");

    const { data, setData, post, processing, errors, reset } = useForm({
        id: "", // selected draft
        name: "",
        subcode: "",
        day: "",
        start_time: "",
        end_time: "",
        yearlevel: "",
        section: "",
        description: "",
        photo: null,
    });

    const handleDraftChange = (e) => {
        const draftId = e.target.value;
        const draft = initialDrafts.find((d) => d.id == draftId);

        if (draft) {
            setData({
                id: draft.id,
                name: draft.name,
                subcode: draft.subcode,
                day: draft.day,
                start_time: draft.start_time,
                end_time: draft.end_time,
                yearlevel: draft.yearlevel,
                section: draft.section,
                description: draft.description,
                photo: null,
            });
        } else {
            reset();
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("instructor.classes.complete"), {
            forceFormData: true,
            onSuccess: () => reset(),
            onError: () => setSuccessMessage(""),
        });
    };

    const renderSelectInput = (field, fieldOptions, placeholder) => (
        <div className="flex flex-col">
            <label className="mb-1 font-medium">{placeholder}</label>
            <select
                value={data[field]}
                onChange={(e) => setData(field, e.target.value)}
                className="border rounded p-2 w-full"
            >
                <option value="">Select {placeholder}</option>
                {fieldOptions.map((opt, idx) => (
                    <option key={idx} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
            {errors[field] && <p className="text-red-500">{errors[field]}</p>}
        </div>
    );

    return (
        <InstructorLayout>
            <h1 className="text-2xl font-semibold mb-4">
                Complete Assigned Draft
            </h1>

            {initialDrafts.length === 0 ? (
                <p>No assigned draft classes yet.</p>
            ) : (
                <form
                    onSubmit={submit}
                    className="p-4 bg-white shadow rounded space-y-4"
                >
                    {/* Draft selection */}
                    <div className="flex flex-col">
                        <label className="mb-1 font-medium">
                            Select Draft Class
                        </label>
                        <select
                            value={data.id}
                            onChange={handleDraftChange}
                            className="border rounded p-2 w-full"
                        >
                            <option value="">Choose a class</option>
                            {initialDrafts.map((draft) => (
                                <option key={draft.id} value={draft.id}>
                                    {draft.name}
                                </option>
                            ))}
                        </select>
                        {errors.id && (
                            <p className="text-red-500">{errors.id}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderSelectInput(
                            "name",
                            options.names,
                            "Course Name"
                        )}
                        {renderSelectInput(
                            "subcode",
                            options.subcodes,
                            "Course Code"
                        )}
                        {renderSelectInput("day", options.days, "Day")}
                        <input
                            type="time"
                            value={data.start_time}
                            onChange={(e) =>
                                setData("start_time", e.target.value)
                            }
                            className="border rounded p-2 w-full"
                        />
                        <input
                            type="time"
                            value={data.end_time}
                            onChange={(e) =>
                                setData("end_time", e.target.value)
                            }
                            className="border rounded p-2 w-full"
                        />
                        {renderSelectInput(
                            "yearlevel",
                            options.yearlevels,
                            "Year Level"
                        )}
                        {renderSelectInput(
                            "section",
                            options.sections,
                            "Section"
                        )}
                    </div>

                    <textarea
                        className="w-full border p-2 rounded"
                        placeholder="Add class description"
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                    />

                    <input
                        type="file"
                        onChange={(e) => setData("photo", e.target.files[0])}
                        className="border rounded p-1 w-full"
                    />

                    <button
                        type="submit"
                        disabled={processing || !data.id}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Complete & Publish
                    </button>
                </form>
            )}
        </InstructorLayout>
    );
}
