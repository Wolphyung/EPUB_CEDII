<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppelOffre extends Model
{
    use HasFactory;

    protected $fillable = [
        'intitule',
        'description',
        'date_ouverture',
        'date_cloture',
        'membre',
        'fichier',
        'statut',
    ];
}
