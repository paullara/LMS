<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\ClassModel;

class isActiveClass
{
    public function handle(Request $request, Closure $next)
    {
        $classId = $request->route('id'); // {id} from /classroom/show/{id}

        if ($classId) {
            $class = ClassModel::find($classId);

            if ($class) {
                $class->is_active = now();
                $class->save();
            }
        }

        return $next($request);
    }
}