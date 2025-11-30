import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Link } from "@inertiajs/react";
import { Users } from "lucide-react";

export default function Index({ groups }) {
    return (
        <Authenticated>
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                    {groups.length === 0 ? (
                        <div className="flex flex-col items-center py-16 text-gray-400">
                            <Users size={48} className="mb-3 opacity-40" />
                            <p className="text-lg">No groups yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {groups.map((group) => (
                                <Link
                                    key={group.id}
                                    href={route(
                                        "student.groups.show",
                                        group.id
                                    )}
                                    className="
                                        flex items-center justify-between 
                                        p-4 rounded-xl bg-gray-50 
                                        border border-gray-200
                                        transition-all
                                        hover:bg-gray-100 hover:border-blue-300
                                    "
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Users
                                                className="text-blue-600"
                                                size={20}
                                            />
                                        </div>
                                        <div>
                                            <p className="text-lg font-semibold text-gray-800">
                                                {group.name}
                                            </p>
                                        </div>
                                    </div>

                                    <span className="text-blue-600 text-sm font-medium">
                                        Open →
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Authenticated>
    );
}
