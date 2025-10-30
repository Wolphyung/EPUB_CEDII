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
    // 🔹 Liste des événements AVEC RECHERCHE ET FILTRES
    public function index(Request $request) 
    {
        try {
            // Démarrer la construction de la requête
            $query = Evenement::query();
            
            // --- 1. LOGIQUE DE RECHERCHE PAR TEXTE ---
            $searchTerm = $request->query('search');
            if ($searchTerm) {
                // Recherche dans le titre, la description ET le lieu
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('titre', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('description', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('lieu', 'LIKE', "%{$searchTerm}%"); 
                });
            }

            // --- 2. LOGIQUE DE FILTRE PAR STATUT ---
            $statut = $request->query('statut');
            if ($statut) {
                // Filtre par statut exact (ex: "Validé" ou "En attente")
                $query->where('statut', $statut);
            }

            // --- 3. LOGIQUE DE FILTRE PAR TYPE ---
            $type = $request->query('type');
            if ($type) {
                // Filtre par type exact (ex: "Présentiel", "En ligne", "Hybride")
                $query->where('type', $type);
            }
            
            // Exécuter la requête finale
            $evenements = $query->get();
            
            return response()->json($evenements, 200);

        } catch (\Exception $e) {
            // Retourne l'erreur exacte du serveur (utile pour le débogage)
            return response()->json(['error' => $e->getMessage()], 500); 
        }
    }

    // 🔹 Création
    public function store(Request $request)
    {
        // Validation qui correspond aux champs dans le Modèle et la DB
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
    }

    // 🔹 Afficher un événement
    public function show(Evenement $evenement)
    {
        return new EvenementResource($evenement);
    }

    // 🔹 Mise à jour
    public function update(Request $request, Evenement $evenement)
    {
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
            // Supprimer l'ancien fichier
            if ($evenement->fichier && Storage::disk('public')->exists($evenement->fichier)) {
                Storage::disk('public')->delete($evenement->fichier);
            }
            $validated['fichier'] = $request->file('fichier')->store('evenements', 'public');
        }

        $evenement->update($validated);

        return new EvenementResource($evenement);
    }

    // 🔹 Suppression
    public function destroy(Evenement $evenement)
    {
        if ($evenement->fichier && Storage::disk('public')->exists($evenement->fichier)) {
            Storage::disk('public')->delete($evenement->fichier);
        }
        $evenement->delete();

        return response()->json(['message' => 'Événement supprimé avec succès']);
    }
}