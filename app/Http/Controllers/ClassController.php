<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ClassModel;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ClassController extends Controller
{
    public function chairmanCreateDraft(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'subcode' => 'required|string|max:255',
            'instructor_id' => 'required|exists:users,id',
            'day' => 'required|string',
            'start_time' => 'required|string',
            'end_time' => 'required|string',
            'yearlevel' => 'required|integer',
            'section' => 'required|string',
            'description' => 'nullable|string',
        ]);

        $data['chairman_id'] = auth()->id();
        $data['is_draft'] = true;
        $data['code'] = Str::upper(Str::random(6));
        $data['status'] = "assigned";

        $class = ClassModel::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Draft created successfully.',
            'class' => $class
        ], 201);
    }


  public function instructorDrafts()
{
    $drafts = ClassModel::where('instructor_id', auth()->id())
        ->where('status', 'assigned') // or 'assigned', adjust if you want only certain draft statuses
        ->get();

    $options = [
        'names' => ClassModel::where('instructor_id', auth()->id())->pluck('name')->unique()->values()->toArray(),
        'subcodes' => ClassModel::where('instructor_id', auth()->id())->pluck('subcode')->unique()->values()->toArray(),
        'days' => ClassModel::where('instructor_id', auth()->id())->pluck('day')->unique()->values()->toArray(),
        'yearlevels' => ClassModel::where('instructor_id', auth()->id())->pluck('yearlevel')->unique()->values()->toArray(),
        'sections' => ClassModel::where('instructor_id', auth()->id())->pluck('section')->unique()->values()->toArray(),
    ];

    return inertia('Instructor/Drafts', [
        'drafts' => $drafts,
        'options' => $options
    ]);
}



    public function completeDraft(Request $request)
    {
        $data = $request->validate([
            'id' => 'required|exists:classes,id',
            'name' => 'required|string|max:255',
            'subcode' => 'required|string|max:255',
            'day' => 'required|string',
            'start_time' => 'required|string',
            'end_time' => 'required|string',
            'yearlevel' => 'required|integer',
            'section' => 'required|string',
            'description' => 'nullable|string',
            'photo' => 'nullable|image|max:2048',
        ]);

        $class = ClassModel::where('id', $data['id'])
            ->where('instructor_id', auth()->id())
            ->firstOrFail();

        if ($request->hasFile('photo')) {
            $filename = time() . '.' . $request->photo->extension();
            $request->photo->move(public_path('class'), $filename);
            $data['photo'] = $filename;
        }

        $class->update([
            'name' => $data['name'],
            'subcode' => $data['subcode'],
            'day' => $data['day'],
            'start_time' => $data['start_time'],
            'end_time' => $data['end_time'],
            'yearlevel' => $data['yearlevel'],
            'section' => $data['section'],
            'description' => $data['description'] ?? $class->description,
            'photo' => $data['photo'] ?? $class->photo,
            'is_draft' => false,
            'status' => 'completed',
        ]);

        // Return JSON response
    //     return response()->json([
    //         'success' => true,
    //         // 'message' => 'Draft completed and published successfully.',
    //         'class' => $class
    //     ], 200);

        return redirect()->route('improved.classList');
    }

}
