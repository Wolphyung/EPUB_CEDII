<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PublicationView extends Model
{
    use HasFactory;

    protected $fillable = [
        'publication_id',
        'visitor_id',
        'ip_address',
        'user_agent'
    ];

    public function publication()
    {
        return $this->belongsTo(Publication::class, 'publication_id', 'id_publication');
    }
}