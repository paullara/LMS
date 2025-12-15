<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Notifications\ClassAnnouncementNotification;
use Illuminate\Support\Facades\Auth;
use App\Models\InstructorAnnouncement;
use Inertia\Inertia;
use App\Models\ClassModel;

class InstructorAnnouncementController extends Controller
{

  public function create()
{
    $instructor = auth()->user();

    $classes = $instructor->classes()
        ->select('id', 'name')
        ->get()
        ->toArray(); // 👈 force JSON-safe array

    return Inertia::render('Instructor/Announcement', [
        'classes' => $classes,
    ]);
}

public function store(Request $request)
{
    $request->validate([
        'class_id' => 'required|exists:classes,id',
        'announcement' => 'required|string',
    ]);

    $announcement = InstructorAnnouncement::create([
        'class_id' => $request->class_id,
        'instructor_id' => auth()->id(),
        'announcement' => $request->announcement,
    ]);

    $announcement->load('instructor', 'class');

    // Notify students
    $announcement->class?->students->each(fn($student) => $student->notify(new ClassAnnouncementNotification($announcement)));

    return response()->json([
        'message' => 'Announcement sent to students 🎉',
        'announcement' => [
            'id' => $announcement->id,
            'announcement' => $announcement->announcement,
            'instructor' => $announcement->instructor->firstname,
            'class' => [
                'id' => $announcement->class->id,
                'name' => $announcement->class->name,
            ],
        ],
    ]);
}


}