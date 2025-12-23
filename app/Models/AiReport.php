<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiReport extends Model
{
    protected $fillable = [
        'class_id',
        'average_score',
        'pass_rate',
        'submission_count',
        'score_variance',
        'risk_score',
        'risk_level',
    ];

    public function class()
    {
        return $this->belongsTo(ClassModel::class);
    }

}
