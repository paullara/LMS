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

    $data = $request->validate([
        'class_id' => 'required|integer',
        'average_score' => 'required|numeric',
        'pass_rate' => 'required|numeric',
        'risk_score' => 'required|numeric',
        'risk_level' => 'required|string',
    ]);

    \DB::table('class_ai_reports')->updateOrInsert(
        ['class_id' => $data['class_id']],
        $data
    );

    return response()->json(['message' => 'AI report saved']);
}

}
