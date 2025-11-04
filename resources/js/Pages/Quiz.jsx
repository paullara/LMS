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

    // Fetch submissions
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

    // Update finished quiz IDs
    useEffect(() => {
        const finishedIds = quizSubmissions
            .filter((sub) => sub.status === "finished" && sub.quiz_id)
            .map((sub) => sub.quiz_id);
        setFinishQuizIds(finishedIds);
    }, [quizSubmissions]);

    // Handle opening quiz with persistent timer
    const handleOpenQuiz = (quiz) => {
        setSelectedQuiz(quiz);

        const quizKey = `quiz_${quiz.id}_timer`;
        const savedData = JSON.parse(localStorage.getItem(quizKey));

        // Initialize answers
        const initialAnswers = {};
        quiz.questions.forEach((q) => {
            initialAnswers[q.id] = "";
        });
        setStudentAnswers(initialAnswers);

        const duration = quiz.duration_minutes * 60;
        let remainingTime = duration;

        if (savedData && savedData.startTime) {
            const elapsed = Math.floor(
                (Date.now() - savedData.startTime) / 1000
            );
            remainingTime = Math.max(duration - elapsed, 0);
        } else {
            localStorage.setItem(
                quizKey,
                JSON.stringify({ startTime: Date.now() })
            );
        }

        setTimeLeft(remainingTime);
    };

    // Timer countdown with localStorage sync
    useEffect(() => {
        if (!selectedQuiz || timeLeft === null) return;

        if (timeLeft <= 0) {
            handleSubmitAnswers(selectedQuiz.id);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                const newTime = prev - 1;
                if (newTime <= 0) {
                    clearInterval(timer);
                    handleSubmitAnswers(selectedQuiz.id);
                }
                return newTime;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [selectedQuiz, timeLeft]);

    // Format timer
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60)
            .toString()
            .padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    // Select choice
    const handleSelectChoice = (questionId, choiceLabel) => {
        setStudentAnswers((prev) => ({
            ...prev,
            [questionId]: choiceLabel,
        }));
    };

    // Submit answers
    const handleSubmitAnswers = async (quizId) => {
        try {
            await axios.post(`/quizzes/${quizId}/submit`, {
                answers: studentAnswers,
            });

            localStorage.removeItem(`quiz_${quizId}_timer`);
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

    return (
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl mx-auto p-6">
            <div className="md:w-1/3 bg-white rounded-2xl shadow-lg p-6 border border-gray-100 overflow-y-auto max-h-[85vh]">
                <h2 className="text-xl font-bold mb-4 text-purple-700">
                    Available Quizzes
                </h2>
                {quizList.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                        No quizzes available.
                    </p>
                ) : (
                    <ul className="space-y-4">
                        {quizList.map((quiz) => {
                            const isFinished = finishedQuizIds.includes(
                                quiz.id
                            );
                            const now = new Date();
                            const quizEndTime = new Date(quiz.end_time);
                            const isExpired = now > quizEndTime;

                            return (
                                <li
                                    key={quiz.id}
                                    className={`p-4 rounded-xl border shadow-sm transition ${
                                        isFinished
                                            ? "bg-gray-100 border-gray-200"
                                            : "bg-white hover:shadow-md"
                                    }`}
                                >
                                    <h3 className="font-semibold text-purple-700 text-lg">
                                        {quiz.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-2">
                                        {quiz.description}
                                    </p>

                                    <button
                                        className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
                                            isFinished || isExpired
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-blue-500 hover:bg-blue-600"
                                        }`}
                                        onClick={() => handleOpenQuiz(quiz)}
                                        disabled={isFinished || isExpired}
                                    >
                                        {isFinished
                                            ? "Finished"
                                            : isExpired
                                            ? "Expired"
                                            : "Open Quiz"}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* RIGHT: Quiz Answer Area */}
            <div className="md:w-2/3 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                {!selectedQuiz ? (
                    <div className="text-center text-gray-500">
                        <p>Select a quiz to begin.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-6 border-b pb-3">
                            <h2 className="text-2xl font-bold text-purple-700">
                                {selectedQuiz.title}
                            </h2>
                            {timeLeft !== null && (
                                <div className="text-red-600 font-semibold bg-red-100 rounded-lg px-4 py-2">
                                    ⏳ {formatTime(timeLeft)}
                                </div>
                            )}
                        </div>

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

                                        {question.type === "identification" && (
                                            <input
                                                type="text"
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
                                                placeholder="Type your answer"
                                            />
                                        )}

                                        {question.type === "essay" && (
                                            <textarea
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
                                                placeholder="Write your essay answer"
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
                    </>
                )}
            </div>
        </div>
    );
}
