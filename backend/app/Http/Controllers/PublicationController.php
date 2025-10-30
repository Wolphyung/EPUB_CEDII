<?php

namespace App\Http\Controllers;

use App\Models\Publication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PublicationController extends Controller
{
    // Lister toutes les publications
    public function index()
    {
        $publications = Publication::all();
        return response()->json($publications);
    }

    // Afficher une publication
    public function show($id)
    {
        $publication = Publication::findOrFail($id);
        return response()->json($publication);
    }

    // Ajouter une publication
    public function store(Request $request)
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:500',
            'contenu' => 'nullable|string',
            'type' => 'required|in:Article,Annonce,Offre,Evenement',
            'date_publication' => 'nullable|date',
            'source' => 'nullable|string|max:255',
            'categorie' => 'nullable|string|max:255',
            'statut' => 'nullable|in:Brouillon,En attente,Validé',
            'id_utilisateur' => 'nullable|exists:utilisateurs,id_utilisateur',
            'image' => 'nullable|image|max:2048',
        ]);

        // Si ajout par admin
        if (Auth::check() && Auth::user()->role === 'admin') {
            $validated['id_utilisateur'] = null;
            $validated['auteur'] = 'Admin';
        } elseif (Auth::check()) {
            $validated['id_utilisateur'] = Auth::id();
            $validated['auteur'] = Auth::user()->name ?? 'Utilisateur';
        }

        // Gestion de l'image
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('publications', 'public');
            $validated['image'] = $path;
        }

        $publication = Publication::create($validated);

        return response()->json([
            'message' => 'Publication ajoutée avec succès',
            'data' => $publication
        ], 201);
    }

    // Modifier une publication
    public function update(Request $request, $id)
    {
        $publication = Publication::findOrFail($id);

        $validated = $request->validate([
            'titre' => 'required|string|max:500',
            'contenu' => 'nullable|string',
            'type' => 'required|in:Article,Annonce,Offre,Evenement',
            'date_publication' => 'nullable|date',
            'source' => 'nullable|string|max:255',
            'categorie' => 'nullable|string|max:255',
            'statut' => 'nullable|in:Brouillon,En attente,Validé',
            'id_utilisateur' => 'nullable|exists:utilisateurs,id_utilisateur',
            'image' => 'nullable|image|max:2048',
        ]);

        // Gestion image si modifiée
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('publications', 'public');
            $validated['image'] = $path;
        }

        $publication->update($validated);

        return response()->json([
            'message' => 'Publication modifiée avec succès',
            'data' => $publication
        ]);
    }

    // Supprimer une publication
    public function destroy($id)
    {
        $publication = Publication::findOrFail($id);
        $publication->delete();

        return response()->json(['message' => 'Publication supprimée']);
    }

    // Valider une publication
    public function validatePublication($id)
    {
        $publication = Publication::findOrFail($id);
        $publication->statut = 'Validé';
        $publication->save();

        return response()->json([
            'message' => 'Publication validée',
            'data' => $publication
        ]);
    }
}
