<?php

namespace App\Http\Controllers;

use App\Models\AppelOffre;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AppelOffreController extends Controller
{
    // 🔹 Lister tous les appels d'offre
    public function index()
    {
        $offres = AppelOffre::orderBy('created_at', 'desc')->get();
        return response()->json($offres);
    }

    // 🔹 Ajouter un nouvel appel d'offre
    public function store(Request $request)
    {
        $validated = $request->validate([
            'intitule' => 'required|string|max:255',
            'description' => 'required|string',
            'date_ouverture' => 'nullable|date',
            'date_cloture' => 'nullable|date',
            'membre' => 'nullable|string|max:255',
            'fichier' => 'nullable|file|max:10240', // 10 Mo max
            'statut' => 'nullable|string',
        ]);

        // Gestion du fichier uploadé
        if ($request->hasFile('fichier')) {
            $path = $request->file('fichier')->store('uploads/appel_offres', 'public');
            $validated['fichier'] = asset('storage/' . $path);
        }

        $offre = AppelOffre::create($validated);

        return response()->json([
            'message' => "Appel d'offre ajouté avec succès",
            'data' => $offre
        ], 201);
    }

    // 🔹 Voir un seul appel d'offre
    public function show($id)
    {
        $offre = AppelOffre::findOrFail($id);
        return response()->json($offre);
    }

    // 🔹 Modifier un appel d'offre (validation / rejet / édition)
    public function update(Request $request, $id)
    {
        $offre = AppelOffre::findOrFail($id);

        $validated = $request->validate([
            'intitule' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'date_ouverture' => 'nullable|date',
            'date_cloture' => 'nullable|date',
            'membre' => 'nullable|string|max:255',
            'fichier' => 'nullable|file|max:10240',
            'statut' => 'nullable|string',
        ]);

        if ($request->hasFile('fichier')) {
            if ($offre->fichier) {
                $oldPath = str_replace(asset('storage/'), '', $offre->fichier);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('fichier')->store('uploads/appel_offres', 'public');
            $validated['fichier'] = asset('storage/' . $path);
        }

        $offre->update($validated);

        return response()->json([
            'message' => "Appel d'offre mis à jour",
            'data' => $offre
        ]);
    }

    // 🔹 Supprimer un appel d'offre
    public function destroy($id)
    {
        $offre = AppelOffre::findOrFail($id);

        if ($offre->fichier) {
            $oldPath = str_replace(asset('storage/'), '', $offre->fichier);
            Storage::disk('public')->delete($oldPath);
        }

        $offre->delete();

        return response()->json(['message' => "Appel d'offre supprimé"]);
    }
}
