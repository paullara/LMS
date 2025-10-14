<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Assignment;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'status',
        'due_date',
        'picture',
        'priority',
        'progress',
        'related_class_id',
        'related_type',
        'assignment_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function relatedClass()
    {
        return $this->belongsTo(ClassModel::class, 'related_class_id');
    }

    public function assignment()
    {
        return $this->belongsTo(Assignment::class);
    }

    /**
     * Calculate progress based on type
     */
    public function calculateProgress()
    {
        // Only handle assignments
        if ($this->related_type !== 'assignment' || !$this->assignment) {
            return $this->progress ?? 0;
        }

        // Get all students in the class
        $totalStudents = $this->relatedClass ? $this->relatedClass->students()->count() : 0;

        if ($totalStudents === 0) {
            return 0;
        }

        // Count how many students have been graded for this assignment
        $gradedSubmissions = $this->assignment->submissions()->whereNotNull('grade')->count();

        $progress = round(($gradedSubmissions / $totalStudents) * 100, 2);

        // Automatically update status if 100%
        if ($progress >= 100 && $this->status !== 'completed') {
            $this->status = 'completed';
            $this->progress = 100; // ensure it's 100
            $this->save();
        } else {
            $this->progress = $progress;
            $this->save();
        }

        return $progress;
    }



}
