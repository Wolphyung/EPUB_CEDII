<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TypeAbonnement extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'slug',
        'duree_jours',
        'prix',
        'description',
        'avantages',
        'is_active'
    ];

    protected $casts = [
        'avantages' => 'array',
        'is_active' => 'boolean',
        'prix' => 'decimal:2',
    ];

    public function abonnements()
    {
        return $this->hasMany(Abonnement::class, 'type_abonnement', 'slug');
    }
}