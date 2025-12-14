import { useState, useEffect } from "react";
import axios from "axios";

export default function StudentQuiz({ classId }) {
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [studentAnswers, setStudentAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [timeLeft, setTimeLeft] = useState(null);
    const [timeUp, setTimeUp] = useState(false);

    const [activeTab, setActiveTab] = useState("available");
    // available | ended | submitted

    /* =========================
       FETCH
    ========================= */
    useEffect(() => {
        if (!classId) return;

        setLoading(true);
        axios
            .get(`/student/quizzes/${classId}`)
            .then((res) => setQuizzes(Array.isArray(res.data) ? res.data : []))
            .catch(() => setError("Failed to fetch quizzes"))
            .finally(() => setLoading(false));
    }, [classId]);

    /* =========================
       OPEN QUIZ
    ========================= */
    const handleOpenQuiz = (quiz) => {
        setSelectedQuiz(quiz);

        const init = {};
        quiz.questions?.forEach((q) => (init[q.id] = ""));
        setStudentAnswers(init);

        const remaining = Math.max(
            0,
            Math.floor((new Date(quiz.ends_at) - new Date()) / 1000)
        );
        setTimeLeft(remaining);
        setTimeUp(remaining === 0);
    };

    /* =========================
       TIMER
    ========================= */
    useEffect(() => {
        if (!selectedQuiz || timeUp || timeLeft === null) return;

        const interval = setInterval(() => {
            const remaining = Math.max(
                0,
                Math.floor((new Date(selectedQuiz.ends_at) - new Date()) / 1000)
            );

            setTimeLeft(remaining);

            if (remaining === 0) {
                clearInterval(interval);
                setTimeUp(true);
                handleSubmit();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [selectedQuiz, timeUp]);

    /* =========================
       SUBMIT
    ========================= */
    const handleSubmit = async () => {
        if (!selectedQuiz) return;

        await axios.post(`/quizzes/${selectedQuiz.id}/submit`, {
            answers: studentAnswers,
        });

        setSelectedQuiz(null);
        setStudentAnswers({});
        setTimeLeft(null);
        setTimeUp(false);
    };

    /* =========================
       FILTERS
    ========================= */
    const now = new Date();

    const availableQuizzes = quizzes.filter(
        (q) =>
            !q.submitted &&
            new Date(q.starts_at) <= now &&
            new Date(q.ends_at) > now
    );

    const endedQuizzes = quizzes.filter(
        (q) => !q.submitted && new Date(q.ends_at) <= now
    );

    const submittedQuizzes = quizzes.filter((q) => q.submitted);

    const list =
        activeTab === "available"
            ? availableQuizzes
            : activeTab === "ended"
            ? endedQuizzes
            : submittedQuizzes;

    if (loading) return <p className="text-center mt-10">Loading…</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    /* =========================
       UI
    ========================= */
    return (
        <div className="h-[calc(100vh-64px)]">
            <div className="max-w-7xl mx-auto h-full grid grid-cols-[360px_1fr] gap-6 p-6">
                {/* ================= LEFT: QUIZ LIST ================= */}
                <div className="bg-white rounded-xl border shadow-sm flex flex-col">
                    {/* Tabs */}
                    <div className="flex gap-2 p-4 border-b">
                        {[
                            ["available", "Available"],
                            ["ended", "Ended"],
                            ["submitted", "Submitted"],
                        ].map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`px-4 py-1.5 text-sm rounded-md transition
                                    ${
                                        activeTab === key
                                            ? "bg-violet-600 text-white"
                                            : "text-gray-600 hover:bg-violet-100"
                                    }
                                `}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {list.map((q) => (
                            <QuizItem
                                key={q.id}
                                quiz={q}
                                active={selectedQuiz?.id === q.id}
                                onClick={() =>
                                    !q.submitted &&
                                    activeTab === "available" &&
                                    handleOpenQuiz(q)
                                }
                                status={activeTab}
                            />
                        ))}

                        {list.length === 0 && (
                            <p className="text-sm text-gray-500 text-center">
                                No quizzes found
                            </p>
                        )}
                    </div>
                </div>

                {/* ================= RIGHT: QUIZ TAKING ================= */}
                <div className="bg-white rounded-xl border shadow-sm p-8 overflow-y-auto">
                    {!selectedQuiz ? (
                        <div className="h-full flex items-center justify-center text-gray-400">
                            <p>Select a quiz from the left panel</p>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="flex justify-between items-center border-b pb-4 mb-6">
                                <h2 className="text-xl font-semibold">
                                    {selectedQuiz.title}
                                </h2>
                                <span className="font-mono bg-red-50 text-red-600 px-3 py-1 rounded-full">
                                    {Math.floor(timeLeft / 60)}:
                                    {String(timeLeft % 60).padStart(2, "0")}
                                </span>
                            </div>

                            {/* Questions */}
                            <div className="space-y-6">
                                {selectedQuiz.questions?.map((q, idx) => (
                                    <div
                                        key={q.id}
                                        className="p-5 rounded-lg bg-slate-50 border"
                                    >
                                        <p className="font-medium mb-3">
                                            {idx + 1}. {q.question_text}
                                        </p>

                                        {q.type === "mcq" &&
                                            q.choices?.map((c) => (
                                                <label
                                                    key={c.id}
                                                    className="flex items-center gap-2 mb-2"
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`q${q.id}`}
                                                        checked={
                                                            studentAnswers[
                                                                q.id
                                                            ] === c.choice_text
                                                        }
                                                        onChange={() =>
                                                            setStudentAnswers(
                                                                (a) => ({
                                                                    ...a,
                                                                    [q.id]:
                                                                        c.choice_text,
                                                                })
                                                            )
                                                        }
                                                    />
                                                    {c.choice_text}
                                                </label>
                                            ))}

                                        {q.type === "identification" && (
                                            <input
                                                className="w-full border rounded px-3 py-2"
                                                value={studentAnswers[q.id]}
                                                onChange={(e) =>
                                                    setStudentAnswers((a) => ({
                                                        ...a,
                                                        [q.id]: e.target.value,
                                                    }))
                                                }
                                            />
                                        )}

                                        {q.type === "essay" && (
                                            <div className="space-y-3">
                                                {/* Rubric */}
                                                {q.rubric && (
                                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                                        <p className="text-sm font-semibold text-amber-800 mb-1">
                                                            Grading Rubric
                                                        </p>
                                                        <p className="text-sm text-amber-700 whitespace-pre-line">
                                                            {q.rubric}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Answer box */}
                                                <textarea
                                                    className="w-full border rounded-lg px-3 py-2 min-h-[140px] focus:ring-2 focus:ring-violet-500 outline-none"
                                                    placeholder="Write your answer here…"
                                                    value={studentAnswers[q.id]}
                                                    onChange={(e) =>
                                                        setStudentAnswers(
                                                            (a) => ({
                                                                ...a,
                                                                [q.id]:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end mt-8">
                                <button
                                    onClick={handleSubmit}
                                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg shadow"
                                >
                                    Submit Quiz
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

/* =========================
   QUIZ ITEM
========================= */
function QuizItem({ quiz, onClick, active, status }) {
    const badge = {
        available: "bg-violet-100 text-violet-700",
        ended: "bg-gray-200 text-gray-600",
        submitted: "bg-blue-100 text-blue-700",
    };

    return (
        <div
            onClick={onClick}
            className={`p-4 rounded-lg border transition
                ${
                    active
                        ? "border-violet-600 bg-violet-50"
                        : "hover:border-violet-300"
                }
                ${status !== "available" ? "opacity-60" : "cursor-pointer"}
            `}
        >
            <p className="font-medium">{quiz.title}</p>
            <span
                className={`inline-block mt-2 text-xs px-3 py-1 rounded-full ${badge[status]}`}
            >
                {status}
            </span>
        </div>
    );
}
