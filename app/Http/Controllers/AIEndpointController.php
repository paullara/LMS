<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\QuizSubmission;
use App\Models\ClassPerformance;

class AIEndpointController extends Controller
{
    public function quizSubmissions()
    {
        $quizSubmissions = QuizSubmission::with(['student', 'quiz'])->get();

        return response()->json([
            'quiz_submissions' => $quizSubmissions
        ]);
    }

    public function storeClassPerformance(Request $request)
    {
        if ($request->header('X-AI-TOKEN') !== config('services.ai.token')) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'class_id' => 'required|integer',
            'average_score' => 'required|numeric',
            'pass_rate' => 'required|numeric',
            'status' => 'required|string',
        ]);

        // Save to database
        $performance = ClassPerformance::updateOrCreate(
            ['class_id' => $validated['class_id']],
            $validated
        );

        return response()->json([
            'message' => 'AI analysis received and saved',
            'data' => $performance
        ]);
    }
}
