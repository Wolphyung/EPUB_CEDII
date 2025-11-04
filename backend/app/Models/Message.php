<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'sender', 
        'email', 
        'content', 
        'category', 
        'read'
    ];
    
    // Ajout d'une propriété pour s'assurer que 'read' est traité comme un booléen
    protected $casts = [
        'read' => 'boolean',
    ];

    /**
     * Un message peut avoir plusieurs réponses de l'administrateur.
     */
    public function replies()
    {
        return $this->hasMany(AdminReply::class);
    }
}