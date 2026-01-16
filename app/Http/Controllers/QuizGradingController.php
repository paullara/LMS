<?php

namespace App\Http\Controllers;

use App\Models\QuizSubmission;
use App\Models\Answer;
use Illuminate\Http\Request;


class QuizGradingController extends Controller
{
   public function gradeEssay(Request $request, QuizSubmission $submission)
{
    $request->validate([
        'answer_id' => 'required|exists:answers,id',
        'rubrics' => 'required|array',
    ]);

    $answer = Answer::with('question')
        ->where('id', $request->answer_id)
        ->where('submission_id', $submission->id)
        ->firstOrFail();

    // Delete old rubric scoring for re-grade
    $answer->rubricScores()->delete();

    $total = 0;

    foreach ($request->rubrics as $rubricId => $points) {
        $rubric = $answer->question->rubrics()->findOrFail($rubricId);

        $answer->rubricScores()->create([
            'title' => $rubric->title,
            'points_awarded' => $points,
        ]);

        $total += $points;
    }

    // Assign final score to answer
    $answer->points_awarded = $total;
    $answer->save();

    // ✅ Update QuizSubmission score (sum of all answers)
    $submissionScore = $submission->answers()->sum('points_awarded');
    $submission->score = $submissionScore;
    $submission->graded_at = now(); // optional: mark submission as graded
    $submission->save();

    return response()->json([
        'message' => 'Saved!',
        'total' => $total,
        'submission_score' => $submissionScore,
    ]);
}

}