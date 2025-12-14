<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizSubmission;
use App\Models\Question;
use App\Models\Answer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class QuizSubmissionController extends Controller
{
    public function store(Request $request, Quiz $quiz)
{
    $student = Auth::user();

    $data = $request->validate([
        'answers' => 'required|array',
    ]);

    $submission = QuizSubmission::create([
        'quiz_id' => $quiz->id,
        'student_id' => $student->id,
        'score' => 0,
        'submitted_at' => now(),
    ]);

    $totalScore = 0;

    foreach ($quiz->questions as $question) {
        $answerText = $data['answers'][$question->id] ?? null;
        $pointsAwarded = null;

        // ✅ MCQ auto grading
        if ($question->type === 'mcq') {
            $correctChoice = $question->choices()
                ->where('is_correct', true)
                ->first();

            if ($correctChoice && $correctChoice->choice_text === $answerText) {
                $pointsAwarded = $question->points;
                $totalScore += $question->points;
            } else {
                $pointsAwarded = 0;
            }
        }

        // ✅ Identification auto grading
        if ($question->type === 'identification') {
            if (
                strtolower(trim($question->correct_answer)) ===
                strtolower(trim($answerText))
            ) {
                $pointsAwarded = $question->points;
                $totalScore += $question->points;
            } else {
                $pointsAwarded = 0;
            }
        }

        // ❌ Essay = manual grading later
        if ($question->type === 'essay') {
            $pointsAwarded = null;
        }

        Answer::create([
            'submission_id' => $submission->id,
            'question_id' => $question->id,
            'answer_text' => $answerText,
            'points_awarded' => $pointsAwarded,
        ]);
    }

    // ✅ Save total score
    $submission->update([
        'score' => $totalScore,
    ]);

    return response()->json([
        'message' => 'Quiz submitted successfully!',
        'score' => $totalScore,
        'submission_id' => $submission->id,
    ]);
}

public function finalize(QuizSubmission $submission)
{
    if ($submission->graded_at !== null) {
        return response()->json([
            'message' => 'Already finalized'
        ], 403);
    }

    $submission->update([
        'graded_at' => Carbon::now(),
    ]);

    return response()->json([
        'message' => 'Submission finalized',
        'graded_at' => $submission->graded_at,
    ]);
}

}