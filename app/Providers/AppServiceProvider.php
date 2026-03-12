<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (app()->environment('production')) {
            URL::forceScheme('https');
        }

        RateLimiter::for('login', function (Request $request) {
            $email = (string) $request->input('email', '');

            return Limit::perMinute(5)->by($request->ip().'|'.strtolower($email));
        });

        RateLimiter::for('register', function (Request $request) {
            return Limit::perMinute(3)->by((string) $request->ip());
        });

        RateLimiter::for('api', function (Request $request) {
            if ($request->user()) {
                return Limit::perMinute(60)->by((string) $request->user()->id);
            }

            return Limit::perMinute(30)->by((string) $request->ip());
        });
    }
}
