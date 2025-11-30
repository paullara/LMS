import Instructor from "@/Layouts/InstructorLayout";
import { Link } from "@inertiajs/react";

export default function Index({ groups }) {
    return (
        <Instructor>
            <div className="p-6">
                <div className="flex justify-between mb-4">
                    <h1 className="text-2xl font-semibold">My Groups</h1>

                    <Link
                        href={route("instructor.groups.create")}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        Create Group
                    </Link>
                </div>

                <div className="bg-white rounded shadow p-4">
                    {groups.length === 0 ? (
                        <p>No groups yet.</p>
                    ) : (
                        groups.map((group) => (
                            <Link
                                key={group.id}
                                href={route("instructor.groups.show", group.id)}
                                className="block p-3 border-b hover:bg-gray-100"
                            >
                                <b>{group.name}</b>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </Instructor>
    );
}
