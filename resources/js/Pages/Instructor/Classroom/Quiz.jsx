import { useState, useEffect } from "react";
import axios from "axios";

export default function Quiz({ classId }) {
    /* =========================
     STATE
  ========================== */
    const [quizzes, setQuizzes] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [questions, setQuestions] = useState([]);
    const [startsAt, setStartsAt] = useState("");
    const [endsAt, setEndsAt] = useState("");

    const card =
        "bg-white rounded-2xl shadow-sm border border-gray-200 p-5 transition";

    /* =========================
     FETCH QUIZZES
  ========================== */
    const fetchQuizzes = async () => {
        try {
            const res = await axios.get(`/classes/${classId}/quizzes`);
            setQuizzes(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchQuizzes();
    }, []);

    /* =========================
     CREATE QUIZ LOGIC
  ========================== */
    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                type: "mcq",
                question_text: "",
                points: 1,
                correct_answer: "",
                rubric: "",
                choices: [
                    { text: "", is_correct: false },
                    { text: "", is_correct: false },
                ],
            },
        ]);
    };

    const updateQuestion = (index, field, value) => {
        const updated = [...questions];
        updated[index][field] = value;
        setQuestions(updated);
    };

    const updateChoice = (qIndex, cIndex, field, value) => {
        const updated = [...questions];
        updated[qIndex].choices[cIndex][field] = value;
        setQuestions(updated);
    };

    const markCorrectChoice = (qIndex, cIndex) => {
        const updated = [...questions];
        updated[qIndex].choices.forEach(
            (c, i) => (c.is_correct = i === cIndex)
        );
        setQuestions(updated);
    };

    const addChoice = (qIndex) => {
        const updated = [...questions];
        updated[qIndex].choices.push({ text: "", is_correct: false });
        setQuestions(updated);
    };

    const removeQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const createQuiz = async () => {
        try {
            await axios.post(`/classes/${classId}/quizzes`, {
                title,
                description,
                starts_at: startsAt || null,
                ends_at: endsAt || null,
                questions,
            });

            setTitle("");
            setDescription("");
            setStartsAt("");
            setEndsAt("");
            setQuestions([]);
            setShowCreate(false);
            fetchQuizzes();
        } catch (err) {
            console.error(err);
            alert("Failed to create quiz.");
        }
    };

    /* =========================
     UI: LEFT (quiz list) / RIGHT (selected quiz)
  ========================== */
    return (
        <div className="h-[calc(100vh-64px)] p-3">
            <div className="max-w-7xl mx-auto h-full grid grid-cols-[300px_1fr] gap-6">
                {/* LEFT PANEL: QUIZ LIST */}
                <div className="bg-white rounded-2xl border shadow-sm flex flex-col">
                    <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="font-semibold">Quizzes</h2>
                        <button
                            onClick={() => {
                                setShowCreate(true);
                                setSelectedQuiz(null);
                                setSelectedSubmission(null);
                            }}
                            className="px-3 py-1 rounded-full bg-violet-600 text-white text-sm hover:bg-violet-700 transition"
                        >
                            + Create
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {quizzes.length === 0 && (
                            <p className="text-sm text-gray-500 text-center mt-6">
                                No quizzes yet
                            </p>
                        )}

                        {quizzes.map((quiz) => (
                            <div
                                key={quiz.id}
                                onClick={() => {
                                    setSelectedQuiz(quiz);
                                    setSelectedSubmission(null);
                                    setShowCreate(false);
                                }}
                                className={`p-3 rounded-xl border cursor-pointer transition hover:border-violet-400 ${
                                    selectedQuiz?.id === quiz.id
                                        ? "border-violet-600 bg-violet-50"
                                        : "bg-white"
                                }`}
                            >
                                <p className="font-medium">{quiz.title}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {quiz.submissions?.length || 0} submissions
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT PANEL: SELECTED QUIZ / CREATE / SUBMISSION */}
                <div className="bg-white rounded-2xl border shadow-sm p-6 overflow-y-auto">
                    {/* CREATE QUIZ */}
                    {showCreate && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">
                                Create Quiz
                            </h2>

                            <input
                                className="w-full px-4 py-2 border rounded-lg"
                                placeholder="Quiz title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />

                            <input
                                className="w-full px-4 py-2 border rounded-lg"
                                placeholder="Quiz description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500">
                                        Start Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="w-full border rounded-lg px-3 py-2"
                                        value={startsAt}
                                        onChange={(e) =>
                                            setStartsAt(e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500">
                                        End Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="w-full border rounded-lg px-3 py-2"
                                        value={endsAt}
                                        onChange={(e) =>
                                            setEndsAt(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            {/* QUESTIONS */}
                            <div className="space-y-4">
                                {questions.map((q, qIndex) => (
                                    <div
                                        key={qIndex}
                                        className="border rounded-xl p-4 bg-slate-50 space-y-3"
                                    >
                                        <div className="flex justify-between items-center">
                                            <select
                                                className="border rounded-lg px-3 py-2"
                                                value={q.type}
                                                onChange={(e) =>
                                                    updateQuestion(
                                                        qIndex,
                                                        "type",
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="mcq">
                                                    Multiple Choice
                                                </option>
                                                <option value="identification">
                                                    Identification
                                                </option>
                                                <option value="essay">
                                                    Essay
                                                </option>
                                            </select>

                                            <button
                                                onClick={() =>
                                                    removeQuestion(qIndex)
                                                }
                                                className="text-xs text-red-500 hover:underline"
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        <textarea
                                            className="w-full border rounded-lg px-3 py-2"
                                            placeholder="Question"
                                            value={q.question_text}
                                            onChange={(e) =>
                                                updateQuestion(
                                                    qIndex,
                                                    "question_text",
                                                    e.target.value
                                                )
                                            }
                                        />

                                        <input
                                            type="number"
                                            min="1"
                                            className="w-32 border rounded-lg px-3 py-2"
                                            value={q.points}
                                            onChange={(e) =>
                                                updateQuestion(
                                                    qIndex,
                                                    "points",
                                                    Number(e.target.value)
                                                )
                                            }
                                        />

                                        {/* MCQ */}
                                        {q.type === "mcq" && (
                                            <div className="space-y-2">
                                                {q.choices.map(
                                                    (choice, cIndex) => (
                                                        <div
                                                            key={cIndex}
                                                            className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border"
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`correct-${qIndex}`}
                                                                checked={
                                                                    choice.is_correct
                                                                }
                                                                onChange={() =>
                                                                    markCorrectChoice(
                                                                        qIndex,
                                                                        cIndex
                                                                    )
                                                                }
                                                            />
                                                            <input
                                                                className="flex-1 border rounded-lg px-3 py-2"
                                                                placeholder={`Choice ${
                                                                    cIndex + 1
                                                                }`}
                                                                value={
                                                                    choice.text
                                                                }
                                                                onChange={(e) =>
                                                                    updateChoice(
                                                                        qIndex,
                                                                        cIndex,
                                                                        "text",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    )
                                                )}
                                                <button
                                                    onClick={() =>
                                                        addChoice(qIndex)
                                                    }
                                                    className="text-sm text-blue-600"
                                                >
                                                    + Add Choice
                                                </button>
                                            </div>
                                        )}

                                        {/* Identification */}
                                        {q.type === "identification" && (
                                            <input
                                                className="w-full border rounded-lg px-3 py-2"
                                                placeholder="Correct answer"
                                                value={q.correct_answer}
                                                onChange={(e) =>
                                                    updateQuestion(
                                                        qIndex,
                                                        "correct_answer",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        )}

                                        {/* Essay */}
                                        {q.type === "essay" && (
                                            <textarea
                                                className="w-full border rounded-lg px-3 py-2 bg-amber-50"
                                                placeholder="Rubric (for instructors)"
                                                value={q.rubric}
                                                onChange={(e) =>
                                                    updateQuestion(
                                                        qIndex,
                                                        "rubric",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={addQuestion}
                                    className="px-4 py-2 border rounded-lg"
                                >
                                    + Add Question
                                </button>
                                <button
                                    onClick={createQuiz}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                                >
                                    Save Quiz
                                </button>
                                <button
                                    onClick={() => setShowCreate(false)}
                                    className="px-4 py-2 text-gray-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* VIEW SUBMISSIONS / GRADING */}
                    {!showCreate && selectedQuiz && !selectedSubmission && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">
                                {selectedQuiz.title} – Submissions
                            </h2>

                            <button
                                onClick={async () => {
                                    try {
                                        await axios.post(
                                            `/submissions/${selectedQuiz.id}/return`
                                        );
                                        alert(
                                            "Returned to student successfully!"
                                        );
                                        fetchQuizzes();
                                    } catch (err) {
                                        console.error(err);
                                        alert("Failed to return.");
                                    }
                                }}
                                className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                                Return to Student
                            </button>

                            <div className="space-y-2 mt-2">
                                {selectedQuiz.submissions.map((sub) => (
                                    <div
                                        key={sub.id}
                                        onClick={() =>
                                            setSelectedSubmission(sub)
                                        }
                                        className="p-3 rounded-xl border bg-white cursor-pointer hover:border-violet-400"
                                    >
                                        {sub.student.student_id}{" "}
                                        {sub.student.firstname}{" "}
                                        {sub.student.lastname}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* GRADING */}
                    {!showCreate && selectedSubmission && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">
                                Grading – {selectedSubmission.student.firstname}{" "}
                                {selectedSubmission.student.lastname}
                            </h2>

                            <div className="space-y-4">
                                {selectedSubmission.answers.map((answer) => {
                                    const saved = answer.points_awarded;
                                    const draft =
                                        answer._draft_points ??
                                        answer.points_awarded ??
                                        "";
                                    const isGraded = saved !== null;
                                    const hasChanges =
                                        answer._draft_points !== undefined &&
                                        answer._draft_points !== saved;

                                    return (
                                        <div
                                            key={answer.id}
                                            className="border rounded-lg p-4"
                                        >
                                            <p className="font-medium">
                                                {answer.question.question_text}
                                            </p>
                                            <p className="text-sm text-gray-700 mt-2">
                                                {answer.answer_text}
                                            </p>

                                            {answer.question.type ===
                                                "essay" && (
                                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={
                                                            answer.question
                                                                .points
                                                        }
                                                        value={draft}
                                                        className="w-32 px-3 py-2 border rounded-lg"
                                                        onChange={(e) =>
                                                            setSelectedSubmission(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    answers:
                                                                        prev.answers.map(
                                                                            (
                                                                                a
                                                                            ) =>
                                                                                a.id ===
                                                                                answer.id
                                                                                    ? {
                                                                                          ...a,
                                                                                          _draft_points:
                                                                                              Number(
                                                                                                  e
                                                                                                      .target
                                                                                                      .value
                                                                                              ),
                                                                                      }
                                                                                    : a
                                                                        ),
                                                                })
                                                            )
                                                        }
                                                    />
                                                    <button
                                                        disabled={!hasChanges}
                                                        onClick={async () => {
                                                            await axios.post(
                                                                `/submissions/${selectedSubmission.id}/grade-essay`,
                                                                {
                                                                    answer_id:
                                                                        answer.id,
                                                                    points_awarded:
                                                                        answer._draft_points,
                                                                }
                                                            );
                                                            setSelectedSubmission(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    answers:
                                                                        prev.answers.map(
                                                                            (
                                                                                a
                                                                            ) =>
                                                                                a.id ===
                                                                                answer.id
                                                                                    ? {
                                                                                          ...a,
                                                                                          points_awarded:
                                                                                              answer._draft_points,
                                                                                          _draft_points:
                                                                                              undefined,
                                                                                      }
                                                                                    : a
                                                                        ),
                                                                })
                                                            );
                                                        }}
                                                        className={`px-3 py-2 rounded-lg text-sm ${
                                                            hasChanges
                                                                ? "bg-blue-600 text-white"
                                                                : "bg-gray-300 text-gray-600"
                                                        }`}
                                                    >
                                                        Save
                                                    </button>

                                                    {hasChanges && (
                                                        <span className="text-xs text-orange-600">
                                                            Unsaved changes
                                                        </span>
                                                    )}
                                                    {!hasChanges &&
                                                        isGraded && (
                                                            <span className="text-xs text-green-700">
                                                                Graded
                                                            </span>
                                                        )}
                                                    {!hasChanges &&
                                                        !isGraded && (
                                                            <span className="text-xs text-yellow-700">
                                                                Not graded
                                                            </span>
                                                        )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
