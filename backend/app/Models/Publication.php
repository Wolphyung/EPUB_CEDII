<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Publication extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_publication';

    protected $fillable = [
        'titre',
        'contenu',
        'type',
        'date_publication',
        'source',
        'categorie',
        'statut',
        'id_utilisateur',
    ];

    // Optionnel : relation avec l'utilisateur
    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur', 'id_utilisateur');
    }
}
