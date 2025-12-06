<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\AssController;
use App\Http\Controllers\AverageController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\ChairmanController;
use App\Http\Controllers\ClassController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\InstructorController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\VideoCallMessageController;
use App\Http\Controllers\ClassMaterialController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProgressController;
use App\Http\Controllers\ThreadController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\Auth\RegisterInstructorController;
use App\Http\Controllers\SubmissionController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\VideoCallController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/unauthorized', function () {
    return Inertia::render('Unauthorized');
})->name('unauthorized');;

Route::get('/instructor/register', [RegisterInstructorController::class, 'create'])->name('instructor.create');
Route::post('/instructor/register', [RegisterInstructorController::class, 'store'])->name('instructor.register');

Route::middleware(['auth'])->group(function () {
    Route::get('/student/dashboard', [StudentController::class, 'dashboard'])->name('student.dashboard');
    Route::get('/student/classroom', [StudentController::class, 'classroom'])->name('classroom');
    Route::get('/classroom/{id}', [StudentController::class, 'show'])->name('classes.show');
    Route::post('/assignment/submit', [StudentController::class, 'submit'])->name('assignment.submit');
    Route::put('/submissions/{submission}/grade', [SubmissionController::class, 'addGrade']);
    Route::put('/submissions/grade/{submission}', [AssController::class, 'addGrade']);
    Route::get('/student/notifications', [NotificationController::class, 'notification'])->name('student.notifications');
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/quizzes/{quiz}/submit', [QuizController::class, 'submit'])->name('quiz.submit');
    Route::get('/instructor/profile', [InstructorController::class, 'editProfile'])->name('instructor.profile');
    Route::put('/instructor/profile', [InstructorController::class, 'update'])->name('instructor.profile.update');
    Route::get('/student/json', [DashboardController::class, 'getAuthStudent']);
    Route::get('/student/dashboard/data', [DashboardController::class, 'getMyClass']);
    Route::post('/classes/join', [StudentController::class, 'join']);
    Route::get('/instructor/announcements', [AnnouncementController::class, 'index']);
    Route::post('/instructor/announcements', [AnnouncementController::class, 'store']);
    Route::get('/announcements/public', [AnnouncementController::class, 'publicAnnouncements']);
    Route::get('/student/announcement', [StudentController::class, 'announcement'])->name('student.announcement');
    Route::get('/search-instructors', [StudentController::class, 'search']);
    Route::get('/instructor/{id}/announcements', [AnnouncementController::class, 'byInstructor'])->name('search.result');
});

Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/admin/instructors', [AdminController::class, 'index'])->name('admin.instructor');
    Route::get('/admin/manage-account', [AdminController::class, 'manageInstructor'])->name('instructor.manage');
    Route::post('/instructor/store', [AdminController::class, 'store'])->name('instructor.store');
    Route::get('/instructor/{user}/edit', [AdminController::class, 'edit'])->name('instructor.edit');
    Route::put('/instructor/{user}', [AdminController::class, 'update'])->name('instructor.update');
    Route::delete('/instructor/{user}', [AdminController::class, 'destroy'])->name('instructor.destroy');
    Route::get('/classroom', [AdminController::class, 'createClassroom'])->name('classroom.create');
    Route::post('/classroom', [AdminController::class, 'storeClassroom'])->name('classroom.store');
    Route::get('/admin/classroom/{id}', [AdminController::class, 'showClassroom'])->name('admin.classroom.show');
    Route::get('/admin/classroom', [AdminController::class, 'classroomView'])->name('classroom.view');
    Route::get('/admin/profile', [AdminController::class, 'profile'])->name('admin.profile');
    Route::put('/admin/profile/update', [AdminController::class, 'updateProfile'])->name('admin.profile.update');
    Route::post('/admin/classroom/{id}/add-student', [AdminController::class, 'addStudent'])->name('admin.classroom.addStudent');
    Route::get('/admin/students', [AdminController::class, 'studentsAccount'])->name('students.account');
    Route::put('/student/{id}/reset', [AdminController::class, 'resetPassword']);
});

Route::middleware(['auth', 'instructor'])->group(function () {
    Route::get('/instructor/dashboard', [InstructorController::class, 'dashboard'])->name('instructor.dashboard');
    Route::get('/instructor/class', [InstructorController::class, 'classList'])->name('instructor.classList');
    Route::get('/instructor/list/class', [InstructorController::class, 'testClassroomList'])->name('test.list');
    Route::get('/instructor/classes/list', [InstructorController::class, 'jsonClassList'])->name('json.classList');
    Route::get('/instructor/create-class', [InstructorController::class, 'create'])->name('instructor.create');
    Route::get('/instructor/{id}/editClass', [InstructorController::class, 'edit'])->name('instructor.classroom.edit');
    Route::put('/instructor/classroom/{id}', [InstructorController::class, 'updateClassroom'])->name('classroom.update');
    Route::delete('/instructor/classroom/{id}', [InstructorController::class, 'destroy'])->name('classroom.destroy');
    Route::post('/instructor/classes', [InstructorController::class, 'storeClassroom'])->name('instructor.classes.store');
    Route::get('/instructor/classroom/{id}', [InstructorController::class, 'show'])->name('instructor.classroom.show');
    Route::get('/classroom/show/{id}', [InstructorController::class, 'testClassroom'])->middleware('activeclass')->name('test.classroom');
    // Route::post('/quiz', [QuizController::class, 'store'])->name('quiz.store');
    Route::get('/students/search', [InstructorController::class, 'searchStudents']);
    Route::post('/instructor/{id}/add-member', [InstructorController::class, 'addStudentToClassroom']);
    Route::delete('/classroom/{classId}/remove-student/{studentId}', [InstructorController::class, 'removeStudent']);
    Route::delete('/quiz/{quizId}', [InstructorController::class, 'removeQuiz']);
    Route::get('/instructor/student-progress', [InstructorController::class, 'studentProgress'])->name('instructor.student.progress');
    Route::get('/instructor/announcement', [InstructorController::class, 'announcement'])->name('instructor.announcement');
    Route::post('/classroom/heartbeat/{id}', [InstructorController::class, 'heartbeat']);
    Route::get('/instructor/notifications', function () {
        return Inertia::render('Instructor/Notification');
    })->name('instructor.notification');
    Route::get('/notifications', function () {
        return response()->json([
            'notifications' => auth()->user()->notifications
        ]);
    });
    Route::get('/instructor/classlist/improved', [InstructorController::class, 'improvedClassList'])->name('improved.classList');
});

Route::middleware(['auth', 'chairman'])->group(function () {
    Route::get('/chairman/dashboard', [ChairmanController::class, 'dashboard'])->name('chairman.dashboard');
    Route::get('/chairman/create/classes', [ChairmanController::class, 'createClasses'])->name('chairman.create.classes');
    Route::get('/chairman/created/classes', [ChairmanController::class, 'createdClasses']);
    Route::post('/chairman/create/class', [ChairmanController::class, 'storeClassroom']);
    Route::get('/chairman/classes', [ChairmanController::class, 'classes'])->name('chairman.created.classes');
    Route::get('/chairman/get/instructors', [ChairmanController::class, 'getInstructors']);
});

// Chairman creates a draft
Route::post('/chairman/classes/draft', [ClassController::class, 'chairmanCreateDraft'])
    ->name('chairman.classes.draft');

// Instructor fetches all drafts
Route::get('/instructor/classes/drafts', [ClassController::class, 'instructorDrafts'])
    ->name('instructor.classes.drafts');

// Instructor completes a draft
Route::post('/instructor/classes/drafts/complete', [ClassController::class, 'completeDraft'])
    ->name('instructor.classes.complete');


Route::get('/classroom/{id}/members', [InstructorController::class, 'getMembers']);
Route::get('/student/{id}/grade', [AverageController::class, 'grade']);
Route::get('/threads/{id}', [InstructorController::class, 'getThreads']);
Route::post('/classroom/{classroom}/materials', [MaterialController::class, 'store'])->name('materials.store');
Route::post('/classroom/{classroom}/assignments', [InstructorController::class, 'storeAss'])->name('assignments.store');
Route::post('/classroom/{id}/thread', [InstructorController::class, 'storeThread'])->name('thread.store');
Route::post('/classroom/{id}/threads', [ThreadController::class, 'storeThreads']);
Route::post('/thread/{thread}/reply', [InstructorController::class, 'storeReply'])->name('thread.reply');
Route::post('/threads/{thread}/replies', [ThreadController::class, 'storeThreadReply']);
Route::post('/replies', [ThreadController::class, 'storeReply']);
Route::get('/quizzes/{id}', [QuizController::class, 'getQuizzes']);
Route::get('/submissions/quiz', [QuizController::class, 'submissions']);
Route::get('/instructors/json', [DashboardController::class, 'getInstructor']);
Route::get('/students/json', [DashboardController::class, 'getStudents']);
Route::get('/classes/json', [DashboardController::class, 'getClasses']);
Route::get('/task/json', [DashboardController::class, 'getTasks']);
Route::get('/instructor/classes-progress', [ProgressController::class, 'studentProgress']);
Route::get('/video-call/{id}/messages', [VideoCallMessageController::class, 'index']);
Route::post('/video-call/{id}/messages', [VideoCallMessageController::class, 'store']);


Route::middleware('auth')->group(function () {
    Route::post('/instructor/classroom/{id}/add-student', [InstructorController::class, 'addStudent'])->name('instructor.classroom.addStudent');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile/update', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/tasks', [TaskController::class, 'index'])->name('tasks.index');
    Route::get('/tasks/json', [TaskController::class, 'getTasks']);
    Route::post('/tasks', [TaskController::class, 'store'])->name('tasks.store');
    Route::put('/tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');
    Route::get('/instructor/groups', [GroupController::class, 'index'])->name('instructor.groups.index');
    Route::get('/instructor/groups/create', [GroupController::class, 'create'])->name('instructor.groups.create');
    Route::post('/instructor/groups', [GroupController::class, 'store'])->name('instructor.groups.store');
    Route::get('/instructor/groups/{group}', [GroupController::class, 'show'])->name('instructor.groups.show');
    Route::get('/groups/{group}/messages', [MessageController::class, 'index'])->name('groups.messages.index');
    Route::post('/groups/{group}/messages', [MessageController::class, 'store'])->name('groups.messages.store');
    Route::get('/groups/{group}/students/search', [GroupController::class, 'searchStudents'])->name('instructor.groups.students.search');
    Route::post('/instructor/groups/{group}/add-student', [GroupController::class, 'assignStudents'])->name('instructor.groups.addStudent');
    Route::get('/student/groups', [StudentController::class, 'groups'])->name('student.groups');
    Route::get('/student/groups/{group}', [StudentController::class, 'showGroup'])->name('student.groups.show');
    Route::get('/student/test/profile', [StudentController::class, 'testProfile'])->name('student.test.profile');
});

Route::get('auth/google', [GoogleController::class, 'redirectToGoogle'])->name('redirect.google');
Route::get('auth/google/redirect/instructor', [GoogleController::class, 'redirectToGoogleInstructor'])->name('google.instructor.redirect');
Route::get('auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);

Route::get('/video-call/{classroom}/start', [VideoCallController::class, 'start'])->name('video.call.start');
Route::post('/video-call/{id}/join', [VideoCallController::class, 'join'])->name('video.call.join');
Route::post('/video-call/{id}/end', [VideoCallController::class, 'end'])->name('video.call.end');
Route::get('/video-call/{videoCall}', [VideoCallController::class, 'show'])->name('video.call.show');
Route::get('/video-call/check/{classroom}', [VideoCallController::class, 'check']);
Route::get('/video-call/{id}/participants', [VideoCallController::class, 'participants']);
Route::post('/video-call/{id}/register-peer', [VideoCallController::class, 'registerPeer']);
Route::post('/video-call/{id}/leave', [VideoCallController::class, 'leave']);

// Anuthorized route

// refactor ver
Route::post('/class/materials/{classrom}', [ClassMaterialController::class, 'store']);
Route::get('/classroom/material/fetch/{id}', [ClassMaterialController::class, 'fetchMaterials']);
Route::post('/classroom/assignment/{classroom}/store', [AssController::class, 'storeAssignment']);
Route::get('/fetch/assignments/{id}', [AssController::class, 'getAssignment']);
require __DIR__.'/auth.php';