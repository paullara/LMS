<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\StudentIdNumber;

class StudentIdNumberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $studentIds = [
            '20-SC-1030',
            '20-SC-1031',
            '20-SC-1032',
            '20-SC-1033',
            '20-SC-1034',
            '20-2C-1035',
        ];

        foreach ($studentIds as $idNumber) {
            StudentIdNumber::create([
                'student_id_number' => $idNumber,
            ]);
        }
    }
}
