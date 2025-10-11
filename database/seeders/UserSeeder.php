<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Example Instructor
        User::create([
            'firstname' => 'John',
            'lastname' => 'Doe',
            'email' => 'instructor@example.com',
            'password' => Hash::make('password'),
            'role' => 'instructor',
        ]);

        // ✅ Create multiple students
        $students = [
            [
                'firstname' => 'Alice',
                'lastname' => 'Reyes',
                'email' => 'alice@student.com',
            ],
            [
                'firstname' => 'Ben',
                'lastname' => 'Cruz',
                'email' => 'ben@student.com',
            ],
            [
                'firstname' => 'Clara',
                'lastname' => 'Lopez',
                'email' => 'clara@student.com',
            ],
        ];

        foreach ($students as $student) {
            User::create([
                'firstname' => $student['firstname'],
                'lastname' => $student['lastname'],
                'email' => $student['email'],
                'password' => Hash::make('password'),
                'role' => 'student',
            ]);
        }
    }
}