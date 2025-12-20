<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\QuizSubmission;

class AIEndpointController extends Controller
{
    public function quizSubmissions()
    {
        $quizSubmissions = QuizSubmission::all();

        return response()->json([
            'quiz_submissions' => $quizSubmissions
        ]);
    }
}
