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
                'title' => 'Upload new Assignment',
                'description' => 'add new assignment in machine learning 1',
                'status' => 'pending',
            ],
            [
                'user_id' => $userId,
                'title' => 'Add new member to my class',
                'description' => 'Add student in my class.',
                'status' => 'pending',
            ],
        ];

        foreach ($tasks as $task) {
            Task::create($task);
        }
    }
}