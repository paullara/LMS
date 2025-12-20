<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Quiz;
use App\Models\QuizSubmission;

class AIEndpointController extends Controller
{
    public function quizSubmissions()
    {
        $quizSubmissions = QuizSubmission::with(['student', 'quiz'])->get();

        return response()->json([
            'quiz_submissions' => $quizSubmissions
        ]);
    }

    public function storeClassroomPerformance(Request $request) 
    {
        $validated = $request->validate([
            'average_score' => 'required|numeric',
            'pass_rate' => 'required|numeric',
            'status' => 'required|string',
        ]);

        return response()->json([
            'message' => 'AI analysis received',
        ]);
    }
}
