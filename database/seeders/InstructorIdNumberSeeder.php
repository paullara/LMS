<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\InstructorIdNumber;

class InstructorIdNumberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $instructorIds = [
            '20-SC-1000',
            '20-SC-1001',
            '20-SC-1002',
            '20-SC-1003',
            '20-SC-1004',
            '20-2C-1005',
        ];

        foreach ($instructorIds as $idNumber) {
            InstructorIdNumber::create([
                'instructor_id_number' => $idNumber,
            ]);
        }
    }
}
