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
            'points_awarded' => 'required|numeric|min:0',
        ]);

        $answer = Answer::with('question')
            ->where('id', $request->answer_id)
            ->where('submission_id', $submission->id)
            ->firstOrFail();

        if (!$answer->question) {
            return response()->json([
                'message' => 'Question not found for this answer.'
            ], 404);
        }

        $maxPoints = $answer->question->points;
        $pointsAwarded = floatval($request->points_awarded);

        $answer->update([
            'points_awarded' => min($pointsAwarded, $maxPoints),
        ]);

        $totalScore = $submission->answers()->sum('points_awarded');

        $submission->update([
            'score' => $totalScore,
        ]);

        return response()->json([
            'message' => 'Saved',
            'score' => $totalScore,
        ]);
    }
}