<?php

/**
 * Laravel - A PHP Framework For Web Artisans
 * This file allows us to emulate Apache's "mod_rewrite" functionality
 * from the built-in PHP web server. It's only really needed if you
 * want to run `php artisan serve` without having a proper web server.
 */

$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? ''
);

// If the requested URI exists in public folder, return it directly
if ($uri !== '/' && file_exists(__DIR__.'/public'.$uri)) {
    return false;
}

// Otherwise, load Laravel's front controller
require_once __DIR__.'/public/index.php';