<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuditService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class MentorController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $mentors = User::where('role', UserRole::MENTOR->value)->latest()->get();

        return $this->success('Mentors retrieved', $mentors);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
        ]);

        $mentor = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => UserRole::MENTOR->value,
        ]);

        AuditService::log(
            $request->user()->id,
            'mentor.created',
            'User',
            $mentor->id,
            [
                'role' => UserRole::MENTOR->value,
            ]
        );

        return $this->success('Mentor created', $mentor, 201);
    }

    public function update(Request $request, string $id)
    {
        $mentor = User::where('id', $id)
            ->where('role', UserRole::MENTOR->value)
            ->first();

        if (! $mentor) {
            return $this->failure('Mentor not found', null, 404);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($mentor->id),
            ],
        ]);

        $mentor->update($validated);

        AuditService::log(
            $request->user()->id,
            'mentor.updated',
            'User',
            $mentor->id,
            [
                'fields' => array_keys($validated),
            ]
        );

        return $this->success('Mentor updated', $mentor->fresh());
    }

    public function destroy(string $id)
    {
        $mentor = User::where('id', $id)
            ->where('role', UserRole::MENTOR->value)
            ->first();

        if (! $mentor) {
            return $this->failure('Mentor not found', null, 404);
        }

        $mentor->delete();

        AuditService::log(
            auth()->id(),
            'mentor.deleted',
            'User',
            $mentor->id
        );

        return $this->success('Mentor deleted');
    }
}
