<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppelOffreVue extends Model
{
    use HasFactory;

    protected $table = 'appel_offre_vues';

    protected $fillable = [
        'appel_offre_id',
        'visitor_id',
    ];

    public function appelOffre(): BelongsTo
    {
        return $this->belongsTo(AppelOffre::class, 'appel_offre_id');
    }
}