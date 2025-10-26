<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\VideoCallMessage;

class VideoCallMessageController extends Controller
{
    public function index($id)
    {
        $messages = VideoCallMessage::with('user')
            ->where('video_call_id', $id)
            ->latest()
            ->take(50)
            ->get()
            ->reverse()
            ->values();
        
        return response()->json(['messages' => $messages]);
    }

    public function store(Request $request, $id)
    {
        $request->validate(['message' => 'required|string|max:500']);

        $message = VideoCallMessage::create([
            'video_call_id' => $id,
            'user_id' => auth()->id(),  
            'message' => $request->message,
        ]);

        return response()->json([
            'message' => $message->load('user')
        ]);
    }
}
