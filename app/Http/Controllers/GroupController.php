<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Group;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

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
    $messages = $group->messages()->with('user')->get();

    // Students you want to be eligible for adding to the group
    $students = User::where('role', 'student')->get();

    return Inertia::render('Instructor/Groups/Show', [
        'group' => $group->load('students'),
        'messages' => $messages,
        'users' => $students,   // <-- REQUIRED FIX
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

    public function searchStudents(Request $request, Group $group)
{
    $search = $request->query('q', '');

    $existingStudentIds = $group->students()->pluck('id')->toArray();

    $students = User::where('role', 'student')
        ->whereNotIn('id', $existingStudentIds)
        ->when($search, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('firstname', 'like', "%{$search}%")
                  ->orWhere('lastname', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        })
        ->limit(10)
        ->get(['id', DB::raw("CONCAT(firstname, ' ', lastname) as name"), 'email']);

    return response()->json($students);
}


}