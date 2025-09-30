<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Quiz;
use App\Models\QuizSubmission;
use App\Models\Assignment;
use App\Models\Submission;
use App\Models\ClassModel;

class AverageController extends Controller
{
    public function grade($id)
{
    $class = ClassModel::with('students')->findOrFail($id);

    $quizzes = Quiz::with(['submissions', 'questions'])
        ->where('class_id', $id)
        ->get();
    
    $mcq = Quiz::with(['submissions', 'questions'])
        ->where('type', 'objective')
        ->where('class_id', $id)
        ->get();

        // dd($quizzes);

    $assignments = Assignment::with('submissions')
        ->where('class_id', $id)
        ->get();

    // Collect all titles for headers
    $columns = $assignments->pluck('title')
        ->merge($quizzes->pluck('title'))
        ->toArray();

    $rows = [];

    foreach ($class->students as $student) {
        $row = ['Student' => $student->firstname];
        $totalScore = 0;
        $totalItems = 0;

        // Assignments
        foreach ($assignments as $assignment) {
            $submission = $assignment->submissions
                ->where('student_id', $student->id)
                ->first();

            $score = $submission->grade ?? 0;
            $row[$assignment->title] = $score;

            $totalScore += $score;
            $totalItems++;
        }

        // Quizzes
        foreach ($quizzes as $quiz) {
            $submission = $quiz->submissions
                ->where('student_id', $student->id)
                ->first();

            if ($submission) {
                $quizTotal = $quiz->questions->sum(fn($q) => $q->type === 'essay' ? ($q->max_score ?? 100) : 1);
                $score = $submission->score ?? 0;

                $percent = round(($score / $quizTotal) * 100, 2);
                $row[$quiz->title] = $percent;

                $totalScore += $percent;
            } else {
                $row[$quiz->title] = 0;
            }

            $totalItems++;
        }

        // Average
        $row['Average'] = $totalItems > 0 ? round($totalScore / $totalItems, 2) : 0;

        $rows[] = $row;
    }

    return response()->json([
        'columns' => array_merge(['Student'], $columns, ['Average']),
        'rows' => $rows
    ]);
}

}