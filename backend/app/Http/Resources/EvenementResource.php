<?php

namespace App\Http\Resources;

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
            'fichier' => $this->fichier,
            'fichier_url' => $this->fichier_url,
            'auteur' => $this->auteur,
            'membre' => $this->whenLoaded('membre', function () {
                return [
                    'id' => $this->membre->id,
                    'nom_complet' => $this->membre->nom_complet,
                    'email' => $this->membre->email,
                ];
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}