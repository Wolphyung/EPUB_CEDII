<?php

namespace App\Http\Controllers;

use App\Models\Publication;
use App\Models\PublicationReaction;
use App\Models\PublicationView;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class PublicationController extends Controller
{
    // 📋 Récupérer toutes les publications (pour l'admin)
    public function index()
    {
        try {
            $publications = Publication::orderBy('created_at', 'desc')->get();
            
            return response()->json([
                'success' => true,
                'data' => $publications->map(function($pub) {
                    return $this->formatPublicationResponse($pub);
                })
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des publications'
            ], 500);
        }
    }

    // 📄 Récupérer les publications validées (publiques) - AMÉLIORÉ
    public function getPublicationsValidees(Request $request)
    {
        try {
            Log::info('=== GET PUBLICATIONS VALIDEES ===', [
                'visitor_id' => $request->header('X-Visitor-ID'),
                'ip' => $request->ip()
            ]);

            $publications = Publication::where('statut', 'Validé')
                ->orderBy('created_at', 'desc')
                ->get();

            $visitorId = $request->header('X-Visitor-ID');
            
            if (!$visitorId) {
                Log::warning('No visitor ID provided');
                return response()->json([
                    'success' => false,
                    'message' => 'Identifiant visiteur requis'
                ], 400);
            }

            $formattedPublications = [];
            foreach ($publications as $publication) {
                $formattedPublication = $this->formatPublicationResponse($publication);
                
                // Ajouter userReacted pour CE visiteur
                $formattedPublication['userReacted'] = PublicationReaction::where('publication_id', $publication->id_publication)
                    ->where('visitor_id', $visitorId)
                    ->exists();

                // 🔧 CORRECTION : already_viewed est spécifique à CE visiteur
                $formattedPublication['already_viewed'] = PublicationView::where('publication_id', $publication->id_publication)
                    ->where('visitor_id', $visitorId)
                    ->exists();

                $formattedPublications[] = $formattedPublication;
            }

            Log::info('Publications loaded successfully', [
                'count' => count($formattedPublications),
                'visitor_id' => $visitorId
            ]);

            return response()->json([
                'success' => true,
                'data' => $formattedPublications,
                'count' => count($formattedPublications)
            ]);

        } catch (\Exception $e) {
            Log::error('Error in getPublicationsValidees:', [
                'error' => $e->getMessage(),
                'visitor_id' => $request->header('X-Visitor-ID')
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur: ' . $e->getMessage()
            ], 500);
        }
    }

    // 👤 Afficher une publication - AMÉLIORÉ
    public function show(Request $request, $id)
    {
        try {
            $publication = Publication::where('id_publication', $id)->first();
            
            if (!$publication) {
                return response()->json([
                    'success' => false,
                    'message' => 'Publication non trouvée'
                ], 404);
            }

            $formattedPublication = $this->formatPublicationResponse($publication);
            
            // Ajouter les infos spécifiques au visiteur
            $visitorId = $request->header('X-Visitor-ID');
            if ($visitorId) {
                $formattedPublication['userReacted'] = PublicationReaction::where('publication_id', $publication->id_publication)
                    ->where('visitor_id', $visitorId)
                    ->exists();
                    
                $formattedPublication['already_viewed'] = PublicationView::where('publication_id', $publication->id_publication)
                    ->where('visitor_id', $visitorId)
                    ->exists();
            } else {
                $formattedPublication['userReacted'] = false;
                $formattedPublication['already_viewed'] = false;
            }

            return response()->json([
                'success' => true,
                'data' => $formattedPublication
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement de la publication'
            ], 500);
        }
    }

    // ➕ Ajouter une publication
    public function store(Request $request)
    {
        try {
            // Validation des données
            $validated = $request->validate([
                'titre' => 'required|string|max:500',
                'contenu' => 'required|string',
                'type' => 'required|in:Article,Annonce,Offre,Evenement',
                'date_publication' => 'nullable|date',
                'source' => 'nullable|string|max:255',
                'categorie' => 'nullable|string|max:255',
                'statut' => 'nullable|in:Brouillon,En attente,Validé,Rejeté',
                'fichier' => 'nullable|file|max:10240', // 10MB max
                'type_fichier' => 'nullable|in:image,video,document',
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        }

        // Récupérer l'utilisateur connecté
        $user = Auth::user();

        // Attribution automatique selon le rôle
        if ($user) {
            if ($user->type === 'admin') {
                $validated['auteur'] = 'Admin';
                $validated['statut'] = 'Validé';
                $validated['membre_id'] = null;
            } elseif ($user->type === 'membre') {
                $validated['membre_id'] = $user->id;
                $validated['auteur'] = $user->nom_complet ?? $user->nom ?? $user->prenom ?? $user->email ?? 'Membre';
                $validated['statut'] = $validated['statut'] ?? 'En attente';
            }
        } else {
            $validated['auteur'] = 'Anonyme';
            $validated['statut'] = $validated['statut'] ?? 'En attente';
            $validated['membre_id'] = null;
        }

        // 🔹 Gestion du fichier
        if ($request->hasFile('fichier')) {
            $file = $request->file('fichier');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('publications', $fileName, 'public');

            $validated['fichier'] = $path;
            $validated['nom_fichier_original'] = $file->getClientOriginalName();

            // Déterminer le type de fichier si non fourni
            if (empty($validated['type_fichier'])) {
                $publication = new Publication();
                $validated['type_fichier'] = $publication->getTypeFichierFromName($file->getClientOriginalName());
            }
        }

        try {
            $publication = Publication::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Publication ajoutée avec succès',
                'data' => $this->formatPublicationResponse($publication)
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de la publication',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ✏️ Modifier une publication
    public function update(Request $request, $id)
    {
        try {
            $publication = Publication::where('id_publication', $id)->first();
            
            if (!$publication) {
                return response()->json([
                    'success' => false,
                    'message' => 'Publication non trouvée'
                ], 404);
            }

            $validated = $request->validate([
                'titre' => 'required|string|max:500',
                'contenu' => 'required|string',
                'type' => 'required|in:Article,Annonce,Offre,Evenement',
                'date_publication' => 'nullable|date',
                'source' => 'nullable|string|max:255',
                'categorie' => 'nullable|string|max:255',
                'statut' => 'nullable|in:Brouillon,En attente,Validé,Rejeté',
                'fichier' => 'nullable|file|max:10240',
                'type_fichier' => 'nullable|in:image,video,document',
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        }

        // Gestion du fichier si modifié
        if ($request->hasFile('fichier')) {
            if ($publication->fichier && Storage::disk('public')->exists($publication->fichier)) {
                Storage::disk('public')->delete($publication->fichier);
            }

            $file = $request->file('fichier');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('publications', $fileName, 'public');

            $validated['fichier'] = $path;
            $validated['nom_fichier_original'] = $file->getClientOriginalName();

            if (empty($validated['type_fichier'])) {
                $validated['type_fichier'] = $publication->getTypeFichierFromName($file->getClientOriginalName());
            }
        } else {
            unset($validated['fichier']);
            unset($validated['type_fichier']);
            unset($validated['nom_fichier_original']);
        }

        if (Auth::check() && Auth::user()->type === 'admin') {
            $validated['statut'] = 'Validé';
        }

        $publication->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Publication modifiée avec succès',
            'data' => $this->formatPublicationResponse($publication)
        ]);
    }

    // 🗑️ Supprimer une publication
    public function destroy($id)
    {
        try {
            $publication = Publication::where('id_publication', $id)->first();
            
            if (!$publication) {
                return response()->json([
                    'success' => false,
                    'message' => 'Publication non trouvée'
                ], 404);
            }

            if ($publication->fichier && Storage::disk('public')->exists($publication->fichier)) {
                Storage::disk('public')->delete($publication->fichier);
            }

            $publication->delete();

            return response()->json([
                'success' => true,
                'message' => 'Publication supprimée avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de la publication'
            ], 500);
        }
    }

    // ✅ Valider une publication
    public function validatePublication($id)
    {
        try {
            $publication = Publication::where('id_publication', $id)->first();
            
            if (!$publication) {
                return response()->json([
                    'success' => false,
                    'message' => 'Publication non trouvée'
                ], 404);
            }

            $publication->statut = 'Validé';
            $publication->save();

            return response()->json([
                'success' => true,
                'message' => 'Publication validée',
                'data' => $this->formatPublicationResponse($publication)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la validation de la publication'
            ], 500);
        }
        $publication = Publication::findOrFail($id);
        $publication->update(['status' => 'validated']);
        
        // Notification pour l'auteur
        NotificationController::createNotification([
            'type' => 'new_publication',
            'message' => 'Votre publication "' . $publication->title . '" a été validée',
            'organisation_name' => 'Publications',
            'user_id' => $publication->user_id,
            'item_id' => $publication->id,
            'item_type' => 'publication'
        ]);
    }

    // 📥 Télécharger le fichier d'une publication
    public function downloadFile($id)
    {
        try {
            $publication = Publication::where('id_publication', $id)->first();
            
            if (!$publication) {
                return response()->json([
                    'success' => false,
                    'message' => 'Publication non trouvée'
                ], 404);
            }

            if (!$publication->fichier) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucun fichier associé à cette publication'
                ], 404);
            }

            if (!Storage::disk('public')->exists($publication->fichier)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Fichier non trouvé'
                ], 404);
            }

            $filePath = storage_path('app/public/' . $publication->fichier);
            $fileName = $publication->nom_fichier_original ?: basename($publication->fichier);

            return response()->download($filePath, $fileName);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du téléchargement du fichier'
            ], 500);
        }
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
            'categorie' => $publication->categorie ?? 'Général',
            'statut' => $publication->statut,
            'fichier' => $publication->fichier,
            'fichier_url' => $publication->fichier ? asset('storage/' . $publication->fichier) : null,
            'type_fichier' => $publication->type_fichier,
            'nom_fichier_original' => $publication->nom_fichier_original,
            'auteur' => $publication->auteur,
            'membre_id' => $publication->membre_id,
            'total_reactions' => $publication->total_reactions ?? 0,
            'vues' => $publication->vues ?? 0,
            'has_file' => !empty($publication->fichier),
            'created_at' => $publication->created_at?->toISOString(),
            'updated_at' => $publication->updated_at?->toISOString(),
        ];
    }

    // ❤️ Réaction utilisateur/visiteur - DÉJÀ CORRECT
    public function react(Request $request, $id)
    {
        try {
            Log::info('React request received', [
                'publication_id' => $id,
                'visitor_id' => $request->header('X-Visitor-ID')
            ]);

            $publication = Publication::where('id_publication', $id)->first();
            
            if (!$publication) {
                return response()->json([
                    'success' => false,
                    'message' => 'Publication non trouvée'
                ], 404);
            }

            $visitorId = $request->header('X-Visitor-ID');

            if (!$visitorId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Identifiant visiteur requis'
                ], 400);
            }

            // Vérifier si le visiteur a déjà réagi
            $existingReaction = PublicationReaction::where('publication_id', $publication->id_publication)
                ->where('visitor_id', $visitorId)
                ->first();

            if ($existingReaction) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous avez déjà réagi à cette publication',
                    'total_reactions' => $publication->total_reactions
                ], 422);
            }

            // Créer la réaction
            PublicationReaction::create([
                'publication_id' => $publication->id_publication,
                'visitor_id' => $visitorId,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            // Mettre à jour le compteur
            $publication->increment('total_reactions');
            $publication->refresh();

            Log::info('Reaction added successfully', [
                'publication_id' => $publication->id_publication,
                'new_total' => $publication->total_reactions
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Réaction ajoutée avec succès',
                'total_reactions' => $publication->total_reactions,
                'userReacted' => true
            ]);

        } catch (\Exception $e) {
            Log::error('Error in react method:', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'ajout de la réaction: ' . $e->getMessage()
            ], 500);
        }
    }

    // 👀 Incrémenter les vues - CORRIGÉ POUR SUPPORT MULTI-VISITEURS
    public function view(Request $request, $id)
    {
        try {
            Log::info('=== VIEW REQUEST START ===', [
                'publication_id' => $id,
                'visitor_id' => $request->header('X-Visitor-ID'),
                'ip' => $request->ip()
            ]);

            $publication = Publication::where('id_publication', $id)->first();
            
            if (!$publication) {
                Log::error('Publication not found', ['id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Publication non trouvée'
                ], 404);
            }

            $visitorId = $request->header('X-Visitor-ID');

            if (!$visitorId) {
                Log::error('No visitor ID provided');
                return response()->json([
                    'success' => false,
                    'message' => 'Identifiant visiteur requis pour compter les vues'
                ], 400);
            }

            // 🔧 CORRECTION : Vérifier si CE visiteur a déjà vu cette publication
            $alreadyViewed = PublicationView::where('publication_id', $publication->id_publication)
                ->where('visitor_id', $visitorId)
                ->exists();

            if ($alreadyViewed) {
                Log::info('Visitor already viewed this publication', [
                    'visitor_id' => $visitorId,
                    'publication_id' => $publication->id_publication
                ]);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Vous avez déjà vu cette publication',
                    'vues' => $publication->vues,
                    'already_viewed' => true
                ]);
            }

            // Enregistrer la vue pour CE visiteur
            PublicationView::create([
                'publication_id' => $publication->id_publication,
                'visitor_id' => $visitorId,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            // Incrémenter le compteur de vues TOTAL
            $publication->increment('vues');
            $publication->refresh();

            Log::info('New view recorded for visitor', [
                'publication_id' => $publication->id_publication,
                'visitor_id' => $visitorId,
                'new_views_count' => $publication->vues
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Vue enregistrée avec succès',
                'vues' => $publication->vues,
                'already_viewed' => false
            ]);

        } catch (\Exception $e) {
            Log::error('Error in view method:', [
                'error' => $e->getMessage(),
                'publication_id' => $id,
                'visitor_id' => $request->header('X-Visitor-ID')
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'enregistrement de la vue: ' . $e->getMessage()
            ], 500);
        }
    }

    // Méthode pour générer un ID unique pour le visiteur
    private function getVisitorId(Request $request)
    {
        return md5($request->ip() . $request->userAgent());
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