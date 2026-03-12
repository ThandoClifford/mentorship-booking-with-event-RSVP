<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireAdminSession
{
    public function handle(Request $request, Closure $next): Response
    {
        $adminId = (int) $request->session()->get('admin_user_id');

        if (! $adminId) {
            return redirect()->route('admin.login')->withErrors([
                'auth' => 'Please log in as admin to continue.',
            ]);
        }

        $admin = User::query()->find($adminId);

        if (! $admin) {
            $request->session()->forget('admin_user_id');

            return redirect()->route('admin.login')->withErrors([
                'auth' => 'Admin session expired. Please sign in again.',
            ]);
        }

        $role = $admin->role instanceof UserRole
            ? $admin->role->value
            : (string) $admin->role;

        if (! in_array($role, ['admin', 'super_admin'], true)) {
            $request->session()->forget('admin_user_id');

            return redirect()->route('admin.login')->withErrors([
                'auth' => 'Access denied: admin credentials required.',
            ]);
        }

        $request->attributes->set('admin_user', $admin);

        return $next($request);
    }
}
