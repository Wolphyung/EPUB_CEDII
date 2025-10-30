<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EvenementResource extends JsonResource
{
    public function toArray($request)
{
    return [
        'id' => $this->id,
        'titre' => $this->titre,
        'description' => $this->description,
        'date_heure' => $this->date_heure,
        'lieu' => $this->lieu,
        'type' => $this->type,
        'statut' => $this->statut,
        'fichier' => $this->fichier ? asset('storage/'.$this->fichier) : null,
    ];
}
}
