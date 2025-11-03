<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Notification;

class InstructorAssigned extends Notification
{
    use Queueable;

    public $class;

    /**
     * Create a new notification instance.
     */
    public function __construct($class)
    {
        $this->class = $class;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->line('The introduction to the notification.')
                    ->action('Notification Action', url('/'))
                    ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toDatabase($notifiable)
    {
        return [
            'message' => "You have been assigned to the class '{$this->class->name}' by the chairman.",
            'class_id' => $this->class->id,
            'chairman_id' => $this->class->chairman_id,
        ];
    }
}