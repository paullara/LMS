<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\Message;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MessageController extends Controller
{
    // Fetch messages for a group
    public function index(Group $group)
    {
        $messages = Message::with('user')
            ->where('group_id', $group->id)
            ->orderBy('created_at')
            ->get();
        return response()->json($messages);
    }

    // Store a new message
    public function store(Request $request, Group $group)
    {
        $request->validate([
            'content' => 'required|string',
        ]);
        $message = Message::create([
            'group_id' => $group->id,
            'user_id' => auth()->id(),
            'content' => $request->content,
        ]);
        return response()->json($message->load('user'));
    }
}