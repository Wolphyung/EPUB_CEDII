<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Evenement extends Model
{
    use HasFactory;

    // Le nom de la table est déjà correct
    protected $table = 'evenements'; 
    
    // ✅ Mise à jour de $fillable pour correspondre aux colonnes de la DB et du Controller
    protected $fillable = [
        'titre',
        'description',
        'date_heure', // CORRIGÉ : Nom de la colonne dans la DB
        'lieu',
        'type',       // AJOUTÉ : Requis par la validation du Controller
        'statut',     // AJOUTÉ : Requis par la validation du Controller
        'fichier',    // CORRIGÉ : Nom de la colonne dans la DB
        // 'created_at' et 'updated_at' sont gérés automatiquement
    ];
}