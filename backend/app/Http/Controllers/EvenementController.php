<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\EvenementResource;
use App\Models\Evenement;
use App\Models\EvenementReaction;
use App\Models\EvenementVue;
use App\Models\Membre;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class EvenementController extends Controller
{
    // 🔹 Liste avec recherche et filtres
    public function index(Request $request)
    {
        try {
            $query = Evenement::with('membre');

            if ($request->has('search')) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('titre', 'LIKE', "%{$search}%")
                      ->orWhere('description', 'LIKE', "%{$search}%")
                      ->orWhere('lieu', 'LIKE', "%{$search}%");
                });
            }

            if ($request->has('statut') && $request->statut != 'Tous') {
                $query->where('statut', $request->statut);
            }

            if ($request->has('type') && $request->type != 'Tous') {
                $query->where('type', $request->type);
            }

            $evenements = $query->latest()->get();
            
            return EvenementResource::collection($evenements);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // 🔹 Création
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'titre' => 'required|string|max:255',
                'description' => 'required|string',
                'date_heure' => 'required|date',
                'lieu' => 'required|string|max:255',
                'type' => ['required', Rule::in(['Présentiel', 'En ligne', 'Hybride'])],
                'statut' => ['required', Rule::in(['En attente', 'Validé', 'Rejeté'])],
                'fichier' => 'nullable|file|mimes:pdf,doc,docx,jpg,png,jpeg|max:5120',
            ]);

            // ✅ Utiliser un membre_id fixe (remplacez 1 par l'ID du membre admin)
            $validated['membre_id'] = 1;

            if ($request->hasFile('fichier')) {
                $validated['fichier'] = $request->file('fichier')->store('evenements', 'public');
            }

            $evenement = Evenement::create($validated);
            return new EvenementResource($evenement->load('membre'));
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la création',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // 🔹 Afficher un événement
    public function show(Evenement $evenement)
    {
        return new EvenementResource($evenement->load('membre'));
    }

    // 🔹 Mise à jour standard (PUT/PATCH)
    public function update(Request $request, Evenement $evenement)
    {
        try {
            $validated = $request->validate([
                'titre' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'date_heure' => 'sometimes|required|date',
                'lieu' => 'sometimes|required|string|max:255',
                'type' => ['sometimes', 'required', Rule::in(['Présentiel', 'En ligne', 'Hybride'])],
                'statut' => ['sometimes', 'required', Rule::in(['En attente', 'Validé', 'Rejeté'])],
                'fichier' => 'nullable|file|mimes:pdf,doc,docx,jpg,png,jpeg|max:5120',
            ]);

            if ($request->hasFile('fichier')) {
                if ($evenement->fichier && Storage::disk('public')->exists($evenement->fichier)) {
                    Storage::disk('public')->delete($evenement->fichier);
                }
                $validated['fichier'] = $request->file('fichier')->store('evenements', 'public');
            }

            $evenement->update($validated);
            return new EvenementResource($evenement->load('membre'));
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la mise à jour',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // 🔹 Mise à jour du statut uniquement
    public function updateStatus(Request $request, $id)
    {
        try {
            $evenement = Evenement::findOrFail($id);
            
            $validated = $request->validate([
                'statut' => ['required', Rule::in(['En attente', 'Validé', 'Rejeté'])]
            ]);

            $evenement->update(['statut' => $validated['statut']]);
            
            return new EvenementResource($evenement->load('membre'));
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la mise à jour du statut',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // 🔹 Mise à jour complète avec POST
    public function updateEvent(Request $request, $id)
    {
        try {
            $evenement = Evenement::findOrFail($id);
            
            $validated = $request->validate([
                'titre' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'date_heure' => 'sometimes|required|date',
                'lieu' => 'sometimes|required|string|max:255',
                'type' => ['sometimes', 'required', Rule::in(['Présentiel', 'En ligne', 'Hybride'])],
                'statut' => ['sometimes', 'required', Rule::in(['En attente', 'Validé', 'Rejeté'])],
                'fichier' => 'nullable|file|mimes:pdf,doc,docx,jpg,png,jpeg|max:5120',
            ]);

            if ($request->hasFile('fichier')) {
                if ($evenement->fichier && Storage::disk('public')->exists($evenement->fichier)) {
                    Storage::disk('public')->delete($evenement->fichier);
                }
                $validated['fichier'] = $request->file('fichier')->store('evenements', 'public');
            }

            $evenement->update($validated);
            return new EvenementResource($evenement->load('membre'));
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la mise à jour de l\'événement',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // 🔹 Suppression
    public function destroy(Evenement $evenement)
    {
        try {
            if ($evenement->fichier && Storage::disk('public')->exists($evenement->fichier)) {
                Storage::disk('public')->delete($evenement->fichier);
            }

            $evenement->delete();
            return response()->json(['message' => 'Événement supprimé avec succès']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la suppression',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // 🔹 Ajouter une réaction d'un visiteur
     public function react(Request $request, $id)
    {
        try {
            $evenement = Evenement::where('statut', 'Validé')->findOrFail($id);
            
            $validated = $request->validate([
                'visitor_id' => 'required|string',
                'type' => ['required', Rule::in(['like', 'love', 'wow', 'sad', 'angry'])]
            ]);

            // Vérifier si le visiteur a déjà réagi
            $existingReaction = EvenementReaction::where('evenement_id', $id)
                ->where('visitor_id', $validated['visitor_id'])
                ->first();

            if ($existingReaction) {
                // Mettre à jour la réaction existante
                $existingReaction->update(['type' => $validated['type']]);
                $message = 'Réaction mise à jour';
            } else {
                // Créer une nouvelle réaction
                EvenementReaction::create([
                    'evenement_id' => $id,
                    'visitor_id' => $validated['visitor_id'],
                    'type' => $validated['type']
                ]);
                $message = 'Réaction ajoutée';
            }

            // Récupérer les statistiques mises à jour
            $stats = $this->getEventStats($evenement, $validated['visitor_id']);

            return response()->json([
                'success' => true,
                'message' => $message,
                'stats' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Erreur lors de l\'ajout de la réaction',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // 🔹 Ajouter une réaction d'un visiteur
    public function view(Request $request, $id)
    {
        try {
            $evenement = Evenement::where('statut', 'Validé')->findOrFail($id);
            
            $validated = $request->validate([
                'visitor_id' => 'required|string'
            ]);

            // Vérifier si le visiteur a déjà vu cet événement
            $existingView = EvenementVue::where('evenement_id', $id)
                ->where('visitor_id', $validated['visitor_id'])
                ->first();

            if (!$existingView) {
                // Enregistrer la vue seulement si c'est la première fois
                EvenementVue::create([
                    'evenement_id' => $id,
                    'visitor_id' => $validated['visitor_id']
                ]);
            }

            // Récupérer les statistiques mises à jour
            $stats = $this->getEventStats($evenement, $validated['visitor_id']);

            return response()->json([
                'success' => true,
                'message' => 'Vue enregistrée',
                'stats' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Erreur lors de l\'enregistrement de la vue',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // 🔹 Récupérer les statistiques d'un événement
    public function getStats(Request $request, $id)
    {
        try {
            $evenement = Evenement::where('statut', 'Validé')->find($id);
            
            if (!$evenement) {
                return response()->json([
                    'success' => false,
                    'error' => 'Événement non trouvé'
                ], 404);
            }
            
            $visitorId = $request->get('visitor_id', '');

            $stats = $this->getEventStats($evenement, $visitorId);

            return response()->json([
                'success' => true,
                'stats' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Erreur lors de la récupération des statistiques',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Méthode privée pour obtenir les statistiques d'un événement
    private function getEventStats(Evenement $evenement, $visitorId = null)
    {
        // Compter les réactions par type
        $reactionsByType = EvenementReaction::where('evenement_id', $evenement->id)
            ->selectRaw('type, COUNT(*) as count')
            ->groupBy('type')
            ->pluck('count', 'type')
            ->toArray();

        // Vérifier si le visiteur a réagi
        $userReaction = null;
        if ($visitorId) {
            $userReaction = EvenementReaction::where('evenement_id', $evenement->id)
                ->where('visitor_id', $visitorId)
                ->value('type');
        }

        return [
            'total_reactions' => $evenement->reactions()->count(),
            'total_views' => $evenement->vues()->count(),
            'reactions_by_type' => $reactionsByType,
            'user_reaction' => $userReaction,
            'has_viewed' => $visitorId ? $evenement->hasViewed($visitorId) : false
        ];
    }

    // 🔹 Récupérer les événements validés pour les visiteurs
    public function getEvenementsValides(Request $request)
    {
        try {
            $visitorId = $request->get('visitor_id', '');
            
            $evenements = Evenement::with('membre')
                ->where('statut', 'Validé')
                ->where('date_heure', '>=', now())
                ->orderBy('date_heure', 'asc')
                ->get();

            // Formater les données de manière cohérente
            $evenementsFormatted = $evenements->map(function($evenement) use ($visitorId) {
                $stats = $this->getEventStats($evenement, $visitorId);
                
                return [
                    'id' => $evenement->id,
                    'id_evenement' => $evenement->id, // Doublon pour compatibilité
                    'titre' => $evenement->titre,
                    'description' => $evenement->description,
                    'date_heure' => $evenement->date_heure,
                    'lieu' => $evenement->lieu,
                    'type' => $evenement->type,
                    'statut' => $evenement->statut,
                    'fichier' => $evenement->fichier,
                    'fichier_url' => $evenement->fichier_url,
                    'membre_id' => $evenement->membre_id,
                    'auteur' => $evenement->auteur,
                    'created_at' => $evenement->created_at,
                    'updated_at' => $evenement->updated_at,
                    'stats' => $stats
                ];
            });
            
            return response()->json([
                'success' => true,
                'data' => $evenementsFormatted,
                'count' => $evenements->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}