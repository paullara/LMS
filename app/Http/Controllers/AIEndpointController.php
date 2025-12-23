<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\QuizSubmission;
use App\Models\AiReport;

class AIEndpointController extends Controller
{
    public function quizSubmissions()
    {
        return response()->json([
            'quiz_submissions' =>
                QuizSubmission::with(['student', 'quiz'])->get()
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
            'submission_count' => 'required|integer',
            'score_variance' => 'required|numeric',
            'risk_score' => 'required|numeric',
            'risk_level' => 'required|string',
        ]);


        AiReport::updateOrCreate(
            ['class_id' => $data['class_id']],
            $data
        );

        return response()->json([
            'message' => 'AI report saved successfully'
        ]);
    }
}
