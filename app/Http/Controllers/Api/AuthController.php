<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    use ApiResponse;

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            'role' => ['nullable', 'string', Rule::in(UserRole::values())],
        ]);

        $assignedRole = UserRole::STUDENT->value;
        $authUser = auth('sanctum')->user();

        if ($authUser && $authUser->isRole(UserRole::ADMIN->value, UserRole::SUPER_ADMIN->value)) {
            $assignedRole = $validated['role'] ?? UserRole::STUDENT->value;
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $assignedRole,
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        return $this->success('Registered successfully', [
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return $this->failure('Invalid credentials', null, 401);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return $this->success('Login successful', [
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return $this->success('Logout successful');
    }

    public function me(Request $request)
    {
        return $this->success('Authenticated user', $request->user());
    }
}
