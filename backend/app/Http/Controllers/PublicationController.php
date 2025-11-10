<?php

namespace App\Http\Controllers;

use App\Models\Publication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PublicationController extends Controller
{
    // 📋 Récupérer toutes les publications (pour l'admin)
    public function index()
    {
        try {
            $publications = Publication::orderBy('created_at', 'desc')
                ->get()
                ->map(function ($publication) {
                    return $this->formatPublicationResponse($publication);
                });
            
            return response()->json($publications);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement des publications'
            ], 500);
        }
    }

    // 📋 Récupérer uniquement les publications validées (pour les visiteurs)
    public function getPublicationsValidees()
    {
        try {
            $publications = Publication::where('statut', 'Validé')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($publication) {
                    return $this->formatPublicationResponse($publication);
                });
            
            return response()->json([
                'success' => true,
                'data' => $publications
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des publications validées',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // 👤 Afficher une publication
    public function show($id)
    {
        $publication = Publication::findOrFail($id);
        return response()->json($this->formatPublicationResponse($publication));
    }

    // ➕ Ajouter une publication
    public function store(Request $request)
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:500',
            'contenu' => 'nullable|string',
            'type' => 'required|in:Article,Annonce,Offre,Evenement',
            'date_publication' => 'nullable|date',
            'source' => 'nullable|string|max:255',
            'categorie' => 'nullable|string|max:255',
            'statut' => 'nullable|in:Brouillon,En attente,Validé,Rejeté',
            'id_utilisateur' => 'nullable|exists:users,id',
            'fichier' => 'nullable|file|max:10240', // 10MB max
            'type_fichier' => 'nullable|in:image,video,document',
        ]);

        // Attribution automatique selon le rôle
        if (Auth::check() && Auth::user()->role === 'admin') {
            $validated['id_utilisateur'] = null;
            $validated['auteur'] = 'Admin';
            $validated['statut'] = 'Validé'; // Les publications admin sont toujours validées
        } elseif (Auth::check()) {
            $validated['id_utilisateur'] = Auth::id();
            $validated['auteur'] = Auth::user()->name ?? 'Utilisateur';
            $validated['statut'] = $validated['statut'] ?? 'En attente';
        } else {
            $validated['auteur'] = 'Anonyme';
            $validated['statut'] = $validated['statut'] ?? 'En attente';
        }

        // 🔹 Gestion du fichier
        if ($request->hasFile('fichier')) {
            $file = $request->file('fichier');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('publications', $fileName, 'public');

            $validated['fichier'] = $path;
            $validated['nom_fichier_original'] = $file->getClientOriginalName();

            // Déterminer automatiquement le type de fichier si non fourni
            if (empty($validated['type_fichier'])) {
                $publication = new Publication();
                $validated['type_fichier'] = $publication->getTypeFichierFromName($file->getClientOriginalName());
            }
        }

        $publication = Publication::create($validated);

        return response()->json([
            'message' => 'Publication ajoutée avec succès',
            'data' => $this->formatPublicationResponse($publication)
        ], 201);
    }

    // ✏️ Modifier une publication
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
            'statut' => 'nullable|in:Brouillon,En attente,Validé,Rejeté',
            'id_utilisateur' => 'nullable|exists:users,id',
            'fichier' => 'nullable|file|max:10240', // 10MB max
            'type_fichier' => 'nullable|in:image,video,document',
        ]);

        // Gestion du fichier si modifié
        if ($request->hasFile('fichier')) {
            // Supprimer l'ancien fichier s'il existe
            if ($publication->fichier && Storage::disk('public')->exists($publication->fichier)) {
                Storage::disk('public')->delete($publication->fichier);
            }

            $file = $request->file('fichier');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('publications', $fileName, 'public');

            $validated['fichier'] = $path;
            $validated['nom_fichier_original'] = $file->getClientOriginalName();

            // Déterminer automatiquement le type de fichier si non fourni
            if (empty($validated['type_fichier'])) {
                $validated['type_fichier'] = $publication->getTypeFichierFromName($file->getClientOriginalName());
            }
        } else {
            // Garder les valeurs existantes si pas de nouveau fichier
            unset($validated['fichier']);
            unset($validated['type_fichier']);
            unset($validated['nom_fichier_original']);
        }

        // Forcer le statut "Validé" pour les admin
        if (Auth::check() && Auth::user()->role === 'admin') {
            $validated['statut'] = 'Validé';
        }

        $publication->update($validated);

        return response()->json([
            'message' => 'Publication modifiée avec succès',
            'data' => $this->formatPublicationResponse($publication)
        ]);
    }

    // 🗑️ Supprimer une publication
    public function destroy($id)
    {
        $publication = Publication::findOrFail($id);

        // Supprimer le fichier associé s'il existe
        if ($publication->fichier && Storage::disk('public')->exists($publication->fichier)) {
            Storage::disk('public')->delete($publication->fichier);
        }

        $publication->delete();

        return response()->json(['message' => 'Publication supprimée']);
    }

    // ✅ Valider une publication
    public function validatePublication($id)
    {
        $publication = Publication::findOrFail($id);
        $publication->statut = 'Validé';
        $publication->save();

        return response()->json([
            'message' => 'Publication validée',
            'data' => $this->formatPublicationResponse($publication)
        ]);
    }

    // 📥 Télécharger le fichier d'une publication
    public function downloadFile($id)
    {
        $publication = Publication::findOrFail($id);

        if (!$publication->fichier) {
            return response()->json(['message' => 'Aucun fichier associé à cette publication'], 404);
        }

        if (!Storage::disk('public')->exists($publication->fichier)) {
            return response()->json(['message' => 'Fichier non trouvé'], 404);
        }

        $filePath = storage_path('app/public/' . $publication->fichier);
        $fileName = $publication->nom_fichier_original ?: basename($publication->fichier);

        return response()->download($filePath, $fileName);
    }

    // 🎯 Formater la réponse de la publication
    private function formatPublicationResponse(Publication $publication)
{
    return [
        'id_publication' => $publication->id_publication,
        'titre' => $publication->titre,
        'contenu' => $publication->contenu,
        'type' => $publication->type,
        'date_publication' => $publication->date_publication,
        'source' => $publication->source,
        'categorie' => $publication->categorie,
        'statut' => $publication->statut,
        'fichier' => $publication->fichier,
        'fichier_url' => $publication->fichier ? asset('storage/' . $publication->fichier) : null,
        'type_fichier' => $publication->type_fichier,
        'nom_fichier_original' => $publication->nom_fichier_original,
        'auteur' => $publication->auteur,
        'id_utilisateur' => $publication->id_utilisateur,
        'has_file' => !empty($publication->fichier),
        'file_icon' => $this->getFileIcon($publication->nom_fichier_original),
        'created_at' => $publication->created_at,
        'updated_at' => $publication->updated_at,
    ];
}

// 🎯 Obtenir l'icône du fichier
private function getFileIcon($fileName)
{
    if (!$fileName) return 'file';
    
    $ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    $icons = [
        'pdf' => 'file-pdf',
        'doc' => 'file-word',
        'docx' => 'file-word',
        'xls' => 'file-excel',
        'xlsx' => 'file-excel',
        'jpg' => 'file-image',
        'jpeg' => 'file-image',
        'png' => 'file-image',
        'zip' => 'file-archive',
        'rar' => 'file-archive',
    ];
    
    return $icons[$ext] ?? 'file';
}
}
