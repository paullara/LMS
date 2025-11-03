<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{

    public function notification()
    {
        return Inertia::render('Notification');
    }

    public function index(Request $request)
    {
        $user = $request->user();

        // Get latest notifications
        $notifications = $user->notifications()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => class_basename($notification->type),
                    'data' => $notification->data,
                    'read_at' => $notification->read_at,
                    'created_at' => $notification->created_at->toDateTimeString(),
                ];
            });

        // Return an array directly (not wrapped in an object)
        return response()->json($notifications);
    }

    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();
        return response()->json(['success' => true]);
    }
}