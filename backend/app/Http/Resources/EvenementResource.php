<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class EvenementResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
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
            'fichier' => $this->fichier ? url('storage/' . $this->fichier) : null,
            'file_name' => $this->fichier ? basename($this->fichier) : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}