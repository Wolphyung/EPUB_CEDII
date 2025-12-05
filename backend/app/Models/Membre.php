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
        'prenom', // Champ ajouté
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

    protected $casts = [
        'date_naissance' => 'date',
        'email_verified_at' => 'datetime',
    ];
    // Ajoutez cette relation
    public function abonnements()
    {
        return $this->hasMany(Abonnement::class);
    }

    public function abonnementActif()
    {
        return $this->hasOne(Abonnement::class)
                    ->where('statut', 'actif')
                    ->where('date_fin', '>=', now())
                    ->latest();
    }

    // Accesseur pour l'avatar - retourne l'URL complète
    public function getAvatarAttribute($value)
    {
        if (!$value) {
            return null;
        }

        // Si c'est déjà une URL complète, la retourner telle quelle
        if (str_starts_with($value, 'http')) {
            return $value;
        }

        // Sinon, construire l'URL complète
        return asset('storage/' . $value);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }
    
   public function evenements()
    {
        return $this->hasMany(Evenement::class, 'membre_id');
    }

    // Accesseur pour compatibilité
    public function getNomCompletAttribute()
    {
        return $this->nom;
    }
}