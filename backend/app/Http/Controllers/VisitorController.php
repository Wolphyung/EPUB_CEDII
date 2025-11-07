<?php
// app/Http/Controllers/VisitorController.php

namespace App\Http\Controllers;

use App\Http\Resources\PublicationResource;
use App\Http\Resources\EvenementResource;
use App\Http\Resources\AppelOffreResource;
use App\Models\Publication;
use App\Models\Evenement;
use App\Models\AppelOffre;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class VisitorController extends Controller
{
    // Publications validées
    public function getPublications()
    {
        try {
            $publications = Publication::where('statut', 'Validé')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => PublicationResource::collection($publications),
                'count' => $publications->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Erreur lors du chargement des publications',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Événements validés
    public function getEvenements()
    {
        try {
            $evenements = Evenement::where('statut', 'Validé')
                ->orderBy('date_heure', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => EvenementResource::collection($evenements),
                'count' => $evenements->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Erreur lors du chargement des événements',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Appels d'offre validés
    public function getAppelsOffre()
    {
        try {
            $appelsOffre = AppelOffre::where('statut', 'Validé')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => AppelOffreResource::collection($appelsOffre),
                'count' => $appelsOffre->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Erreur lors du chargement des appels d\'offre',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Détails d'un élément
    public function getDetail($type, $id)
    {
        try {
            switch ($type) {
                case 'publications':
                    $item = Publication::where('id', $id)
                        ->where('statut', 'Validé')
                        ->first();
                    
                    if (!$item) {
                        return response()->json([
                            'success' => false,
                            'error' => 'Publication non trouvée ou non validée'
                        ], 404);
                    }
                    
                    return response()->json([
                        'success' => true,
                        'data' => new PublicationResource($item)
                    ]);

                case 'evenements':
                    $item = Evenement::where('id', $id)
                        ->where('statut', 'Validé')
                        ->first();
                    
                    if (!$item) {
                        return response()->json([
                            'success' => false,
                            'error' => 'Événement non trouvé ou non validé'
                        ], 404);
                    }
                    
                    return response()->json([
                        'success' => true,
                        'data' => new EvenementResource($item)
                    ]);

                case 'appels-offre':
                    $item = AppelOffre::where('id', $id)
                        ->where('statut', 'Validé')
                        ->first();
                    
                    if (!$item) {
                        return response()->json([
                            'success' => false,
                            'error' => 'Appel d\'offre non trouvé ou non validé'
                        ], 404);
                    }
                    
                    return response()->json([
                        'success' => true,
                        'data' => new AppelOffreResource($item)
                    ]);

                default:
                    return response()->json([
                        'success' => false,
                        'error' => 'Type non supporté'
                    ], 400);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Erreur lors du chargement des détails',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}