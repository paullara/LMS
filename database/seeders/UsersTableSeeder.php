<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UsersTableSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            'admin', 'student', 'chairman', 'instructor'
        ];

        foreach ($roles as $role) {
            User::create([
                'firstname' => ucfirst($role) . ' User',
                'lastname' => 'Lastname',
                'email' => $role . '@example.com',
                'password' => Hash::make('password'),
                'role' => $role,
                'email_verified_at' => now(),
            ]);
        }
    }
}