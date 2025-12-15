import { useEffect, useState } from "react";
import axios from "axios";

export default function ReturnedQuiz({ classId }) {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedQuiz, setSelectedQuiz] = useState(null);

    useEffect(() => {
        axios
            .get(`/classes/${classId}/returned-quizzes`)
            .then((res) => setQuizzes(res.data))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [classId]);

    if (loading) return <p className="text-gray-500">Loading quizzes...</p>;
    if (quizzes.length === 0)
        return <p className="text-gray-500">No returned quizzes yet.</p>;

    return (
        <div className="flex max-w-6xl mx-auto h-[80vh] gap-4">
            {/* Left: Quiz List */}
            <div className="w-1/3 overflow-y-auto border rounded-lg bg-white shadow-sm">
                <h2 className="text-xl font-semibold p-4 border-b">
                    Returned Quizzes
                </h2>
                <ul>
                    {quizzes.map((quiz) => (
                        <li
                            key={quiz.id}
                            onClick={() => setSelectedQuiz(quiz)}
                            className={`cursor-pointer p-4 border-b hover:bg-gray-50 ${
                                selectedQuiz?.id === quiz.id
                                    ? "bg-gray-100 font-semibold"
                                    : ""
                            }`}
                        >
                            <p className="text-gray-800">{quiz.title}</p>
                            <p className="text-gray-500 text-sm">
                                Score: {quiz.score} / {quiz.max_score}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Right: Selected Quiz Details */}
            <div className="w-2/3 overflow-y-auto border rounded-lg bg-white shadow-sm p-4">
                {selectedQuiz ? (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            {selectedQuiz.title}
                        </h2>
                        <p className="text-gray-500 mb-4">
                            Returned at:{" "}
                            {new Date(
                                selectedQuiz.returned_at
                            ).toLocaleString()}
                        </p>
                        <p className="text-gray-700 mb-4">
                            {selectedQuiz.description}
                        </p>
                        <h3 className="font-semibold mb-2">
                            Questions & Answers:
                        </h3>
                        <ul className="space-y-3">
                            {selectedQuiz.questions.map((q) => {
                                const answer = selectedQuiz.answers.find(
                                    (a) => a.question_id === q.id
                                );
                                return (
                                    <li
                                        key={q.id}
                                        className="p-3 bg-gray-50 rounded shadow-sm"
                                    >
                                        <p className="font-medium text-gray-800">
                                            {q.question_text}
                                        </p>
                                        <p className="text-gray-600 mt-1">
                                            Your Answer:{" "}
                                            {answer?.answer_text ||
                                                "Not answered"}
                                        </p>
                                        <p className="text-gray-600 text-sm mt-1">
                                            Points:{" "}
                                            {answer?.points_awarded ?? 0} /{" "}
                                            {q.points}
                                        </p>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ) : (
                    <p className="text-gray-500">
                        Select a quiz from the list to view details.
                    </p>
                )}
            </div>
        </div>
    );
}
