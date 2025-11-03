<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\HandleCors;
use App\Http\Middleware\UpdateLastSeen;
use App\Http\Middleware\isActiveClass;


return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            UpdateLastSeen::class,
        ]);
        $middleware->alias([
            'admin' => \App\Http\Middleware\isAdmin::class,
            'instructor' => \App\Http\Middleware\isInstructor::class,
            'chairman' => \App\Http\Middleware\isChairman::class,
            'lastseen' => UpdateLastSeen::class,
                'activeclass' => \App\Http\Middleware\isActiveClass::class,
        ]);
        $middleware->append(
            HandleCors::class,
        );
        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();