<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\AIEndpointController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\MessageController;

// classrooms
Route::get('/classroom', [AdminController::class, 'classroom'])->name('classroom');

// students api
Route::get('/quizzes/{classId}', [QuizController::class, 'getQuizzes']);
Route::get('/students', [AdminController::class, 'getStudents']);
Route::post('/quiz', [QuizController::class, 'store']);


// routes/api.php
Route::get('/instructor/groups/{group}/messages', [MessageController::class, 'index'])->middleware('auth:sanctum');
Route::post('/instructor/groups/{group}/messages', [MessageController::class, 'store'])->middleware('auth:sanctum');
Route::get('/quizzes/submissions', [AIEndpointController::class, 'quizSubmissions']);
Route::post('/ai/class-performance', [AIEndpointController::class, 'storeClassPerformance']);
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');