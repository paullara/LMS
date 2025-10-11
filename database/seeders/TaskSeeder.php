<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Task;

class TaskSeeder extends Seeder
{
    public function run()
    {
        $userId = 8;

        $tasks = [
            [
                'user_id' => $userId,
                'title' => 'Review student projects',
                'description' => 'Go through each project and leave feedback.',
                'status' => 'pending',
            ],
            [
                'user_id' => $userId,
                'title' => 'Upload new lecture video',
                'description' => 'Add the latest recorded lecture to the portal.',
                'status' => 'pending',
            ],
            [
                'user_id' => $userId,
                'title' => 'Finalize grading sheet',
                'description' => 'Submit the grades for final review.',
                'status' => 'completed',
            ],
        ];

        foreach ($tasks as $task) {
            Task::create($task);
        }
    }
}