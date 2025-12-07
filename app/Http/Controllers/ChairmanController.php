<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Notifications\InstructorAssignedToClass;
use App\Models\User;
use App\Models\ClassModel;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Inertia\Inertia;

class ChairmanController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('Chairman/Dashboard');
    }

    public function createClasses()
    {
        return Inertia::render('Chairman/CreateClasses');
    }
    
    public function createdClasses()
    {
        $createdClasses = ClassModel::with(['instructor', 'students'])
            ->where('chairman_id', auth()->id())
            ->latest()
            ->get()
            ->map(function ($class) {
                if ($class->is_active) {
                    $lastActive = Carbon::parse($class->is_active);
                    $class->is_active_now = $lastActive->gt(now()->subMinutes(1));
                } else {
                    $class->is_active_now = false;
                }
                return $class;
            });

        return response()->json([
            'createdClasses' => $createdClasses,
        ]);
    }

    public function getInstructors()
    {
        $instructors = User::where('role', 'instructor')->get();

        return response()->json([
            'instructors' => $instructors
        ]);
    }

    public function classes()
    {
        return Inertia::render('Chairman/Classes');
    }

    public function storeClassroom(Request $request)
    {
        $authenticatedChairman = Auth::user();

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:255',
            'subcode' => 'required|string|max:255',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'instructor_id' => 'required|exists:users,id',
            'yearlevel' => 'required|integer',
            'section' => 'required|string|max:20',
            'day' => 'required|string'
        ]);

        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $filename = time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('class'), $filename);
            $data['photo'] = $filename;
        }

        $data['chairman_id'] = $authenticatedChairman->id;
        $data['code'] = Str::upper(Str::random(6));

        $classroom = ClassModel::create($data);

        $instructor = User::find($data['instructor_id']);
        if ($instructor) {
            $instructor->notify(new InstructorAssignedToClass($classroom, $authenticatedChairman));
        }

        return response()->json([
            'success' => true,
            'data' => $classroom,
            'message' => 'Class successfully created and instructor notified.',
        ]);
    }

    public function profile()
    {
        $createdClasses = ClassModel::with(['instructor', 'students'])
            ->where('chairman_id', auth()->id())
            ->latest()
            ->get()
            ->map(function ($class) {
                if ($class->is_active) {
                    $lastActive = Carbon::parse($class->is_active);
                    $class->is_active_now = $lastActive->gt(now()->subMinutes(1));
                } else {
                    $class->is_active_now = false;
                }
                return $class;
            });

        return Inertia::render('Chairman/Profile', [
            'createdClasses' => $createdClasses,
        ]);
    }

}