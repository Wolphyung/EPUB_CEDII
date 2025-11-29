<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;

class PublicationResource extends JsonResource
{
    public function toArray($request)
    {
        $user = Auth::user();

        return [
            'id_publication' => $this->id_publication,
            'titre' => $this->titre,
            'contenu' => $this->contenu,
            'type' => $this->type,
            'date_publication' => $this->date_publication?->format('Y-m-d'),
            'source' => $this->source,
            'categorie' => $this->categorie ?? 'Général',
            'statut' => $this->statut,
            'fichier_url' => $this->fichier_url,
            'type_fichier' => $this->type_fichier,
            'nom_fichier_original' => $this->nom_fichier_original,
            'auteur' => $this->auteur,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'total_reactions' => $this->total_reactions ?? 0,
            'vues' => $this->vues ?? 0,

            // Important : savoir si l'utilisateur connecté a déjà réagi
            'userReacted' => $user ? $this->reactedUsers()->where('user_id', $user->id)->exists() : false,

            // Optionnel : savoir si l'utilisateur a déjà vu cette publication
            // (on implémentera plus tard si besoin)
        ];
    }
}