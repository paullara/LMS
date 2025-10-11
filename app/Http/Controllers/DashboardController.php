<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\ClassModel;
use App\Models\Task;
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

        $tasks = Task::where('user_id', $instructor->id)->where('status', 'pending')->latest()->get();

        $dueToday = Task::whereDate('created_at', today())
            ->where('user_id', $instructor->id)
            ->where('status', 'pending')
            ->count();

        return response()->json([
            'tasks' => $tasks,
            'dueToday' => $dueToday,
        ]);
    }
}