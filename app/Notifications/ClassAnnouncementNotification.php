<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ClassAnnouncementNotification extends Notification
{
    use Queueable;

    protected $announcement;

    public function __construct($announcement)
    {
        $this->announcement = $announcement;
    }

    public function via($notifiable)
    {
        return ['database']; // you can also add 'broadcast' later
    }

    public function toDatabase($notifiable)
    {
        return [
            'announcement_id' => $this->announcement->id,
            'class_id' => $this->announcement->class_id,
            'class_name' => $this->announcement->class->name ?? null, // ✅ include class name
            'message' => $this->announcement->announcement,
            'instructor' => $this->announcement->instructor->firstname,
        ];
    }
}