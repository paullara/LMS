import { useState, useEffect } from "react";
import axios from "axios";

export default function StudentQuiz({ classId }) {
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [studentAnswers, setStudentAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [returnedQuizzes, setReturnedQuizzes] = useState([]);

    // Timer states
    const [timeLeft, setTimeLeft] = useState(null);
    const [timeUp, setTimeUp] = useState(false);
    const [showReturned, setShowReturned] = useState(false);

    useEffect(() => {
        const fetchReturnedQuizzes = async () => {
            try {
                const res = await axios.get(
                    `/classes/${classId}/returned-quizzes`
                );
                setReturnedQuizzes(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error(err);
            }
        };

        if (classId) fetchReturnedQuizzes();
    }, [classId]);

    // Fetch quizzes
    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await axios.get(`/student/quizzes/${classId}`);
                setQuizzes(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch quizzes.");
            } finally {
                setLoading(false);
            }
        };

        if (classId) fetchQuizzes();
    }, [classId]);

    // Open quiz safely and initialize timer
    const handleOpenQuiz = (quiz) => {
        setSelectedQuiz(quiz);

        // Initialize answers
        const initialAnswers = {};
        if (Array.isArray(quiz.questions)) {
            quiz.questions.forEach((q) => {
                initialAnswers[q.id] = "";
            });
        }
        setStudentAnswers(initialAnswers);

        // Initialize timer
        const now = new Date().getTime();
        const endsAt = new Date(quiz.ends_at).getTime();
        const remaining = Math.max(0, Math.floor((endsAt - now) / 1000));

        setTimeLeft(remaining);
        setTimeUp(remaining === 0);
    };

    // Countdown timer
    useEffect(() => {
        if (!selectedQuiz || timeUp || timeLeft === null) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const endsAt = new Date(selectedQuiz.ends_at).getTime();
            const remaining = Math.max(0, Math.floor((endsAt - now) / 1000));

            setTimeLeft(remaining);

            if (remaining === 0) {
                clearInterval(interval);
                setTimeUp(true);
                handleSubmit(); // auto-submit
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [selectedQuiz, timeUp]);

    const handleAnswer = (questionId, value) => {
        setStudentAnswers((prev) => ({
            ...prev,
            [questionId]: value,
        }));
    };

    const handleSubmit = async () => {
        if (!selectedQuiz) return;

        try {
            await axios.post(`/quizzes/${selectedQuiz.id}/submit`, {
                answers: studentAnswers,
            });
            alert("Quiz submitted successfully!");
            setSelectedQuiz(null);
            setStudentAnswers({});
            setTimeLeft(null);
            setTimeUp(false);
        } catch (err) {
            console.error(err.response?.data || err.message);
            alert("Failed to submit quiz.");
        }
    };

    if (loading) return <p>Loading quizzes...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    // Quiz list view
    if (!selectedQuiz) {
        return (
            <div className="space-y-4">
                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => setShowReturned(!showReturned)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                        {showReturned
                            ? "Hide Returned Quizzes"
                            : "Show Returned Quizzes"}
                    </button>
                </div>
                {showReturned && (
                    <div className="mt-8">
                        <h2 className="text-xl font-bold mb-4">
                            Returned Quizzes
                        </h2>
                        <div className="space-y-4">
                            {returnedQuizzes.map((quiz) => (
                                <div
                                    key={quiz.id}
                                    className="p-4 border rounded bg-green-50 cursor-pointer hover:bg-green-100"
                                    onClick={() => handleOpenReturnedQuiz(quiz)}
                                >
                                    <h3 className="font-semibold">
                                        {quiz.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm">
                                        Returned at:{" "}
                                        {new Date(
                                            quiz.returned_at
                                        ).toLocaleString()}
                                    </p>
                                    {quiz.score !== null && (
                                        <p className="text-sm text-green-700">
                                            Score: {quiz.score} /{" "}
                                            {quiz.max_score}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {quizzes.length === 0 && <p>No quizzes available.</p>}
                {quizzes.map((quiz) => (
                    <div
                        key={quiz.id}
                        className={`p-4 border rounded shadow cursor-pointer ${
                            quiz.submitted
                                ? "bg-gray-100 cursor-not-allowed"
                                : "hover:shadow-md"
                        }`}
                        onClick={() => !quiz.submitted && handleOpenQuiz(quiz)}
                    >
                        <h3 className="font-semibold text-lg">{quiz.title}</h3>
                        <p className="text-gray-500 text-sm">
                            {quiz.description || "No description available."}
                        </p>
                        <p className="text-sm text-gray-400">
                            {quiz.submitted
                                ? "Already Submitted"
                                : "Not Submitted"}
                        </p>
                    </div>
                ))}
            </div>
        );
    }
    // Selected quiz view
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">{selectedQuiz.title}</h2>

            {/* Timer */}
            <div className="text-right font-semibold text-red-600">
                {timeUp
                    ? "Time's up!"
                    : `Time Left: ${Math.floor(timeLeft / 60)}:${String(
                          timeLeft % 60
                      ).padStart(2, "0")}`}
            </div>

            {Array.isArray(selectedQuiz.questions) &&
                selectedQuiz.questions.map((q, idx) => (
                    <div key={q.id} className="border rounded p-4 bg-gray-50">
                        <p className="font-medium mb-2">
                            {idx + 1}. {q.question_text}
                        </p>

                        {/* Multiple Choice */}
                        {q.type === "mcq" &&
                            Array.isArray(q.choices) &&
                            q.choices.map((choice) => (
                                <label
                                    key={choice.id}
                                    className="flex items-center gap-2"
                                >
                                    <input
                                        type="radio"
                                        name={`question_${q.id}`}
                                        value={choice.choice_text}
                                        checked={
                                            studentAnswers[q.id] ===
                                            choice.choice_text
                                        }
                                        onChange={() =>
                                            handleAnswer(
                                                q.id,
                                                choice.choice_text
                                            )
                                        }
                                        className="text-purple-600"
                                        disabled={timeUp}
                                    />
                                    <span>{choice.choice_text}</span>
                                </label>
                            ))}

                        {/* Identification */}
                        {q.type === "identification" && (
                            <input
                                type="text"
                                value={studentAnswers[q.id] || ""}
                                onChange={(e) =>
                                    handleAnswer(q.id, e.target.value)
                                }
                                className="w-full border rounded p-2"
                                placeholder="Type your answer"
                                disabled={timeUp}
                            />
                        )}

                        {/* Essay */}
                        {q.type === "essay" && (
                            <textarea
                                value={studentAnswers[q.id] || ""}
                                onChange={(e) =>
                                    handleAnswer(q.id, e.target.value)
                                }
                                className="w-full border rounded p-2"
                                placeholder="Write your essay answer"
                                disabled={timeUp}
                            />
                        )}
                    </div>
                ))}

            <button
                onClick={handleSubmit}
                disabled={timeUp}
                className={`w-full py-3 rounded-lg text-white ${
                    timeUp ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
                }`}
            >
                Submit Quiz
            </button>

            <button
                onClick={() => setSelectedQuiz(null)}
                className="w-full py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
                Back to Quizzes
            </button>
        </div>
    );
}
