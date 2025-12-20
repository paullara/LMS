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

public function quiz()
{
    $quiz = Quiz::all();
    return response()->json([
        'quiz' => $quiz,
    ]);
}

}
