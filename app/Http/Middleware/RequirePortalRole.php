<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\HttpFoundation\Response;

class RequirePortalRole
{
    public function handle(Request $request, Closure $next, string $requiredRole): Response
    {
        $user = $request->attributes->get('portal_user');

        if (! $user) {
            return redirect()->route('login')->withErrors([
                'auth' => 'Please sign in to continue.',
            ]);
        }

        $currentRole = $user->role instanceof UserRole
            ? $user->role->value
            : (string) $user->role;

        if ($currentRole !== $requiredRole) {
            return redirect()->route($currentRole === 'student' ? 'student.index' : 'mentor.index');
        }

        if (Schema::hasColumn('users', 'mentor_verified_at') && $requiredRole === 'mentor' && $user->mentor_verified_at === null) {
            return redirect()->route('login')->withErrors([
                'auth' => 'Your mentor profile is pending admin verification. Please wait for approval.',
            ]);
        }

        return $next($request);
    }
}
