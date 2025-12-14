export default function UpcomingList({ upcoming }) {
    if (upcoming.length === 0)
        return <p className="text-gray-500">No upcoming items</p>;

    return (
        <div className="mt-3 flex flex-col gap-3">
            {upcoming.map((item, i) => (
                <div
                    key={i}
                    className="p-3 border rounded-md bg-white shadow-sm"
                >
                    <h2 className="font-semibold">{item.title}</h2>
                    <h2 className="font-semibold">{item.description}</h2>
                    <p className="text-sm text-gray-600">
                        {item.type[0].toUpperCase() + item.type.slice(1)}
                    </p>
                    <p className="text-sm text-gray-800">
                        Due: {new Date(item.deadline).toLocaleString()}
                    </p>
                </div>
            ))}
        </div>
    );
}
