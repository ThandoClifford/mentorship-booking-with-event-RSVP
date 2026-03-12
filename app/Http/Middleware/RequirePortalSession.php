<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequirePortalSession
{
    public function handle(Request $request, Closure $next): Response
    {
        $userId = (int) $request->session()->get('portal_user_id');

        if (! $userId) {
            return redirect()->route('login')->withErrors([
                'auth' => 'Please sign in to continue.',
            ]);
        }

        $user = User::query()->find($userId);

        if (! $user) {
            $request->session()->forget(['portal_user_id', 'portal_selected_role']);

            return redirect()->route('login')->withErrors([
                'auth' => 'Session expired. Please sign in again.',
            ]);
        }

        $request->attributes->set('portal_user', $user);

        return $next($request);
    }
}
