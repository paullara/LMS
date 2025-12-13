<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Answer extends Model
{
    protected $fillable = [
        'submission_id',
        'question_id',
        'answer_text',
        'points_awarded',
    ];

    public function submission()
    {
        return $this->belongsTo(QuizSubmission::class, 'submission_id');
    }

    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}
