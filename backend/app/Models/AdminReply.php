<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminReply extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'message_id',
        'admin_id',
        'content', // Le contenu de la réponse de l'admin
    ];

    /**
     * Une réponse de l'admin appartient à un message.
     */
    public function message()
    {
        return $this->belongsTo(Message::class);
    }
    
    // Si vous utilisez un système d'authentification pour les administrateurs
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}