import { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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

    const exportToXLSX = () => {
        const rows = data.rows.map((r) =>
            data.columns.reduce((o, col) => {
                o[col] = r[col] ?? "";
                return o;
            }, {})
        );

        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Averages");
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/octet-stream" });
        saveAs(blob, `averages_class_${classId}.xlsx`);
    };

    const exportToCSV = () => {
        const header = data.columns.join(",");
        const rowsCsv = data.rows.map((r) =>
            data.columns
                .map((c) => `"${String(r[c] ?? "").replace(/"/g, '""')}"`)
                .join(",")
        );
        const csv = [header, ...rowsCsv].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `averages_class_${classId}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <div className="flex justify-end mb-3">
                <button
                    onClick={exportToXLSX}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    Export Excel
                </button>
                <button
                    onClick={exportToCSV}
                    className="ml-2 px-4 py-2 bg-green-600 text-white rounded"
                >
                    Export CSV
                </button>
            </div>
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
