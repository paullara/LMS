import { useState } from "react";
import axios from "axios";

export default function Quiz({ classId }) {
    const [title, setTitle] = useState("");
    const [questions, setQuestions] = useState([]);

    const createQuiz = async () => {
        await axios.post(`/classes/${classId}/quizzes`, {
            title,
            description: "Quiz description",
            questions,
        });

        alert("Quiz created!");
    };

    return (
        <div>
            <input
                placeholder="Quiz title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            {/* Later: dynamic question builder */}

            <button onClick={createQuiz}>Create Quiz</button>
        </div>
    );
}
