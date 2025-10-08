import { useForm, usePage, router, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Thread from "./Instructor/Classroom/Threads";
import Quiz from "@/Pages/Quiz";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Classroom({
    classroom = {},
    initialThreads = [],
    quizzes = [],
    quizSubmissions = [],
    videoCall: initialVideoCall,
}) {
    const { props } = usePage();
    const [activeTab, setActiveTab] = useState("general");
    const [threads, setThreads] = useState(initialThreads);
    const [materials, setMaterials] = useState(props.materials || []);
    const [assignments, setAssignments] = useState(props.assignments || []);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [file, setFile] = useState(null);
    const { submissions = [] } = usePage().props;
    const [assignmentTab, setAssignmentTab] = useState("ongoing");
    const [submissionsState, setSubmissionsState] = useState(submissions);
    const [quizList, setQuizList] = useState(quizzes);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [studentAnswers, setStudentAnswers] = useState({});
    const [finishedQuizIds, setFinishQuizIds] = useState(
        quizSubmissions
            ? quizSubmissions
                  .filter((sub) => sub.status === "finished" && sub.quiz_id)
                  .map((sub) => sub.quiz_id)
            : []
    );
    const [timeLeft, setTimeLeft] = useState(null);
    const [videoCall, setVideoCall] = useState(initialVideoCall);

    // console.log("quiz submissions, ".quizSubmissions);
    // console.log("quizSubmissions:", quizSubmissions);
    console.log(
        "finishedQuizIds",
        quizSubmissions.map((sub) => sub.quiz_id)
    );

    // console.log(count(quizzes.question));
    console.count(quizzes.questions);

    const now = new Date();

    useEffect(() => {
        const fetchVideoCall = async () => {
            try {
                const response = await axios.get(
                    `/video-call/check/${classroom.id}`
                );
                console.log("The response is:", response);
                setVideoCall(response.data.videoCall);
            } catch (error) {
                console.error("Failed to fetch video call:", error);
            }
        };

        fetchVideoCall();

        const interval = setInterval(fetchVideoCall, 5000);
        return () => clearInterval(interval);
    }, [classroom.id]);

    // Get IDs of completed assignments
    const completedSubmissionIds = submissionsState
        .filter((sub) => sub.status === "completed")
        .map((sub) => sub.assignment_id);

    // Ongoing = due in the future AND not completed
    const ongoingAssignments = assignments.filter(
        (a) =>
            new Date(a.due_date) >= now &&
            !completedSubmissionIds.includes(a.id)
    );

    // Past Due = due in the past AND not completed
    const pastDueAssignments = assignments.filter(
        (a) =>
            new Date(a.due_date) < now && !completedSubmissionIds.includes(a.id)
    );

    // Completed assignments = joined with completed submissions
    const completedAssignments = submissionsState
        .filter((sub) => sub.status === "completed")
        .map((sub) => assignments.find((a) => a.id === sub.assignment_id))
        .filter(Boolean); // ensure valid assignments only

    useEffect(() => {
        setThreads(props.initialThreads || []);
    }, [props.initialThreads]);

    // Thread form
    const {
        data: threadData,
        setData: setThreadData,
        post: postThread,
        processing: threadProcessing,
        reset: resetThread,
    } = useForm({ message: "" });

    // Reply form
    const {
        data: replyData,
        setData: setReplyData,
        post: postReply,
        processing: replyProcessing,
        reset: resetReply,
    } = useForm({ thread_id: "", message: "" });

    const handleCreateThread = (e) => {
        e.preventDefault();
        postThread(route("thread.store", classroom.id), {
            onSuccess: () => {
                resetThread();
                setThreads([...props.initialThreads]);
            },
        });
    };

    const handleCreateReply = (threadId, e) => {
        e.preventDefault();
        postReply(route("thread.reply", threadId), {
            onSuccess: () => {
                resetReply();
                setThreads([...props.initialThreads]);
            },
        });
    };

    const handleReplyClick = (threadId) => {
        setReplyData({ thread_id: threadId, message: "" });
    };

    const handleSubmitAnswers = () => {
        if (!selectedQuiz) return;

        router.post(
            route("quiz.submit", selectedQuiz.id),
            { answers: studentAnswers },
            {
                onSuccess: (page) => {
                    setFinishQuizIds((prev) => [...prev, selectedQuiz.id]);
                    setSelectedQuiz(null);
                    setStudentAnswers({});
                },
                onError: (errors) => {
                    console.errors("Submission failed:", errors);
                    alert("There was an error submitting your quiz.");
                },
            }
        );
    };

    const handleOpenQuiz = (quiz) => {
        setSelectedQuiz(quiz);

        // initialize all answers to null or empty string
        const initialAnswers = {};
        quiz.questions.forEach((q) => {
            initialAnswers[q.id] = null; // or ""
        });
        setStudentAnswers(initialAnswers);
    };

    const handleSelectChoice = (questionId, choiceLabel) => {
        setStudentAnswers((prev) => ({
            ...prev,
            [questionId]: choiceLabel,
        }));
    };

    useEffect(() => {
        if (selectedQuiz) {
            const duration = selectedQuiz.duration_minutes * 60;
            setTimeLeft(duration);

            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmitAnswers();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [selectedQuiz]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60)
            .toString()
            .padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ["videoCall"] });
        }, 10000);

        return () => clearInterval(interval);
    });

    // handle join call
    const handleJoinCall = async () => {
        try {
            const response = await axios.post(
                route("video.call.join", videoCall.id)
            );
            const callData = response.data;

            window.location.href = `/video-call/${callData.id}`;
        } catch (error) {
            console.error("Failed to join video call", error);
            alert("Something went wrong while joining the call.");
        }
    };

    return (
        <AuthenticatedLayout>
            <div className="px-4 py-6 min-h-screen">
                {/* Header */}
                <div className="border-b pb-4 mb-6">
                    <h1 className="text-3xl font-bold text-purple-700">
                        {classroom?.name || "Classroom"}
                    </h1>
                    <p className="text-gray-600">
                        {classroom?.description || ""}
                    </p>
                    {videoCall?.status === "started" && (
                        <button
                            className="bg-green-500 text-white px-4 py-2 rounded"
                            onClick={handleJoinCall}
                        >
                            Join Call
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex space-x-6 mb-4 border-b">
                    {["general", "materials", "assignments", "quiz"].map(
                        (tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-2 px-4 text-sm font-semibold border-b-2 ${
                                    activeTab === tab
                                        ? "border-purple-600 text-purple-600"
                                        : "border-transparent text-gray-500 hover:text-purple-600"
                                }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        )
                    )}
                </div>

                {/* Tab Content */}
                <div className="mt-4 space-y-6">
                    {activeTab === "quiz" && (
                        <Quiz classId={classroom.id}></Quiz>
                    )}

                    {activeTab === "general" && (
                        <Thread classId={classroom.id} />
                    )}

                    {activeTab === "materials" && (
                        <>
                            <h2 className="text-xl font-semibold">
                                Class Materials
                            </h2>
                            {materials.length > 0 ? (
                                <ul className="space-y-3">
                                    {materials.map((material) => (
                                        <li
                                            key={material.id}
                                            className="p-4 border rounded-lg bg-white shadow"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h3 className="font-medium">
                                                        {material.title}
                                                    </h3>
                                                    <a
                                                        href={`/materials/${material.materials_folder}`}
                                                        target="_blank"
                                                        className="text-purple-600 hover:underline text-sm"
                                                    >
                                                        View/Download
                                                    </a>
                                                </div>
                                                <span className="text-sm text-gray-400">
                                                    {new Date(
                                                        material.created_at
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-center">
                                    No materials uploaded yet.
                                </p>
                            )}
                        </>
                    )}
                    {/*
                     {/* Assignment Section */}
                    {activeTab === "assignments" && (
                        <>
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                Assignments
                                <span
                                    className="text-xs text-gray-400"
                                    title="Assignments are grouped by status. Click a tab to filter."
                                >
                                    (What's this?)
                                </span>
                            </h2>
                            {/* Assignment Status Tabs */}
                            <div className="flex gap-2 mb-4">
                                {[
                                    {
                                        label: "Ongoing",
                                        key: "ongoing",
                                        color: "green",
                                    },
                                    {
                                        label: "Past Due",
                                        key: "pastDue",
                                        color: "red",
                                    },
                                    {
                                        label: "Completed",
                                        key: "completed",
                                        color: "blue",
                                    },
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() =>
                                            setAssignmentTab(tab.key)
                                        }
                                        className={`px-4 py-2 rounded-t font-semibold border-b-2 focus:outline-none ${
                                            assignmentTab === tab.key
                                                ? `border-${tab.color}-600 text-${tab.color}-600 bg-${tab.color}-50`
                                                : "border-transparent text-gray-500 bg-white"
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            {/* Assignment Lists by Tab */}
                            <div>
                                {assignmentTab === "ongoing" && (
                                    <AssignmentList
                                        assignments={ongoingAssignments}
                                        submissions={submissionsState}
                                        setSelectedAssignment={
                                            setSelectedAssignment
                                        }
                                        status="Ongoing"
                                        badgeColor="green"
                                    />
                                )}
                                {assignmentTab === "pastDue" && (
                                    <AssignmentList
                                        assignments={pastDueAssignments}
                                        submissions={submissionsState}
                                        setSelectedAssignment={
                                            setSelectedAssignment
                                        }
                                        status="Past Due"
                                        badgeColor="red"
                                    />
                                )}
                                {assignmentTab === "completed" && (
                                    <AssignmentList
                                        assignments={completedAssignments}
                                        submissions={submissionsState}
                                        setSelectedAssignment={
                                            setSelectedAssignment
                                        }
                                        status="Completed"
                                        badgeColor="blue"
                                    />
                                )}
                            </div>
                            {/* Assignment Details Modal */}
                            {selectedAssignment && (
                                <AssignmentDetailsModal
                                    assignment={selectedAssignment}
                                    submissions={submissionsState}
                                    setFile={setFile}
                                    file={file}
                                    setSelectedAssignment={
                                        setSelectedAssignment
                                    }
                                    setAssignments={setAssignments}
                                    setAssignmentTab={setAssignmentTab}
                                    setSubmissionsState={setSubmissionsState}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Helper Components
function AssignmentList({
    assignments,
    submissions,
    setSelectedAssignment,
    status,
    badgeColor,
}) {
    if (!assignments.length) {
        return (
            <p className="text-gray-500 text-center mb-6">
                No {status.toLowerCase()} assignments.
            </p>
        );
    }
    return (
        <ul className="space-y-4 mb-6">
            {assignments.map((assignment) => {
                const submission = submissions.find(
                    (sub) => sub.assignment_id === assignment.id
                );
                return (
                    <li
                        key={assignment.id}
                        className="border rounded-lg p-4 bg-white shadow cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => setSelectedAssignment(assignment)}
                        title="Click to view details and submit"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold flex items-center gap-2">
                                    {assignment.title}
                                    <span
                                        className={`inline-block px-2 py-0.5 rounded text-xs bg-${badgeColor}-100 text-${badgeColor}-700 ml-2`}
                                    >
                                        {status}
                                    </span>
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Due:{" "}
                                    {new Date(
                                        assignment.due_date
                                    ).toLocaleDateString()}
                                </p>
                                {submission?.grade && (
                                    <p className="text-sm text-green-600 mt-1">
                                        Grade: {submission.grade}
                                    </p>
                                )}
                                {submission?.feedback && (
                                    <p className="text-sm text-blue-600 mt-1">
                                        Feedback: {submission.feedback}
                                    </p>
                                )}
                            </div>
                            <span className="text-purple-600 text-sm font-medium">
                                {status === "Ongoing"
                                    ? "View & Submit →"
                                    : "View →"}
                            </span>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}

function AssignmentDetailsModal({
    assignment,
    submissions,
    setFile,
    file,
    setSelectedAssignment,
    setAssignments,
    setAssignmentTab,
    setSubmissionsState,
}) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const submission = submissions.find(
        (sub) => sub.assignment_id === assignment.id
    );
    const isPastDue = new Date(assignment.due_date) < new Date();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("assignment_id", assignment.id);
        try {
            const response = await axios.post(
                route("assignment.submit"),
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            setSuccess("Submission uploaded successfully!");
            setFile(null);
            setSelectedAssignment(null);
            // Add the new submission to the local state for real-time UI update
            setSubmissionsState((prev) => [
                ...prev,
                {
                    assignment_id: assignment.id,
                    status: "completed",
                    // add any other fields you want to show in completed tab
                },
            ]);
            setAssignmentTab("completed");
        } catch (err) {
            setError("Submission failed. Try again.");
        } finally {
            setSubmitting(false);
        }
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-6 relative animate-fade-in">
                <button
                    onClick={() => setSelectedAssignment(null)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-lg"
                    title="Close"
                >
                    ×
                </button>
                <h3 className="text-lg font-bold mb-2">{assignment.title}</h3>
                <p className="mb-2 text-gray-700">{assignment.description}</p>
                <p className="mb-4 text-sm text-gray-500">
                    Due: {new Date(assignment.due_date).toLocaleString()}
                </p>
                {assignment.attachment && (
                    <div className="mb-4">
                        <a
                            href={`/assignments/${assignment.attachment}`}
                            target="_blank"
                            className="text-purple-600 text-sm underline"
                        >
                            Download Attachment
                        </a>
                    </div>
                )}
                {error && <div className="text-red-600 mb-2">{error}</div>}
                {success && (
                    <div className="text-green-600 mb-2">{success}</div>
                )}
                {submission && submission.status === "turned_in" ? (
                    <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
                            Submitted
                        </span>
                        <span className="text-green-600 font-semibold">
                            You have already submitted this assignment.
                        </span>
                    </div>
                ) : isPastDue ? (
                    <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">
                            Past Due
                        </span>
                        <span className="text-red-600 font-semibold">
                            Sorry, this assignment is past due and can no longer
                            be submitted.
                        </span>
                    </div>
                ) : submission && submission.status === "completed" ? (
                    <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                            Completed
                        </span>
                        <span className="text-green-600">
                            Assignment Completed
                        </span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <label className="block text-sm font-medium mb-1">
                            Upload your submission:
                        </label>
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            required
                            className="block w-full text-sm border rounded px-2 py-1"
                        />
                        <button
                            type="submit"
                            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 w-full"
                            disabled={submitting}
                        >
                            {submitting ? "Submitting..." : "Submit Assignment"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
