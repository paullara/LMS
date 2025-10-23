<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Announcement;
use Illuminate\Support\Facades\Auth;

class AnnouncementController extends Controller
{
    public function index()
    {
        $instructor = Auth::user();

        $announcements = Announcement::where('instructor_id', $instructor->id)
            ->with('class:id,name')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'announcements' => $announcements
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'class_id' => 'nullable|exists:classes,id',
            'class_code' => 'nullable|string|max:20',
            'is_public' => 'boolean',
        ]);

        $announcement = Announcement::create([
            'instructor_id' => Auth::id(),
            'class_id' => $validated['class_id'] ?? null,
            'title' => $validated['title'],
            'message' => $validated['message'],
            'class_code' => $validated['class_code'] ?? null,
            'is_public' => $validated['is_public'] ?? false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Announcement created successfully!',
            'announcement' => $announcement
        ]);
    }
    public function byInstructor($id)
    {
        $announcements = Announcement::where('instructor_id', $id)
            ->with(['instructor', 'class:id,name'])
            ->latest()
            ->get();

        return inertia('SearchResult', [
            'announcements' => $announcements,
            'instructor' => $announcements->first()?->instructor
        ]);
    }
}
