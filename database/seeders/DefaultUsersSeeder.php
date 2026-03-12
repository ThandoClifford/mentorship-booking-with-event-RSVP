<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DefaultUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'superadmin@ump.test'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('Password123!'),
                'role' => UserRole::SUPER_ADMIN->value,
            ]
        );

        User::firstOrCreate(
            ['email' => 'admin@ump.test'],
            [
                'name' => 'Admin',
                'password' => Hash::make('Password123!'),
                'role' => UserRole::ADMIN->value,
            ]
        );

        User::firstOrCreate(
            ['email' => 'mentor@ump.test'],
            [
                'name' => 'Mentor',
                'password' => Hash::make('Password123!'),
                'role' => UserRole::MENTOR->value,
            ]
        );

        User::firstOrCreate(
            ['email' => 'student@ump.test'],
            [
                'name' => 'Student',
                'password' => Hash::make('Password123!'),
                'role' => UserRole::STUDENT->value,
            ]
        );
    }
}
