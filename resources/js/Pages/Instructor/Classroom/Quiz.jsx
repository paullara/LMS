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

    /* =========================
       FETCH
    ========================== */
    const fetchQuizzes = async () => {
        const res = await axios.get(`/classes/${classId}/quizzes`);
        setQuizzes(res.data);
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
    };

    const card = "bg-white rounded-xl shadow-sm border border-gray-200 p-5";

    /* =========================
       RENDER
    ========================== */
    return (
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
            {/* HEADER */}
            <div className="flex justify-end">
                {!showCreate && (
                    <button
                        onClick={() => {
                            setShowCreate(true);
                            setSelectedQuiz(null);
                            setSelectedSubmission(null);
                        }}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm"
                    >
                        + Create Quiz
                    </button>
                )}
            </div>

            {/* CREATE QUIZ */}
            {showCreate && (
                <div className={card}>
                    <h2 className="text-lg font-semibold mb-6">Create Quiz</h2>

                    <input
                        className="w-full px-4 py-2 border rounded-lg mb-4"
                        placeholder="Quiz title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <input
                        className="w-full px-4 py-2 border rounded-lg mb-4"
                        placeholder="Quiz description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="text-sm text-gray-600">
                                Start Time
                            </label>
                            <input
                                type="datetime-local"
                                className="w-full border rounded-lg px-3 py-2"
                                value={startsAt}
                                onChange={(e) => setStartsAt(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-600">
                                End Time
                            </label>
                            <input
                                type="datetime-local"
                                className="w-full border rounded-lg px-3 py-2"
                                value={endsAt}
                                onChange={(e) => setEndsAt(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* QUESTIONS */}
                    <div className="space-y-6">
                        {questions.map((q, qIndex) => (
                            <div
                                key={qIndex}
                                className="border rounded-lg p-4 space-y-3"
                            >
                                <div className="flex justify-between">
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
                                        <option value="essay">Essay</option>
                                    </select>

                                    <button
                                        onClick={() => removeQuestion(qIndex)}
                                        className="text-red-500 text-sm"
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

                                {q.type === "mcq" && (
                                    <div className="space-y-2">
                                        {q.choices.map((choice, cIndex) => (
                                            <div
                                                key={cIndex}
                                                className="flex items-center gap-2"
                                            >
                                                <input
                                                    type="radio"
                                                    name={`correct-${qIndex}`}
                                                    checked={choice.is_correct}
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
                                                    value={choice.text}
                                                    onChange={(e) =>
                                                        updateChoice(
                                                            qIndex,
                                                            cIndex,
                                                            "text",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => addChoice(qIndex)}
                                            className="text-sm text-blue-600"
                                        >
                                            + Add Choice
                                        </button>
                                    </div>
                                )}

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

                                {q.type === "essay" && (
                                    <textarea
                                        className="w-full border rounded-lg px-3 py-2"
                                        placeholder="Rubric"
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

                    <div className="flex gap-3 mt-6">
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

            {/* QUIZ LIST */}
            {!showCreate && !selectedSubmission && (
                <div className="grid md:grid-cols-2 gap-4">
                    {quizzes.length === 0 && (
                        <p className="text-gray-500">No quizzes created yet.</p>
                    )}

                    {quizzes.map((quiz) => (
                        <div
                            key={quiz.id}
                            onClick={() => setSelectedQuiz(quiz)}
                            className={`${card} cursor-pointer`}
                        >
                            <p className="font-medium">{quiz.title}</p>
                            <p className="text-sm text-gray-500">
                                {quiz.submissions?.length || 0} submissions
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* SUBMISSIONS */}
            {selectedQuiz && !showCreate && (
                <div className={card}>
                    <h2 className="text-lg font-semibold mb-4">
                        Submissions – {selectedQuiz.title}
                    </h2>
                    <button
                        onClick={async () => {
                            try {
                                await axios.post(
                                    `/submissions/${selectedQuiz.id}/return`
                                );
                                alert(
                                    "Submission returned to student successfully!"
                                );
                                // Optionally refresh quizzes
                                setSelectedSubmission(null);
                                fetchQuizzes();
                            } catch (err) {
                                console.error(err);
                                alert("Failed to return submission.");
                            }
                        }}
                        className="px-4 py-2 mt-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                        Return to Student
                    </button>

                    {selectedQuiz.submissions.map((sub) => (
                        <div
                            key={sub.id}
                            onClick={() => setSelectedSubmission(sub)}
                            className="p-3 rounded-lg border cursor-pointer mb-2"
                        >
                            {sub.student.student_id} {sub.student.firstname}{" "}
                            {sub.student.lastname}
                        </div>
                    ))}
                </div>
            )}

            {/* GRADING */}
            {selectedSubmission && !showCreate && (
                <div className={card}>
                    <h2 className="text-lg font-semibold mb-4">
                        Grading – {selectedSubmission.student.firstname}{" "}
                        {selectedSubmission.student.lastname}
                    </h2>

                    <div className="space-y-6">
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

                                    {answer.question.type === "essay" && (
                                        <div className="mt-3 flex items-center gap-3">
                                            <input
                                                type="number"
                                                min="0"
                                                max={answer.question.points}
                                                value={draft}
                                                className="w-32 px-3 py-2 border rounded-lg"
                                                onChange={(e) =>
                                                    setSelectedSubmission(
                                                        (prev) => ({
                                                            ...prev,
                                                            answers:
                                                                prev.answers.map(
                                                                    (a) =>
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
                                                                    (a) =>
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

                                            {!hasChanges && isGraded && (
                                                <span className="text-xs text-green-700">
                                                    Graded
                                                </span>
                                            )}

                                            {!hasChanges && !isGraded && (
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
    );
}
