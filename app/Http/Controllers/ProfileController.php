<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
   public function update(Request $request)
{
    $user = $request->user();

    $request->validate([
        'firstname' => 'required|string|max:255',
        'middlename' => 'nullable|string|max:255',
        'lastname' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email,' . $user->id,
        'contact_number' => 'nullable|string|max:255',
        'specialization' => 'nullable|string|max:255',
        'bio' => 'nullable|string',
        'profile_picture' => 'nullable|mimes:jpg,jpeg,png|max:4095',
        'address' => 'sometimes|string|max:255',
        'city' => 'sometimes|string|max:255',
        'zipcode' => 'sometimes|integer',
        'course' => 'sometimes|string|max:255',
        'campus' => 'sometimes|string|max:255',
        'year_level' => 'sometimes|integer',
    ]);

    if ($request->hasFile('profile_picture')) {
        $file = $request->file('profile_picture');
        $filename = time() . '.' . $file->getClientOriginalExtension();
        $file->move(public_path('profiles'), $filename);

        $user->profile_picture = 'profiles/' . $filename;
    }

    $user->update($request->only([
        'firstname',
        'middlename',
        'lastname',
        'email',
        'contact_number',
        'specialization',
        'bio',
        'course',
        'campus',
        'year_level',
        'address',
        'city',
        'zipcode',
    ]));

    return response()->json([
        'success' => true,
        'message' => 'Profile updated successfully!',
        'user' => $user
    ]);
}

public function updateTest(Request $request, $id)
{
    $user = $request->user();

    $request->validate([
        'firstname' => 'required|string|max:255',
        'middlename' => 'nullable|string|max:255',
        'lastname' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email,' . $user->id,
        'contact_number' => 'nullable|string|max:255',
        'specialization' => 'nullable|string|max:255',
        'bio' => 'nullable|string',
        'profile_picture' => 'nullable|mimes:jpg,jpeg,png|max:4095',
        'address' => 'sometimes|string|max:255',
        'city' => 'sometimes|string|max:255',
        'zipcode' => 'sometimes|integer',
        'course' => 'sometimes|string|max:255',
        'campus' => 'sometimes|string|max:255',
        'year_level' => 'sometimes|integer|max:4',
        'student_id' => 'sometimes|string|max:50',
        'teacher_id' => 'sometimes|string|max:50',
    ]);

    if ($request->hasFile('profile_picture')) {
        $file = $request->file('profile_picture');
        $filename = time() . '.' . $file->getClientOriginalExtension();
        $file->move(public_path('profiles'), $filename);

        $user->profile_picture = 'profiles/' . $filename;
    }

    $user->update($request->only([
        'firstname',
        'middlename',
        'lastname',
        'email',
        'contact_number',
        'specialization',
        'bio',
        'course',
        'campus',
        'year_level',
        'address',
        'city',
        'zipcode',
        'student_id',
        'teacher_id',
    ]));

    return response()->json([
        'success' => true,
        'message' => 'Profile updated successfully!',
        'user' => $user
    ]);
}



    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
