<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->integer('progress')->default(0); // percentage 0–100
            $table->foreignId('related_class_id')
                ->nullable()
                ->constrained('classes') // 👈 change if your table name is different
                ->onDelete('set null');
            $table->string('related_type')->nullable(); // e.g. "grading", "materials", "attendance"
        });
    }


    /**
     * Reverse the migrations.
     */
   public function down()
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['related_class_id']);
            $table->dropColumn(['progress', 'related_class_id', 'related_type']);
        });
    }
};
