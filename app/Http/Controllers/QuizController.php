<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\Question;
use App\Models\Choice;
use App\Models\QuizSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuizController extends Controller
{
    // Instructor: create quiz
    public function store(Request $request, $classId)
    {
        $quiz = Quiz::create([
            'class_id' => $classId,
            'title' => $request->title,
            'description' => $request->description,
        ]);

        foreach ($request->questions as $q) {
            $question = Question::create([
                'quiz_id' => $quiz->id,
                'type' => $q['type'],
                'question_text' => $q['question_text'],
                'correct_answer' => $q['correct_answer'] ?? null,
                'points' => $q['points'],
                'rubric' => $q['rubric'] ?? null,
            ]);

            // MCQ choices
            if ($q['type'] === 'mcq') {
                foreach ($q['choices'] as $choice) {
                    Choice::create([
                        'question_id' => $question->id,
                        'choice_text' => $choice['text'],
                        'is_correct' => $choice['is_correct'],
                    ]);
                }
            }
        }

        return response()->json($quiz->load('questions.choices'), 201);
    }

    // Student / Instructor: fetch quizzes per class
    public function index($classId)
    {
        return Quiz::where('class_id', $classId)->get();
    }

    // View single quiz
    public function show(Quiz $quiz)
    {
        return $quiz->load('questions.choices');
    }
}
