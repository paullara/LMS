<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Task;

class TaskSeeder extends Seeder
{
    public function run()
    {
        $userId = 5;

        $tasks = [
            [
                'user_id' => $userId,
                'title' => 'Complete Cognitive Psychology Report',
                'description' => 'Write a detailed report on memory processes and cognitive biases for the upcoming class discussion.',
                'status' => 'pending',
                'assignment_id' => 1,
            ],
            [
                'user_id' => $userId,
                'title' => 'Conduct Interview for Research Project',
                'description' => 'Interview one participant for the “Personality and Behavior” study and record observations.',
                'status' => 'pending',
                'assignment_id' => 2,
            ],
            [
                'user_id' => $userId,
                'title' => 'Prepare Presentation on Abnormal Psychology',
                'description' => 'Create slides and prepare notes about anxiety disorders and their treatments.',
                'status' => 'in-progress',
                'assignment_id' => 3,
            ],
            [
                'user_id' => $userId,
                'title' => 'Review Chapter on Developmental Psychology',
                'description' => 'Read and summarize the stages of Erik Erikson’s psychosocial development theory.',
                'status' => 'pending',
                'assignment_id' => 4,
            ],
        ];

        foreach ($tasks as $task) {
            Task::create($task);
        }
    }
}
