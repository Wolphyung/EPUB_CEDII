<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'message', 
        'organisation_name',
        'item_id',
        'item_type',
        'read',
        'user_id'
    ];

    protected $casts = [
        'read' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];
}