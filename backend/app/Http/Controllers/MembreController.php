<?php

namespace App\Http\Controllers;

use App\Models\Membre;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class MembreController extends Controller
{
    // 📋 Lister tous les membres
    public function index()
    {
        try {
            $membres = Membre::all();
            return response()->json($membres, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => '❌ Erreur lors du chargement des membres : ' . $e->getMessage()
            ], 500);
        }
    }

    // 👤 Récupérer un membre spécifique
    public function show($id)
    {
        try {
            $membre = Membre::findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $membre
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '❌ Membre non trouvé : ' . $e->getMessage()
            ], 404);
        }
    }

    // ➕ Ajouter un membre
    public function store(Request $request)
    {
        try {
            Log::info('Début création membre', $request->all());

            // Validation des données
            $validator = Validator::make($request->all(), [
                'nom' => 'required|string|max:255',
                'prenom' => 'required|string|max:255', // Champ requis
                'type' => 'required|string|max:100',
                'email' => 'required|email|unique:membres,email',
                'password' => 'required|string|min:6',
                'statut' => 'required|string|max:100',
                'avatar' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:2048',
                'telephone' => 'nullable|string|max:20',
                'adresse' => 'nullable|string|max:255',
                'ville' => 'nullable|string|max:255',
                'pays' => 'nullable|string|max:255',
                'bio' => 'nullable|string',
                'date_naissance' => 'nullable|date',
                'profession' => 'nullable|string|max:255',
                'site_web' => 'nullable|url',
                'linkedin' => 'nullable|url',
                'twitter' => 'nullable|url',
            ]);

            if ($validator->fails()) {
                Log::error('Erreur validation membre', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => '❌ Erreur de validation : ' . $validator->errors()->first(),
                    'errors' => $validator->errors()
                ], 400);
            }

            // Traitement des données
            $membreData = $validator->validated();

            // Nettoyer le prénom (supprimer les espaces)
            $membreData['prenom'] = trim($membreData['prenom']);

            // Si le prénom est vide après trim, mettre une valeur par défaut
            if (empty($membreData['prenom'])) {
                $membreData['prenom'] = '-';
            }

            // 📸 Sauvegarder l'image si elle existe
            if ($request->hasFile('avatar')) {
                $path = $request->file('avatar')->store('avatars', 'public');
                $membreData['avatar'] = $path;
                Log::info('Avatar sauvegardé', ['path' => $path]);
            }

            // 🔐 Hasher le mot de passe
            $membreData['password'] = bcrypt($membreData['password']);

            Log::info('Données avant création', $membreData);

            // 💾 Enregistrer le membre
            $membre = Membre::create($membreData);

            Log::info('Membre créé avec succès', ['id' => $membre->id]);

            return response()->json([
                'success' => true,
                'message' => '✅ Membre ajouté avec succès',
                'data' => $membre
            ], 201);

        } catch (\Exception $e) {
            Log::error('Erreur création membre', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => '❌ Erreur lors de l\'ajout du membre : ' . $e->getMessage()
            ], 400);
        }
    }

    // ✏️ Modifier un membre
    public function update(Request $request, $id)
    {
        try {
            $membre = Membre::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'nom' => 'required|string|max:255',
                'prenom' => 'required|string|max:255', // Champ requis
                'type' => 'required|string|max:100',
                'email' => 'required|email|unique:membres,email,' . $id,
                'statut' => 'required|string|max:100',
                'password' => 'nullable|string|min:6',
                'avatar' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:2048',
                'telephone' => 'nullable|string|max:20',
                'adresse' => 'nullable|string|max:255',
                'ville' => 'nullable|string|max:255',
                'pays' => 'nullable|string|max:255',
                'bio' => 'nullable|string',
                'date_naissance' => 'nullable|date',
                'profession' => 'nullable|string|max:255',
                'site_web' => 'nullable|url',
                'linkedin' => 'nullable|url',
                'twitter' => 'nullable|url',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => '❌ Erreur de validation : ' . $validator->errors()->first(),
                    'errors' => $validator->errors()
                ], 400);
            }

            $membreData = $validator->validated();

            // Nettoyer le prénom
            $membreData['prenom'] = trim($membreData['prenom']);

            // Si le prénom est vide après trim, mettre une valeur par défaut
            if (empty($membreData['prenom'])) {
                $membreData['prenom'] = '-';
            }

            // 📸 Si une nouvelle image est envoyée
            if ($request->hasFile('avatar')) {
                // Supprimer l'ancienne image s'il y en a une
                if ($membre->avatar && Storage::disk('public')->exists($membre->avatar)) {
                    Storage::disk('public')->delete($membre->avatar);
                }

                $path = $request->file('avatar')->store('avatars', 'public');
                $membreData['avatar'] = $path;
            }

            // 🔐 Si un nouveau mot de passe est fourni, on le chiffre
            if (!empty($membreData['password'])) {
                $membreData['password'] = bcrypt($membreData['password']);
            } else {
                unset($membreData['password']);
            }

            // 💾 Mise à jour du membre
            $membre->update($membreData);

            return response()->json([
                'success' => true,
                'message' => '✅ Membre modifié avec succès',
                'data' => $membre
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur modification membre:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'success' => false,
                'message' => '❌ Erreur lors de la modification : ' . $e->getMessage()
            ], 400);
        }
    }

    // 🗑️ Supprimer un membre
    public function destroy($id)
    {
        try {
            $membre = Membre::findOrFail($id);

            if ($membre->avatar && Storage::disk('public')->exists($membre->avatar)) {
                Storage::disk('public')->delete($membre->avatar);
            }

            $membre->delete();

            return response()->json([
                'success' => true,
                'message' => '✅ Membre supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur suppression membre:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'success' => false,
                'message' => '❌ Erreur lors de la suppression : ' . $e->getMessage()
            ], 400);
        }
    }
}