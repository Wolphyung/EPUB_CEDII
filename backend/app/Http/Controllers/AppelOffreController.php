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
        // NOTE: Pour inclure les nouveaux champs dans la réponse,
        // même s'ils ne sont pas stockés en BDD, on devrait les 
        // ajouter ici manuellement ou modifier la BDD.
        // Puisque la BDD n'est pas modifiée, ces champs seront absents de la réponse du serveur.
        return response()->json($offres);
    }

    // 🔹 Ajouter un nouvel appel d'offre
    public function store(Request $request)
    {
        // 🎯 Mise à jour de la validation pour inclure les nouveaux champs
        $validated = $request->validate([
            'intitule' => 'required|string|max:255',
            'description' => 'required|string',
            'date_ouverture' => 'nullable|date',
            'date_cloture' => 'nullable|date',
            'membre' => 'nullable|string|max:255',
            'fichier' => 'nullable|file|max:10240', // 10 Mo max
            'statut' => 'nullable|string',
            
            // ✅ Nouveaux champs pour l'UI (acceptés par le contrôleur)
            'type' => 'nullable|string|max:100',
            'localisation' => 'nullable|string|max:255',
            'salaire' => 'nullable|string|max:255',
            'urgent' => 'nullable|boolean', // Géré comme un boolean pour la case à cocher
        ]);

        // Définir le statut par défaut à 'en attente' si non fourni
        $validated['statut'] = $request->input('statut', 'en attente');
        
        // Gérer le cas où le champ 'urgent' est manquant dans la requête (car c'est une checkbox)
        if (!isset($validated['urgent'])) {
            $validated['urgent'] = false;
        }

        // ⚠️ NOTE IMPORTANTE : Les champs 'type', 'localisation', 'salaire', 'urgent'
        // seront inclus dans $validated mais seront ignorés par AppelOffre::create()
        // car ils ne sont pas 'fillable' et n'existent pas dans la table BDD.
        
        // Séparer les champs pour la création, pour éviter des erreurs silencieuses
        $fillableData = $request->only([
            'intitule', 'description', 'date_ouverture', 'date_cloture', 'membre', 'statut'
        ]);
        
        // S'assurer que le statut 'en attente' est là
        $fillableData['statut'] = $validated['statut'];
        
        // Gestion du fichier uploadé
        if ($request->hasFile('fichier')) {
            $path = $request->file('fichier')->store('uploads/appel_offres', 'public');
            $fillableData['fichier'] = asset('storage/' . $path);
        }

        // Création de l'offre avec uniquement les champs existants en BDD
        $offre = AppelOffre::create($fillableData);

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

        // 🎯 Mise à jour de la validation pour inclure les nouveaux champs
        $validated = $request->validate([
            'intitule' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'date_ouverture' => 'nullable|date',
            'date_cloture' => 'nullable|date',
            'membre' => 'nullable|string|max:255',
            'fichier' => 'nullable|file|max:10240',
            'statut' => 'nullable|string',
            
            // ✅ Nouveaux champs (acceptés par le contrôleur)
            'type' => 'nullable|string|max:100',
            'localisation' => 'nullable|string|max:255',
            'salaire' => 'nullable|string|max:255',
            'urgent' => 'nullable|boolean',
        ]);
        
        // Gérer le cas où le champ 'urgent' est manquant dans la requête PUT (pour une checkbox)
        if ($request->has('urgent') && $request->input('urgent') === null) {
            $validated['urgent'] = false;
        }


        // ⚠️ Les champs 'type', 'localisation', 'salaire', 'urgent' dans $validated
        // seront ignorés par $offre->update() car ils n'existent pas dans la BDD.
        // Si tu souhaites stocker ces données, la modification de la BDD est requise.
        
        // Gestion du fichier uploadé
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


      public function getAppelsOffreValides()
{
    $offresValides = AppelOffre::where('statut', 'validé')
                    ->orderBy('created_at', 'desc')
                    ->get();

    // renvoyer le tableau directement
    return response()->json($offresValides);
}

}