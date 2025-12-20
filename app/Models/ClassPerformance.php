<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClassPerformance extends Model
{
    protected $fillable = [
        'class_id',
        'average_score',
        'pass_rate',
        'status'
    ];

    public function class()
    {
        return $this->belongsTo(ClassModel::class);
    }
}
