<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    protected $fillable = [
        'instructor_id',
        'class_id',
        'title',
        'message',
        'class_code',
        'is_public'
    ];

    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function class()
    {
        return $this->belongsTo(ClassModel::class, 'class_id');
    }
}
