<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Group;
use App\Models\User;
use Inertia\Inertia;

class GroupController extends Controller
{
    public function index()
    {
        $myGroup = Group::where('instructor_id', auth()->id())->latest()->get();

        return Inertia::render('Instructor/Groups/Index', [
            'groups' => $myGroup,
            'auth' => [
                'user' => auth()->user(),
            ],
        ]);
    }


    public function create()
    {   
        return Inertia::render('Instructor/Groups/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required'
        ]);

        $group = Group::create([
            'name' => $request->name,
            'instructor_id' => auth()->id(),
        ]);

        return redirect()->route('instructor.groups.show', $group->id);
    }

    public function show(Group $group)
    {
        return Inertia::render('Instructor/Groups/Show', [
            'group' => $group->load([
                'students:id,firstname',
                'instructor:id,firstname',
            ]),
            'messages' => $group->messages()
                ->with('user:id,firstname')
                ->orderBy('created_at')
                ->get(),
            'auth' => auth()->user(),
        ]);
    }

    public function assignStudents(Request $request, Group $group)
    {
        $request->validate([
            'student_ids' => 'required|array',
        ]);

        $group->students()->syncWithoutDetaching($request->student_ids);
        
        return back()->with('success', 'Students added');
    }
}
