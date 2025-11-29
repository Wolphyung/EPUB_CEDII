<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EvenementReaction extends Model
{
    use HasFactory;

    protected $table = 'evenement_reactions';

    protected $fillable = [
        'evenement_id',
        'visitor_id',
        'type', // like, love, etc.
    ];

    public function evenement(): BelongsTo
    {
        return $this->belongsTo(Evenement::class, 'evenement_id');
    }
}