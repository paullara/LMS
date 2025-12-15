<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InstructorAnnouncement extends Model
{
    protected $fillable = [
        'class_id',
        'instructor_id',
        'announcement',
    ];

    public function instructor()
    {
        return $this->belongsTo(User::class);
    }

    public function class()
    {
        return $this->belongsTo(ClassModel::class, 'class_id');
    }
}