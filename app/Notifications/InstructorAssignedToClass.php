<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\ClassModel;

class InstructorAssignedToClass extends Notification
{
    use Queueable;

    protected $classroom;
    protected $chairman;

    /**
     * Create a new notification instance.
     */
    public function __construct(ClassModel $classroom, $chairman)
    {
        $this->classroom = $classroom;
        $this->chairman = $chairman;
    }

    /**
     * Get the notification's delivery channels.
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
            ->line('You have been assigned to a new class.')
            ->action('View Class', url('/'))
            ->line('Thank you for using our system!');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'message' => "You have been assigned to teach the class '{$this->classroom->name}' by {$this->chairman->firstname}.",
            'class_id' => $this->classroom->id,
            'chairman' => $this->chairman->firstname,
        ];
    }
}