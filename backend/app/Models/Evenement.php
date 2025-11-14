<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Evenement extends Model
{
    use HasFactory;

    protected $table = 'evenements';

    protected $fillable = [
        'titre',
        'description',
        'date_heure',
        'lieu',
        'type',
        'statut',
        'fichier',
        'membre_id',
    ];

    // ✅ Relation avec le modèle Membre
    public function membre(): BelongsTo
    {
        return $this->belongsTo(Membre::class, 'membre_id');
    }

    // ✅ Accesseur pour le nom de l'auteur
    public function getAuteurAttribute()
    {
        return $this->membre ? $this->membre->nom_complet ?? $this->membre->name ?? 'Auteur inconnu' : 'Auteur inconnu';
    }

    // ✅ Accesseur pour l'URL du fichier
    public function getFichierUrlAttribute()
    {
        return $this->fichier ? asset('storage/' . $this->fichier) : null;
    }
}