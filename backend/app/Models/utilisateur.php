<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class Utilisateur extends Authenticatable
{
    protected $table = 'utilisateurs';       // Nom exact de la table
    protected $primaryKey = 'id_utilisateur'; // Clé primaire correcte
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'nom',
        'email',
        'password',
    ];
}
