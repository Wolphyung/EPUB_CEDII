<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppelOffreReaction extends Model
{
    use HasFactory;

    protected $table = 'appel_offre_reactions';

    protected $fillable = [
        'appel_offre_id',
        'visitor_id',
        'type',
    ];

    public function appelOffre(): BelongsTo
    {
        return $this->belongsTo(AppelOffre::class, 'appel_offre_id');
    }
}