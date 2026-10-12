<?php

namespace App\Enums;

enum UserRole: string
{
    case Student = 'student';
    case Contributor = 'contributor';
    case Admin = 'admin';

    public function label(): string
    {
        return match ($this) {
            self::Student => 'Étudiant',
            self::Contributor => 'Contributeur',
            self::Admin => 'Administrateur',
        };
    }
}
