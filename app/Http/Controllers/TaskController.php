<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class TaskController extends Controller
{
    public function index()
    {
        $tasks = Task::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Instructor/Tasks', [
            'tasks' => $tasks
        ]);
    }

    public function getTasks()
    {
        $tasks = Task::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'tasks' => $tasks,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'priority' => 'required|in:urgent,high,medium,low,completed,cancelled', // ✅
            'picture' => 'nullable|image|max:2048',
        ]);

        $path = null;
        if ($request->hasFile('picture')) {
            $path = $request->file('picture')->store('tasks', 'public');
        }

        Task::create([
            'user_id' => auth()->id(),
            'title' => $request->title,
            'description' => $request->description,
            'status' => 'pending',
            'priority' => $request->priority, // ✅ save priority
            'due_date' => $request->due_date,
            'picture' => $path,
        ]);

        return redirect()->route('tasks.index');
    }

    public function update(Request $request, Task $task)
    {
        $this->authorize('update', $task);

        $data = $request->only('title', 'description', 'status', 'due_date', 'priority');

        if ($request->hasFile('picture')) {
            if ($task->picture) {
                Storage::disk('public')->delete($task->picture);
            }
            $data['picture'] = $request->file('picture')->store('tasks', 'public');
        }

        $task->update($data);

        return redirect()->back();
    }

    public function destroy(Task $task)
    {
        $this->authorize('delete', $task);

        if ($task->picture) {
            Storage::disk('public')->delete($task->picture);
        }

        $task->delete();

        return redirect()->back();
    }
}