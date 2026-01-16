<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\Question;
use App\Models\Choice;
use App\Models\QuizSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class QuizController extends Controller
{
    // Instructor: create quiz
    public function store(Request $request, $classId)
    {
        $quiz = Quiz::create([
            'class_id' => $classId,
            'title' => $request->title,
            'description' => $request->description,
            'starts_at' => $request->starts_at,
            'ends_at' => $request->ends_at
        ]);

        foreach ($request->questions as $q) {
    $question = Question::create([
        'quiz_id' => $quiz->id,
        'type' => $q['type'],
        'question_text' => $q['question_text'],
        'correct_answer' => $q['correct_answer'] ?? null,
        'points' => $q['points'] ?? null
    ]);

    // store MCQ choices
    if ($q['type'] === 'mcq') {
        foreach ($q['choices'] as $choice) {
            Choice::create([
                'question_id' => $question->id,
                'choice_text' => $choice['text'],
                'is_correct' => $choice['is_correct'],
            ]);
        }
    }

    // store essay rubrics
    if ($q['type'] === 'essay' && !empty($q['rubrics'])) {
        foreach ($q['rubrics'] as $rubric) {
            $question->rubrics()->create([
                'title' => $rubric['title'],
                'points' => $rubric['points'],
            ]);
        }
    }
}


        return response()->json($quiz->load('questions.choices'), 201);
    }

    // Student / Instructor: fetch quizzes per class
    public function index($classId)
    {
        return Quiz::where('class_id', $classId)
            ->with([
                'submissions.student',
                'submissions.answers.question.rubrics'
            ])
            ->get();
    }

    // QuizController.php
    public function studentIndex($classId)
    {
        $student = Auth::user();
        $quizzes = Quiz::where('class_id', $classId)
        ->with('questions.choices', 'questions.rubrics')
        ->get()
        ->map(function ($quiz) use ($student) {
            $quiz->submitted = QuizSubmission::where('quiz_id', $quiz->id)
                ->where('student_id', $student->id)
                ->exists();
            return $quiz;
        });

        return response()->json($quizzes);
    }   


    // View single quiz
    public function show(Quiz $quiz)
    {
        return $quiz->load('questions.choices');
    }

    public function returnToStudent($quizId)
    {
        $submission = Quiz::findOrFail($quizId);

        $submission->returned_at = now(); // add a returned_at field in DB
        $submission->save();

        return response()->json([
            'message' => 'Submission returned to student successfully.'
        ]);
    }

  public function returnedQuiz($classId) 
{
    $studentId = auth()->id();

    $quizzes = Quiz::with([
        'questions',
        'submissions' => function ($q) use ($studentId) {
            $q->where('student_id', $studentId)
              ->with('answers'); // Include the answers to calculate score
        }
    ])
    ->where('class_id', $classId)
    ->whereNotNull('returned_at') // Only returned quizzes
    ->get()
    ->map(function ($quiz) {
        $submission = $quiz->submissions->first();

        return [
            'id' => $quiz->id,
            'title' => $quiz->title,
            'description' => $quiz->description,
            'returned_at' => $quiz->returned_at,
            'questions' => $quiz->questions,
            'score' => $submission 
                ? $submission->answers->sum('points_awarded') 
                : null,
            'max_score' => $quiz->questions->sum('points'),
            'answers' => $submission ? $submission->answers : [],
        ];
    });

    return response()->json($quizzes);
}

}