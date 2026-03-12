<?php

namespace App\Enums;

enum UserRole: string
{
    case STUDENT = 'student';
    case MENTOR = 'mentor';
    case ADMIN = 'admin';
    case SUPER_ADMIN = 'super_admin';

    public static function values(): array
    {
        return [
            self::STUDENT->value,
            self::MENTOR->value,
            self::ADMIN->value,
            self::SUPER_ADMIN->value,
        ];
    }
}
