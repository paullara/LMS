import { useState, useEffect } from "react";
import axios from "axios";

export default function Average({ classId }) {
    const [data, setData] = useState({ columns: [], rows: [] });

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const res = await axios.get(`/student/${classId}/grade`);
                setData(res.data);
            } catch (error) {
                console.error("Error fetching grades", error);
            }
        };

        fetchGrades();
    }, [classId]);

    return (
        <div>
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            {data.columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className="px-4 py-2 border border-gray-300 text-left"
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.rows.map((row, rIdx) => (
                            <tr key={rIdx}>
                                {data.columns.map((col, cIdx) => (
                                    <td
                                        key={cIdx}
                                        className="px-4 py-2 border border-gray-300"
                                    >
                                        {row[col]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
