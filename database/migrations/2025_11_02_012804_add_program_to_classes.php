<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->enum('program', [
                'Bachelor of Science in Business Administration', 
                'Bachelor of Science in Information Technology', 
                'Bachelor of Science in Hospitality Management', 
                'Bachelor of Science in Office Administration',
                'Bachelor of Elementary Education',
                'Bachelor of Secondary Education',
                'Bachelor of Technology and Livelihood Education',
                'Bachelor of Science in Agriculture'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            //
        });
    }
};