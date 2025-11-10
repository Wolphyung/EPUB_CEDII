<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Membre extends Authenticatable
{
    use HasFactory, HasApiTokens;

    protected $fillable = [
        'nom',
        'prenom',
        'type',
        'email',
        'password',
        'statut',
        'avatar',
        'telephone',
        'adresse',
        'ville',
        'pays',
        'bio',
        'date_naissance',
        'profession',
        'site_web',
        'linkedin',
        'twitter'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];
}