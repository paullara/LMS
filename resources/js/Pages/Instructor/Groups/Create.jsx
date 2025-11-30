import Instructor from "@/Layouts/InstructorLayout";
import { useForm } from "@inertiajs/react";

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("instructor.groups.store"));
    };

    return (
        <Instructor>
            <div className="p-6 max-w-xl">
                <h1 className="text-2xl font-semibold mb-4">Create Group</h1>

                <form onSubmit={submit} className="bg-white shadow rounded p-4">
                    <label className="block mb-2">Group Name</label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        className="border p-2 w-full rounded"
                    />
                    {errors.name && (
                        <p className="text-red-500 text-sm">{errors.name}</p>
                    )}

                    <button
                        disabled={processing}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        Create
                    </button>
                </form>
            </div>
        </Instructor>
    );
}
