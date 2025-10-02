import { useState, useEffect } from "react";
import axios from "axios";

export default function Quiz({ classId }) {
    const [quizList, setQuizList] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [quizData, setQuizData] = useState({
        class_id: classId,
        title: "",
        description: "",
        start_time: "",
        end_time: "",
        duration_minutes: "",
        quiz_type: "objective",
        questions: [
            {
                type: "multiple_choice",
                question_text: "",
                correct_answer: "",
                choices: [
                    { label: "A", text: "" },
                    { label: "B", text: "" },
                    { label: "C", text: "" },
                    { label: "D", text: "" },
                ],
            },
        ],
    });

    // Fetch quizzes
    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const res = await axios.get(`/quizzes/${classId}`);
                setQuizList(res.data.quizzes);
            } catch (error) {
                console.error("Error fetching quizzes:", error);
            }
        };
        fetchQuizzes();
        const interval = setInterval(fetchQuizzes, 2000);
        return () => clearInterval(interval);
    }, [classId]);

    // Auto compute duration
    useEffect(() => {
        if (quizData.start_time && quizData.end_time) {
            const start = new Date(quizData.start_time);
            const end = new Date(quizData.end_time);
            if (!isNaN(start) && !isNaN(end) && end > start) {
                const diffMs = end - start;
                const diffMins = Math.floor(diffMs / 60000);
                setQuizData((prev) => ({
                    ...prev,
                    duration_minutes: diffMins,
                }));
            }
        }
    }, [quizData.start_time, quizData.end_time]);

    // Handlers
    const handleQuizInputChange = (e) =>
        setQuizData({ ...quizData, [e.target.name]: e.target.value });

    const handleQuestionChange = (idx, field, value) => {
        const updated = [...quizData.questions];
        updated[idx][field] = value;
        setQuizData({ ...quizData, questions: updated });
    };

    const handleChoiceChange = (qIdx, cIdx, value) => {
        const updated = [...quizData.questions];
        updated[qIdx].choices[cIdx].text = value;
        setQuizData({ ...quizData, questions: updated });
    };

    const addQuestion = () => {
        const newQuestion =
            quizData.quiz_type === "essay"
                ? {
                      type: "essay",
                      question_text: "",
                      correct_answer: null,
                      choices: [],
                  }
                : {
                      type: "multiple_choice",
                      question_text: "",
                      correct_answer: "",
                      choices: [
                          { label: "A", text: "" },
                          { label: "B", text: "" },
                          { label: "C", text: "" },
                          { label: "D", text: "" },
                      ],
                  };

        setQuizData((prev) => ({
            ...prev,
            questions: [...prev.questions, newQuestion],
        }));
    };

    const removeQuestion = (idx) => {
        if (quizData.questions.length === 1) return;
        setQuizData((prev) => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== idx),
        }));
    };

    // Quiz type change handler
    const handleQuizTypeChange = (e) => {
        const newType = e.target.value;

        setQuizData((prev) => ({
            ...prev,
            quiz_type: newType,
            questions: prev.questions.map((q) => {
                if (newType === "essay") {
                    return {
                        ...q,
                        type: "essay",
                        correct_answer: null,
                        choices: [],
                    };
                } else {
                    return {
                        ...q,
                        type: "multiple_choice",
                        correct_answer: "",
                        choices: [
                            { label: "A", text: "" },
                            { label: "B", text: "" },
                            { label: "C", text: "" },
                            { label: "D", text: "" },
                        ],
                    };
                }
            }),
        }));
    };

    const handleCreateQuiz = async (e) => {
        e.preventDefault();

        // Frontend validation
        for (let i = 0; i < quizData.questions.length; i++) {
            const q = quizData.questions[i];

            if (!q.question_text.trim()) {
                alert(`Question ${i + 1}: Question text is required`);
                return;
            }

            if (quizData.quiz_type === "objective") {
                if (q.type === "multiple_choice") {
                    if (q.choices.some((c) => !c.text.trim())) {
                        alert(
                            `Question ${i + 1}: All 4 choices must be filled`
                        );
                        return;
                    }
                    if (!q.correct_answer) {
                        alert(
                            `Question ${
                                i + 1
                            }: Please select the correct answer`
                        );
                        return;
                    }
                }

                if (q.type === "identification") {
                    if (!q.correct_answer || !q.correct_answer.trim()) {
                        alert(`Question ${i + 1}: Correct answer is required`);
                        return;
                    }
                }
            }
        }

        const payload = {
            class_id: classId,
            title: quizData.title,
            description: quizData.description,
            start_time: quizData.start_time,
            end_time: quizData.end_time,
            duration_minutes: quizData.duration_minutes,
            quiz_type: quizData.quiz_type,
            questions: quizData.questions.map((q) => ({
                question_text: q.question_text || "",
                type: q.type,
                correct_answer: q.correct_answer ?? null,
                reference_answer: q.reference_answer ?? null,
                choices: Array.isArray(q.choices) ? q.choices : [],
            })),
        };

        try {
            const response = await axios.post("/quiz", payload);
            console.log("Quiz created:", response.data);

            // Reset form
            setQuizData({
                class_id: classId,
                title: "",
                description: "",
                start_time: "",
                end_time: "",
                duration_minutes: "",
                quiz_type: "objective",
                questions: [
                    {
                        type: "multiple_choice",
                        question_text: "",
                        correct_answer: "",
                        choices: [
                            { label: "A", text: "" },
                            { label: "B", text: "" },
                            { label: "C", text: "" },
                            { label: "D", text: "" },
                        ],
                    },
                ],
            });

            setQuizList((prev) => [...prev, response.data.quiz]);
            setSelectedQuiz(null);
        } catch (error) {
            if (error.response && error.response.status === 422) {
                console.error("Validation errors:", error.response.data.errors);
                alert("Validation failed. Check console for details.");
            } else {
                console.error("Failed to create quiz", error);
            }
        }
    };

    const handleRemoveQuiz = async (quizId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this quiz?"
        );
        if (!confirmed) return;
        try {
            await axios.delete(`/quiz/${quizId}`);
            setQuizList((prev) => prev.filter((quiz) => quiz.id !== quizId));
        } catch (error) {
            console.error("Error deleting quiz", error);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Quiz List */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800">
                    Existing Quizzes
                </h2>
                {quizList.length === 0 ? (
                    <div className="text-gray-500">No quizzes yet.</div>
                ) : (
                    <div className="grid gap-4">
                        {quizList.map((quiz) => (
                            <div
                                key={quiz.id}
                                className="border rounded-lg p-4 bg-white shadow-sm"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-purple-700 text-lg">
                                            {quiz.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            {quiz.description}
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {quiz.questions?.length || 0}{" "}
                                        question(s)
                                    </span>
                                </div>
                                <button
                                    className="mt-3 px-4 py-1 bg-blue-500 text-white rounded text-sm"
                                    onClick={() => setSelectedQuiz(quiz)}
                                >
                                    View
                                </button>
                                <button
                                    className="mt-3 ml-4 px-4 py-1 bg-red-500 text-white rounded text-sm"
                                    onClick={() => handleRemoveQuiz(quiz.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quiz Form */}
            <form
                onSubmit={handleCreateQuiz}
                className="bg-white p-6 rounded-lg shadow-md space-y-4 overflow-y-auto max-h-[85vh]"
            >
                <h2 className="text-xl font-semibold">Create Quiz</h2>

                <input
                    type="text"
                    name="title"
                    placeholder="Quiz Title"
                    value={quizData.title}
                    onChange={handleQuizInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                />
                <textarea
                    name="description"
                    placeholder="Description"
                    value={quizData.description}
                    onChange={handleQuizInputChange}
                    className="w-full border rounded px-3 py-2"
                />

                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="datetime-local"
                        name="start_time"
                        value={quizData.start_time}
                        onChange={handleQuizInputChange}
                        className="border rounded px-3 py-2"
                    />
                    <input
                        type="datetime-local"
                        name="end_time"
                        value={quizData.end_time}
                        onChange={handleQuizInputChange}
                        className="border rounded px-3 py-2"
                    />
                </div>
                <input
                    type="number"
                    name="duration_minutes"
                    placeholder="Duration (minutes)"
                    value={quizData.duration_minutes}
                    readOnly
                    className="w-full border rounded px-3 py-2"
                />

                <select
                    value={quizData.quiz_type}
                    onChange={handleQuizTypeChange}
                    className="border rounded px-2 py-1 mb-4"
                >
                    <option value="objective">
                        Objective (MCQ & Identification)
                    </option>
                    <option value="essay">Essay</option>
                </select>

                <div className="space-y-4">
                    {quizData.questions.map((q, idx) => (
                        <div
                            key={idx}
                            className="border rounded p-4 bg-gray-50"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold">
                                    Question {idx + 1}
                                </span>
                                {quizData.questions.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeQuestion(idx)}
                                        className="text-red-500 text-xs"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>

                            <input
                                type="text"
                                placeholder="Question text"
                                value={q.question_text}
                                onChange={(e) =>
                                    handleQuestionChange(
                                        idx,
                                        "question_text",
                                        e.target.value
                                    )
                                }
                                className="w-full border rounded px-3 py-2 mb-2"
                                required
                            />

                            {quizData.quiz_type === "objective" && (
                                <>
                                    <select
                                        value={q.type}
                                        onChange={(e) =>
                                            handleQuestionChange(
                                                idx,
                                                "type",
                                                e.target.value
                                            )
                                        }
                                        className="border rounded px-2 py-1 mb-2"
                                    >
                                        <option value="multiple_choice">
                                            Multiple Choice
                                        </option>
                                        <option value="identification">
                                            Identification
                                        </option>
                                    </select>

                                    {q.type === "multiple_choice" &&
                                        q.choices.map((choice, cIdx) => (
                                            <div
                                                key={cIdx}
                                                className="flex items-center mb-2"
                                            >
                                                <span className="w-6">
                                                    {choice.label}
                                                </span>
                                                <input
                                                    type="text"
                                                    value={choice.text}
                                                    onChange={(e) =>
                                                        handleChoiceChange(
                                                            idx,
                                                            cIdx,
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder={`Choice ${choice.label}`}
                                                    className="flex-1 border rounded px-2 py-1"
                                                    required
                                                />
                                            </div>
                                        ))}

                                    {q.type === "multiple_choice" && (
                                        <select
                                            value={q.correct_answer || ""}
                                            onChange={(e) =>
                                                handleQuestionChange(
                                                    idx,
                                                    "correct_answer",
                                                    e.target.value
                                                )
                                            }
                                            className="border rounded px-2 py-1 mt-2"
                                        >
                                            <option value="">
                                                Select Correct Answer
                                            </option>
                                            <option value="A">A</option>
                                            <option value="B">B</option>
                                            <option value="C">C</option>
                                            <option value="D">D</option>
                                        </select>
                                    )}

                                    {q.type === "identification" && (
                                        <input
                                            type="text"
                                            value={q.correct_answer || ""}
                                            onChange={(e) =>
                                                handleQuestionChange(
                                                    idx,
                                                    "correct_answer",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Correct Answer"
                                            className="w-full border rounded px-3 py-2 mb-2"
                                        />
                                    )}
                                </>
                            )}

                            {quizData.quiz_type === "essay" && (
                                <>
                                    <input
                                        type="text"
                                        placeholder="Reference Answer (optional)"
                                        value={q.reference_answer || ""}
                                        onChange={(e) =>
                                            handleQuestionChange(
                                                idx,
                                                "reference_answer",
                                                e.target.value
                                            )
                                        }
                                        className="w-full border rounded px-3 py-2 mb-2"
                                    />
                                    <p className="text-gray-500 text-sm">
                                        Student will write essay. Instructor
                                        will check manually.
                                    </p>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={addQuestion}
                    className="w-full py-2 bg-green-500 text-white rounded"
                >
                    + Add Question
                </button>
                <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 text-white rounded"
                >
                    Create Quiz
                </button>
            </form>
        </div>
    );
}
