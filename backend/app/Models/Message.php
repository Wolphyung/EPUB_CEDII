<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'membre_id',
        'sender',
        'email', 
        'category',
        'content',
        'read',
        'is_from_admin'
    ];

    protected $casts = [
        'read' => 'boolean',
        'is_from_admin' => 'boolean'
    ];

    public function membre()
    {
        return $this->belongsTo(Membre::class);
    }

    public function replies()
    {
        return $this->hasMany(AdminReply::class);
    }
}