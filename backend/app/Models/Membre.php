<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Membre extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'type',
        'email',
        'password',
        'statut',
        'avatar',
    ];
 public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function getLastMessageAttribute()
    {
        return $this->messages()->orderBy('created_at', 'desc')->first();
    }

    public function getUnreadCountAttribute()
    {
        return $this->messages()->where('read', false)->count();
    }
    protected $hidden = [
        'password',
    ];
}
