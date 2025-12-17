<?php
// app/Models/Abonnement.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Abonnement extends Model
{
    use HasFactory;

    protected $fillable = [
        'membre_id',
        'type_abonnement',
        'date_debut',
        'date_fin',
        'statut',
        'montant',
        'methode_paiement',
        'transaction_id',
        'notes'
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
        'montant' => 'decimal:0', // Pas de décimales pour les Ariary
    ];

    public function membre()
    {
        return $this->belongsTo(Membre::class);
    }

    // Scopes
    public function scopeActif($query)
    {
        return $query->where('statut', 'actif')
                     ->where('date_fin', '>=', now());
    }

    public function scopeExpire($query)
    {
        return $query->where('date_fin', '<', now())
                     ->orWhere('statut', 'expiré');
    }

    public function scopeHebdomadaire($query)
    {
        return $query->where('type_abonnement', 'hebdomadaire');
    }

    public function scopeMensuel($query)
    {
        return $query->where('type_abonnement', 'mensuel');
    }

    public function scopeAnnuel($query)
    {
        return $query->where('type_abonnement', 'annuel');
    }

    public function isActif()
    {
        return $this->statut === 'actif' && $this->date_fin >= now();
    }

    // Calculer le prix par jour
    public function getPrixParJourAttribute()
    {
        $jours = $this->date_debut->diffInDays($this->date_fin);
        if ($jours > 0) {
            return round($this->montant / $jours);
        }
        return $this->montant;
    }

    // Formater le montant en Ariary
    public function getMontantFormattedAttribute()
    {
        return number_format($this->montant, 0, ',', ' ') . ' AR';
    }
}