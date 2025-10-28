<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\VideoCallMessage;

class VideoCallMessageController extends Controller
{
    public function index(Request $request, $videoCallId)
{
    $afterId = $request->query('after_id', 0); // default 0
    $messages = VideoCallMessage::with('user')
        ->where('video_call_id', $videoCallId)
        ->where('id', '>', $afterId)
        ->orderBy('created_at', 'asc')
        ->get();

    return response()->json(['messages' => $messages]);
}


    public function store(Request $request, $videoCallId)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $msg = VideoCallMessage::create([
            'video_call_id' => $videoCallId,
            'user_id' => auth()->id(),
            'message' => $request->message,
        ]);

        return response()->json([
            'message' => 'Message sent successfully.',
            'data' => $msg->load('user'),
        ]);
    }
}
