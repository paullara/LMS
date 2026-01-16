<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnswerRubricScore extends Model
{
    protected $fillable = [
        'answer_id',
        'title',
        'points_awarded'
    ];

    public function answer()
    {
        return $this->belongsTo(Answer::class);
    }
}
