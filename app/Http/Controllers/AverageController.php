<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Quiz;
use App\Models\Assignment;
use App\Models\ClassModel;

class AverageController extends Controller
{
    public function grade($id)
    {
        $class = ClassModel::with('students')->findOrFail($id);

        // Get quizzes and assignments
        $quizzes = Quiz::with('submissions')
            ->where('class_id', $id)
            ->get();

        $assignments = Assignment::with('submissions')
            ->where('class_id', $id)
            ->get();

        // Column headers
        $columns = $assignments->pluck('title')
            ->merge($quizzes->pluck('title'))
            ->toArray();

        $rows = [];

        foreach ($class->students as $student) {
            $row = ['Student' => $student->firstname];
            $totalScore = 0;
            $totalItems = 0;

            // --- Assignments ---
            foreach ($assignments as $assignment) {
                $submission = $assignment->submissions
                    ->where('student_id', $student->id)
                    ->first();

                $score = $submission->grade ?? 0;
                $row[$assignment->title] = $score;

                $totalScore += $score;
                $totalItems++;
            }

            // --- Quizzes ---
            foreach ($quizzes as $quiz) {
                $submission = $quiz->submissions
                    ->where('student_id', $student->id)
                    ->first();

                $score = $submission->score ?? 0;
                $row[$quiz->title] = $score;

                $totalScore += $score;
                $totalItems++;
            }

            // --- Average ---
            $row['Average'] = $totalItems > 0 
                ? round($totalScore / $totalItems, 2) 
                : 0;

            $rows[] = $row;
        }

        return response()->json([
            'columns' => array_merge(['Student'], $columns, ['Average']),
            'rows' => $rows
        ]);
    }
}