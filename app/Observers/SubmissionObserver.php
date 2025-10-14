<?php

namespace App\Observers;

use App\Models\Submission;
use App\Models\Task;
use Illuminate\Support\Facades\Log;

class SubmissionObserver
{
    /**
     * Handle the Submission "saved" event.
     */
    public function saved(Submission $submission)
    {
        Log::info('SubmissionObserver triggered for submission ID: ' . $submission->id);

        $assignment = $submission->assignment;
        if (!$assignment) return;

        $classId = $assignment->class_id;

        $task = \App\Models\Task::where('related_class_id', $classId)
            ->where('related_type', 'assignment')
            ->first();

        if (!$task) return;

        $progress = $task->calculateProgress();

        Log::info("Calculated progress for class {$classId}: {$progress}");

        $task->update(['progress' => $progress]);
    }
}
