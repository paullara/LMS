<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuestionRubric extends Model
{
    protected $fillable = [
        'question_id',
        'title',
        'points'
    ];

    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}
