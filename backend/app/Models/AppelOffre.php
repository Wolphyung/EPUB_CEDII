<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
        'type',
        'localisation',
        'salaire',
        'urgent',
    ];
    
    protected $casts = [
        'urgent' => 'boolean',
    ];

    // Relations avec les réactions et vues
    public function reactions(): HasMany
    {
        return $this->hasMany(AppelOffreReaction::class, 'appel_offre_id');
    }

    public function vues(): HasMany
    {
        return $this->hasMany(AppelOffreVue::class, 'appel_offre_id');
    }

    // Accesseurs pour les statistiques
    public function getTotalReactionsAttribute()
    {
        return $this->reactions()->count();
    }

    public function getTotalVuesAttribute()
    {
        return $this->vues()->count();
    }

    // Méthodes pour vérifier les interactions du visiteur
    public function hasReacted($visitorId)
    {
        return $this->reactions()->where('visitor_id', $visitorId)->exists();
    }

    public function hasViewed($visitorId)
    {
        return $this->vues()->where('visitor_id', $visitorId)->exists();
    }

    // Accesseur pour l'URL du fichier
    public function getFichierUrlAttribute()
    {
        return $this->fichier ? asset('storage/' . $this->fichier) : null;
    }
}