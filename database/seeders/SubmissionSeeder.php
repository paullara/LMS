<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Submission;

class SubmissionSeeder extends Seeder
{
    public function run()
    {
        Submission::factory()->count(30)->create();
    }
}