import { useState, useEffect } from "react";
import axios from "axios";

export default function Quiz({ classId }) {
    const [quizList, setQuizList] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [studentAnswers, setStudentAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);
    const [quizSubmissions, setQuizSubmissions] = useState([]);
    const [finishedQuizIds, setFinishQuizIds] = useState([]);

    // Fetch quizzes
    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const res = await axios.get(`/quizzes/${classId}`);
                setQuizList(res.data.quizzes);
            } catch (err) {
                console.error("Error fetching quizzes", err);
            }
        };
        fetchQuizzes();
    }, [classId]);

    // Fetch submissions and auto-refresh
    useEffect(() => {
        const fetchQuizSubmission = async () => {
            try {
                const res = await axios.get("/submissions/quiz");
                setQuizSubmissions(res.data.quizSubmissions);
            } catch (error) {
                console.error("Error fetching submissions", error);
            }
        };

        fetchQuizSubmission();
        const interval = setInterval(fetchQuizSubmission, 2000);
        return () => clearInterval(interval);
    }, []);

    // Update finished quiz IDs whenever submissions update
    useEffect(() => {
        const finishedIds = quizSubmissions
            .filter((sub) => sub.status === "finished" && sub.quiz_id)
            .map((sub) => sub.quiz_id);
        setFinishQuizIds(finishedIds);
    }, [quizSubmissions]);

    // Open quiz
    const handleOpenQuiz = (quiz) => {
        setSelectedQuiz(quiz);

        // Initialize answers
        const initialAnswers = {};
        quiz.questions.forEach((q) => {
            initialAnswers[q.id] = "";
        });
        setStudentAnswers(initialAnswers);

        // Timer
        const duration = quiz.duration_minutes * 60;
        setTimeLeft(duration);
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmitAnswers(quiz.id);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    };

    // Select an MCQ choice
    const handleSelectChoice = (questionId, choiceLabel) => {
        setStudentAnswers((prev) => ({
            ...prev,
            [questionId]: choiceLabel,
        }));
    };

    // Submit quiz
    const handleSubmitAnswers = async (quizId) => {
        try {
            await axios.post(`/quizzes/${quizId}/submit`, {
                answers: studentAnswers,
            });

            alert("Quiz submitted successfully!");
            setSelectedQuiz(null);
            setStudentAnswers({});
            setTimeLeft(null);
        } catch (err) {
            console.error(
                "Submission failed:",
                err.response?.data || err.message
            );
        }
    };

    // Format timer
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60)
            .toString()
            .padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    return (
        <div className="w-full mx-auto">
            <h2 className="text-lg font-bold mb-2">Available Quizzes</h2>
            {quizList.length === 0 ? (
                <div className="text-gray-500">No quizzes yet.</div>
            ) : (
                <ul className="space-y-4">
                    {quizList.map((quiz) => {
                        const isFinished = finishedQuizIds.includes(quiz.id);
                        const now = new Date();
                        const quizEndTime = new Date(quiz.end_time);
                        const isExpired = now > quizEndTime;

                        return (
                            <li
                                key={quiz.id}
                                className="border rounded p-4 bg-gray-50"
                            >
                                <h3 className="font-semibold text-purple-700">
                                    {quiz.title}
                                </h3>
                                <p className="text-gray-500 text-sm mb-1">
                                    {quiz.description}
                                </p>

                                <button
                                    className={`mt-2 px-4 py-1 rounded text-md text-white ${
                                        isFinished || isExpired
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-blue-500"
                                    }`}
                                    onClick={() => handleOpenQuiz(quiz)}
                                    disabled={isFinished || isExpired}
                                >
                                    {isFinished
                                        ? "Finished"
                                        : isExpired
                                        ? "Expired"
                                        : "Open"}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}

            {/* Modal Quiz */}
            {selectedQuiz && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl p-8 overflow-y-auto max-h-[90vh]">
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"
                            onClick={() => {
                                setSelectedQuiz(null);
                                setStudentAnswers({});
                                setTimeLeft(null);
                            }}
                        >
                            ✕
                        </button>

                        <div className="border-b pb-4 mb-6">
                            <h2 className="text-2xl font-bold text-purple-700">
                                {selectedQuiz.title}
                            </h2>
                            <p className="text-gray-500">
                                {selectedQuiz.description}
                            </p>
                        </div>

                        {timeLeft !== null && (
                            <div className="mb-6 text-lg font-semibold text-red-600 bg-red-100 rounded-lg px-4 py-2 inline-block">
                                ⏳ Time Remaining: {formatTime(timeLeft)}
                            </div>
                        )}

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSubmitAnswers(selectedQuiz.id);
                            }}
                            className="space-y-6"
                        >
                            {selectedQuiz.questions.map((question, idx) => (
                                <div
                                    key={question.id}
                                    className="border rounded-lg p-4 bg-gray-50 shadow-sm"
                                >
                                    <p className="font-medium text-gray-800 mb-3">
                                        {idx + 1}. {question.question_text}
                                    </p>

                                    <div className="space-y-2">
                                        {/* Multiple Choice */}
                                        {question.type === "multiple_choice" &&
                                            question.choices.map((choice) => (
                                                <label
                                                    key={choice.label}
                                                    className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-100 transition"
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`question_${question.id}`}
                                                        value={choice.label}
                                                        checked={
                                                            studentAnswers[
                                                                question.id
                                                            ] === choice.label
                                                        }
                                                        onChange={() =>
                                                            handleSelectChoice(
                                                                question.id,
                                                                choice.label
                                                            )
                                                        }
                                                        className="text-purple-600 focus:ring-purple-500"
                                                    />
                                                    <span className="text-gray-700">
                                                        <span className="font-semibold">
                                                            {choice.label}.
                                                        </span>{" "}
                                                        {choice.text}
                                                    </span>
                                                </label>
                                            ))}

                                        {/* Identification */}
                                        {question.type === "identification" && (
                                            <input
                                                type="text"
                                                name={`question_${question.id}`}
                                                value={
                                                    studentAnswers[
                                                        question.id
                                                    ] || ""
                                                }
                                                onChange={(e) =>
                                                    setStudentAnswers(
                                                        (prev) => ({
                                                            ...prev,
                                                            [question.id]:
                                                                e.target.value,
                                                        })
                                                    )
                                                }
                                                className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                placeholder="Type your answer here"
                                            />
                                        )}

                                        {/* Essay */}
                                        {question.type === "essay" && (
                                            <textarea
                                                name={`question_${question.id}`}
                                                value={
                                                    studentAnswers[
                                                        question.id
                                                    ] || ""
                                                }
                                                onChange={(e) =>
                                                    setStudentAnswers(
                                                        (prev) => ({
                                                            ...prev,
                                                            [question.id]:
                                                                e.target.value,
                                                        })
                                                    )
                                                }
                                                className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                placeholder="Write your essay here"
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}

                            <button
                                type="submit"
                                className="w-full py-3 rounded-lg font-semibold bg-green-600 hover:bg-green-700 text-white shadow"
                            >
                                Submit Quiz
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
