export default function ClassesTable({ classes, formatTime }) {
    if (classes.length === 0) return <p>No Classes</p>;

    return (
        <div className="w-full overflow-x-auto rounded-lg shadow-sm bg-white">
            <table className="w-full border-collapse">
                <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
                    <tr>
                        <th className="px-4 py-3 text-left">Course Title</th>
                        <th className="px-4 py-3 text-left">Course Code</th>
                        <th className="px-4 py-3 text-left">Schedule</th>
                        <th className="px-4 py-3 text-left">Instructor</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                    {classes.map((cls) => (
                        <tr key={cls.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">{cls.name}</td>
                            <td className="px-4 py-3">{cls.subcode}</td>
                            <td className="px-4 py-3">
                                {cls.day} • {formatTime(cls.start_time)} -{" "}
                                {formatTime(cls.end_time)}
                            </td>
                            <td className="px-4 py-3">
                                {cls.instructor
                                    ? `${cls.instructor.firstname} ${cls.instructor.lastname}`
                                    : "—"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
