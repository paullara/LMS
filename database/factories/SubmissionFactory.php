<?php

namespace Database\Factories;

use App\Models\Submission;
use App\Models\Assignment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SubmissionFactory extends Factory
{
    protected $model = Submission::class;

    public function definition()
    {
        return [
            'assignment_id' => Assignment::inRandomOrder()->first()?->id ?? Assignment::factory(),
            'student_id' => User::inRandomOrder()->first()?->id ?? User::factory(),
            'assignment_folder' => $this->faker->word . '_folder',
            'grade' => $this->faker->numberBetween(60, 100),
            'feedback' => $this->faker->optional()->sentence(),
        ];
    }
}