<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PublicationReaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'publication_id',
        'user_id',
        'visitor_id',
        'ip_address',
        'user_agent'
    ];

    public function publication()
    {
        return $this->belongsTo(Publication::class, 'publication_id', 'id_publication');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}