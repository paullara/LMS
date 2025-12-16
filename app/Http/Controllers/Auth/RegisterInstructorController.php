<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\InstructorIdNumber;
use Illuminate\Auth\Events\Registered;
use Illuminate\Validation\Rules\Password;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class RegisterInstructorController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/InstructorRegister');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'firstname' => 'required|string|max:255',
            'middlename' => 'nullable|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Password::defaults()],
            'specialization' => 'nullable|string|max:255',
            'teacher_id' => 'required|string|max:20',
        ]);

        $instructorId = InstructorIdNumber::where('instructor_id_number', $request->teacher_id)->first();
        if (!$instructorId) {
            return redirect()->back()->withErrors([
                'teacher_id' => 'The provided instructor ID is not valid.'
            ])->withInput();
        }

        $alreadyRegistered = User::where('teacher_id', $request->teacher_id)->exists();
        if ($alreadyRegistered) {
            return redirect()->back()->withErrors([
                'teacher_id' => 'This instructor ID is already registered. One-time registration only.',
            ])->withInput();
        }

        $data['role'] = 'instructor';

        $user = User::create([
            'firstname' => $data['firstname'],
            'middlename' => $data['middlename'],
            'lastname' => $data['lastname'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'],
            'teacher_id' => $request->teacher_id,
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('instructor.dashboard', absolute: false));
    }
}
