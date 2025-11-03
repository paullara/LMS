<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClassModel extends Model
{
    use HasFactory;

    protected $table = "classes";

    protected $fillable = [
        'name',
        'description',
        'subcode',
        'chairman_id',
        'instructor_id',
        'photo',
        'schedule',
        'yearlevel',
        'section',
        'start_time',
        'end_time',
        'code',
        'program',
        'day',
        'is_active'
    ];

    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function students()
    {
        return $this->belongsToMany(User::class, 'class_student', 'class_id', 'student_id');
    }

    public function materials()
    {
        return $this->hasMany(Material::class, 'class_id');
    }

    public function assignments()
    {
        return $this->hasMany(Assignment::class, 'class_id');
    }

    public function threads()
    {
        return $this->hasmany(Thread::class, 'class_id');
    }
}