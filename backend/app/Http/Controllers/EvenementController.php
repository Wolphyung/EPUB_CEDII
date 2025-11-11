<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\EvenementResource;
use App\Models\Evenement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class EvenementController extends Controller
{
    // 🔹 Liste avec recherche et filtres
    public function index(Request $request)
    {
        try {
            $query = Evenement::query();

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

            if ($request->hasFile('fichier')) {
                $validated['fichier'] = $request->file('fichier')->store('evenements', 'public');
            }

            $evenement = Evenement::create($validated);
            return new EvenementResource($evenement);
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
        return new EvenementResource($evenement);
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
            return new EvenementResource($evenement);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la mise à jour',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // 🔹 NOUVELLE MÉTHODE : Mise à jour du statut uniquement
    public function updateStatus(Request $request, $id)
    {
        try {
            $evenement = Evenement::findOrFail($id);
            
            $validated = $request->validate([
                'statut' => ['required', Rule::in(['En attente', 'Validé', 'Rejeté'])]
            ]);

            $evenement->update(['statut' => $validated['statut']]);
            
            return new EvenementResource($evenement);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la mise à jour du statut',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // 🔹 NOUVELLE MÉTHODE : Mise à jour complète avec POST
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
            return new EvenementResource($evenement);
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

    // 🔹 Événements validés pour visiteurs
    public function getEvenementsValides()
    {
        try {
            $evenements = Evenement::where('statut', 'Validé')
                ->latest()
                ->get();
            
            return EvenementResource::collection($evenements);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}