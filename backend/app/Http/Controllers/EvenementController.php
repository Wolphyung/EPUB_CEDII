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

            return response()->json($query->latest()->get(), 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // 🔹 Création
    public function store(Request $request)
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

    // 🔹 Mise à jour (ajustée pour accepter MAJ partielle)
    public function update(Request $request, Evenement $evenement)
    {
        // ⚙️ Validation assouplie pour la mise à jour partielle
        $validated = $request->validate([
            'titre' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'date_heure' => 'sometimes|required|date',
            'lieu' => 'sometimes|required|string|max:255',
            'type' => ['sometimes', 'required', Rule::in(['Présentiel', 'En ligne', 'Hybride'])],
            'statut' => ['sometimes', 'required', Rule::in(['En attente', 'Validé', 'Rejeté'])],
            'fichier' => 'nullable|file|mimes:pdf,doc,docx,jpg,png,jpeg|max:5120',
        ]);

        // 📎 Gestion du fichier s’il existe
        if ($request->hasFile('fichier')) {
            if ($evenement->fichier && Storage::disk('public')->exists($evenement->fichier)) {
                Storage::disk('public')->delete($evenement->fichier);
            }
            $validated['fichier'] = $request->file('fichier')->store('evenements', 'public');
        }

        // 🔁 Mise à jour des champs présents uniquement
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
