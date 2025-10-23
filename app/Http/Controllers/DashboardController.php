<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\ClassModel;
use App\Models\Task;
use App\Models\Assignment;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function getInstructor()
    {
        $user = auth()->user();

        return response()->json([
            'user' => $user,
        ]);
    }

    public function getAuthStudent()
    {
        $student = auth()->user();

        return response()->json([
            'student' => $student,
        ]);
    }

    public function getStudents()
    {
        $instructor = Auth::user();

        $students = ClassModel::where('instructor_id', $instructor->id)
            ->with('students')
            ->get()
            ->pluck('students')
            ->flatten()
            ->unique('id')
            ->values();

        // Compute growth
        $currentMonthCount = $students->filter(function ($student) {
            return Carbon::parse($student->created_at)->isCurrentMonth();
        })->count();

        $lastMonthCount = $students->filter(function ($student) {
            return Carbon::parse($student->created_at)->isLastMonth();
        })->count();

        $growth = $lastMonthCount > 0
            ? (($currentMonthCount - $lastMonthCount) / $lastMonthCount) * 100
            : 0;

        $difference = $currentMonthCount - $lastMonthCount;

        $students->transform(function ($student) {
        $student->is_online = $student->last_seen_at &&
            \Carbon\Carbon::parse($student->last_seen_at)->gt(now()->subMinutes(2));
        return $student;
    });


        return response()->json([
            'students' => $students,
            'current_month' => $currentMonthCount,
            'last_month' => $lastMonthCount,
            'growth' => round($growth, 2),
            'new_this_month' => $difference > 0 ? $difference : 0,
        ]);
    }

    public function getMyClass()
    {
        $student = Auth::user();

        if ($student->role !== 'student') {
            abort(403, 'Unauthorized');
        }

        $classes = $student->enrolledClasses()->with('instructor')->latest()->get();

        $classIds = $classes->pluck('id');

        $assignments = Assignment::whereIn('class_id', $classIds)
            ->where('due_date', '>=', now())
            ->latest()
            ->get();

        $currentWeekCount = $classes->filter(fn($c) => $c->created_at->isCurrentWeek())->count();
        $lastWeekCount = $classes->filter(fn($c) => $c->created_at->isLastWeek())->count();
        
        $difference = $currentWeekCount - $lastWeekCount;

        $currentAssCount = $assignments->filter(fn($c) => $c->created_at->isCurrentWeek())->count();
        $lastAssCount = $assignments->filter(fn($c) => $c->created_at->isLastWeek())->count();

        $assDifference = $currentAssCount - $lastAssCount;

        return response()->json([
            'classes' => $classes,
            'assignments' => $assignments,
            'current_week' => $currentWeekCount,
            'last_week' => $lastWeekCount,
            'new_this_week' => $difference > 0 ? $difference : 0,
            'new_ass_this_week' => $assDifference > 0 ? $assDifference : 0,
        ]);
    }

    public function getClasses()
    {
        $instructor = Auth::user();

        $classes = ClassModel::where('instructor_id', $instructor->id)->latest()->get();

        $currentWeekCount = $classes->filter(fn($c) => $c->created_at->isCurrentWeek())->count();
        $lastWeekCount = $classes->filter(fn($c) => $c->created_at->isLastWeek())->count();

        $difference = $currentWeekCount - $lastWeekCount;

        return response()->json([
            'classes' => $classes,
            'current_week' => $currentWeekCount,
            'last_week' => $lastWeekCount,
            'new_this_week' => $difference > 0 ? $difference : 0,
        ]);
    }

    public function getTasks()
    {
        $instructor = Auth::user();

        // $tasks = Task::where('user_id', $instructor->id)->where('status', 'pending')->latest()->get();
        $tasks = Task::where('user_id', auth()->id())->where('status', 'pending')->latest()->get();

        $dueToday = Task::whereDate('created_at', today())
            ->where('user_id', $instructor->id)
            ->where('status', 'pending')
            ->count();

        $taskCount  = Task::where('user_id', $instructor->id)->take(5)->get();

        return response()->json([
            'tasks' => $tasks,
            'taskCount' => $taskCount,
            'dueToday' => $dueToday,
        ]);
    }
}