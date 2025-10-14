<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Task;

class TaskController extends Controller
{
    public function index()
    {
        return Inertia::render('Instructor/Tasks');
    }

   public function getTasks()
{
    $tasks = Task::where('user_id', auth()->id())->latest()->get();

    // Dynamically calculate progress for each task
    $tasks->map(function ($task) {
        $task->progress = $task->calculateProgress();
        return $task;
    });

    return response()->json($tasks);
}

}
