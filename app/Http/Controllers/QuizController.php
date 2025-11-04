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
    public function store(Request $request)
{
    $validated = $request->validate([
        'class_id' => 'required|integer|exists:classes,id',
        'title' => 'required|string|max:255',
        'description' => 'nullable|string',
        'start_time' => 'required|date',
        'end_time' => 'required|date|after:start_time',
        'duration_minutes' => 'required|integer|min:1',
        'quiz_type' => 'nullable|string',
        'questions' => 'required|array|min:1',
        'questions.*.question_text' => 'required|string',
        'questions.*.type' => 'required|in:multiple_choice,identification,essay',
        'questions.*.correct_answer' => 'nullable|string',
        'questions.*.reference_answer' => 'nullable|string',
        'questions.*.choices' => 'nullable|array',
        'questions.*.choices.*.label' => 'nullable|string',
        'questions.*.choices.*.text' => 'nullable|string',
        'questions.*.points' => 'nullable|integer|min:1',
    ]);

    DB::beginTransaction();

    try {
        $quiz = Quiz::create([
            'class_id' => $validated['class_id'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'duration_minutes' => $validated['duration_minutes'],
            'quiz_type' => $validated['quiz_type'],
        ]);

        foreach ($validated['questions'] as $qData) {
            $question = Question::create([
                'quiz_id' => $quiz->id,
                'question_text' => $qData['question_text'],
                'type' => $qData['type'],
                'correct_answer' => $qData['correct_answer'] ?? null,
                'reference_answer' => $qData['reference_answer'] ?? null,
                'points' => $qData['points'] ?? 1, // ✅ store essay points here
            ]);

            if ($qData['type'] === 'multiple_choice' && isset($qData['choices'])) {
                foreach ($qData['choices'] as $choice) {
                    if (!empty($choice['label']) && !empty($choice['text'])) {
                        Choice::create([
                            'question_id' => $question->id,
                            'label' => $choice['label'],
                            'text' => $choice['text'],
                        ]);
                    }
                }
            }
        }

        DB::commit();
        return response()->json([
            'message' => 'Quiz created successfully',
            'quiz' => $quiz->load('questions.choices'),
        ], 201);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'message' => 'Failed to create quiz',
            'error' => $e->getMessage(),
        ], 500);
    }
}



    public function submit(Request $request, Quiz $quiz)
{
    // 🚫 Prevent double submission
    $existing = QuizSubmission::where('quiz_id', $quiz->id)
        ->where('student_id', auth()->id())
        ->where('status', 'finished')
        ->first();

    if ($existing) {
        return response()->json([
            'message' => 'You have already finished this quiz.',
        ], 403);
    }

    // ✅ Validate input
    $validated = $request->validate([
        'answers' => 'required|array',
        'answers.*' => 'nullable|string',
    ]);

    $questions = $quiz->questions()->get();
    $score = 0;

    foreach ($questions as $question) {
        $studentAnswer = $validated['answers'][$question->id] ?? null;
        if (!$studentAnswer) continue;

        switch ($question->type) {
            case 'multiple_choice':
                if (trim($studentAnswer) === trim($question->correct_answer)) {
                    $score += $question->points ?? 1;
                }
                break;

            case 'identification':
                if (strcasecmp(trim($studentAnswer), trim($question->correct_answer)) === 0) {
                    $score += $question->points ?? 1;
                }
                break;

            case 'essay':
                if (!empty($question->reference_answer)) {
                    // Compare similarity (0-100%)
                    similar_text(
                        strtolower(trim($studentAnswer)),
                        strtolower(trim($question->reference_answer)),
                        $percent
                    );

                    // Score scaled to instructor’s assigned points
                    $essayScore = round(($percent / 100) * ($question->points ?? 5), 2);
                    $score += $essayScore;
                }
                break;
        }
    }

    // 💾 Store submission
    $submission = QuizSubmission::create([
        'quiz_id' => $quiz->id,
        'student_id' => auth()->id(),
        'answers' => json_encode($validated['answers']),
        'score' => $score,
        'status' => 'finished',
    ]);

    return response()->json([
        'message' => 'Quiz submitted successfully',
        'score' => $score,
        'total' => $questions->sum('points'),
        'submission' => $submission,
    ]);
}

    
    public function getQuizzes($id)
    {
        $quizzes = Quiz::with(['questions.choices', 'submissions.student'])
            ->where('class_id', $id)
            ->latest()
            ->get();

        return response()->json([
            'quizzes' => $quizzes
        ]);
    }

    public function submissions()
    {
        $quizSubmissions = QuizSubmission::where('student_id', auth()->id())->get();
        
        return response()->json([
            'quizSubmissions' => $quizSubmissions,
        ]);
    }
}