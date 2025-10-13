<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Submission;
use App\Models\QuizSubmission;
use App\Models\ClassModel;
use Illuminate\Support\Facades\Auth;

class ProgressController extends Controller
{
    public function studentProgress($classId)
    {
        $class = ClassModel::with('students')->findOrFail($classId);

        $studentsData = $class->students->map(function ($student) use ($classId) {
            // Quiz data
            $quizSubmissions = QuizSubmission::where('student_id', $student->id)
                ->whereHas('quiz', fn($q) => $q->where('class_id', $classId))
                ->get();

            $averageQuizScore = $quizSubmissions->avg('score') ?? 0;

            // Assignment data
            $assignmentSubmissions = Submission::where('student_id', $student->id)
                ->whereHas('assignment', fn($q) => $q->where('class_id', $classId))
                ->get();

            $averageAssignmentGrade = $assignmentSubmissions->avg('grade') ?? 0;

            // Submission rate
            $totalTasks = $quizSubmissions->count() + $assignmentSubmissions->count();
            $completedTasks = $quizSubmissions->where('status', 'submitted')->count()
                + $assignmentSubmissions->where('status', 'submitted')->count();

            $submissionRate = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100, 2) : 0;

            return [
                'student_id' => $student->id,
                'name' => $student->name,
                'average_quiz' => round($averageQuizScore, 2),
                'average_assignment' => round($averageAssignmentGrade, 2),
                'submission_rate' => $submissionRate,
            ];
        });

        return response()->json($studentsData);
    }
}