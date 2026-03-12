<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');

        $middleware->alias([
            'role' => \App\Http\Middleware\RequireRole::class,
            'req.id' => \App\Http\Middleware\RequestId::class,
            'request.id' => \App\Http\Middleware\RequestId::class,
            'sec.headers' => \App\Http\Middleware\SecurityHeaders::class,
            'admin.session' => \App\Http\Middleware\RequireAdminSession::class,
            'portal.session' => \App\Http\Middleware\RequirePortalSession::class,
            'portal.role' => \App\Http\Middleware\RequirePortalRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (Throwable $exception, Request $request) {
            if ($exception instanceof TokenMismatchException && ! $request->expectsJson() && ! $request->is('api/*')) {
                return redirect()->route('login')->withErrors([
                    'auth' => 'Your session expired. Please try again.',
                ]);
            }

            if (! $request->expectsJson() && ! $request->is('api/*')) {
                return null;
            }

            if ($exception instanceof ValidationException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'data' => null,
                    'errors' => $exception->errors(),
                ], 422);
            }

            if ($exception instanceof AuthenticationException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated',
                    'data' => null,
                ], 401);
            }

            if ($exception instanceof AuthorizationException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Forbidden',
                    'data' => null,
                ], 403);
            }

            if ($exception instanceof ModelNotFoundException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Resource not found',
                    'data' => null,
                ], 404);
            }

            if ($exception instanceof HttpExceptionInterface) {
                $status = $exception->getStatusCode();
                $message = $exception->getMessage() ?: 'HTTP error';

                return response()->json([
                    'success' => false,
                    'message' => $message,
                    'data' => null,
                ], $status);
            }

            Log::error('Unhandled API exception', [
                'exception' => get_class($exception),
                'message' => $exception->getMessage(),
                'trace' => $exception->getTraceAsString(),
            ]);

            if (app()->bound('sentry')) {
                app('sentry')->configureScope(function ($scope) use ($request): void {
                    if ($request->user()) {
                        $scope->setUser([
                            'id' => (string) $request->user()->id,
                        ]);
                    }

                    $scope->setTag('route', $request->route()?->getName() ?? 'unnamed');
                    $scope->setTag('path', $request->path());

                    $requestId = $request->header('X-Request-ID') ?: $request->attributes->get('request_id');
                    if ($requestId) {
                        $scope->setTag('request_id', (string) $requestId);
                    }
                });

                app('sentry')->captureException($exception);
            }

            $message = config('app.debug')
                ? ($exception->getMessage() ?: 'Server error')
                : 'Server error';

            return response()->json([
                'success' => false,
                'message' => $message,
                'data' => null,
            ], 500);
        });
    })->create();
