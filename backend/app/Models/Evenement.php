<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    // ✅ Relation avec les réactions
    public function reactions(): HasMany
    {
        return $this->hasMany(EvenementReaction::class, 'evenement_id');
    }

    // ✅ Relation avec les vues
    public function vues(): HasMany
    {
        return $this->hasMany(EvenementVue::class, 'evenement_id');
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

    // ✅ Accesseur pour le nombre total de réactions
    public function getTotalReactionsAttribute()
    {
        return $this->reactions()->count();
    }

    // ✅ Accesseur pour le nombre total de vues
    public function getTotalVuesAttribute()
    {
        return $this->vues()->count();
    }

    // ✅ Méthode pour vérifier si un visiteur a déjà réagi
    public function hasReacted($visitorId)
    {
        return $this->reactions()->where('visitor_id', $visitorId)->exists();
    }

    // ✅ Méthode pour vérifier si un visiteur a déjà vu
    public function hasViewed($visitorId)
    {
        return $this->vues()->where('visitor_id', $visitorId)->exists();
    }
}