<?php

namespace App\Http\Controllers;

use App\Models\Membre;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
            $validated = $request->validate([
                'nom' => 'required|string|max:255',
                'prenom' => 'required|string|max:255',
                'type' => 'required|string|max:100',
                'email' => 'required|email|unique:membres,email',
                'password' => 'required|string|min:6',
                'statut' => 'required|string|max:100',
                'avatar' => 'nullable|file|image|max:2048',
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

            // 📸 Sauvegarder l'image si elle existe
            if ($request->hasFile('avatar')) {
                $path = $request->file('avatar')->store('avatars', 'public');
                $validated['avatar'] = asset('storage/' . $path);
            }

            // 🔐 Hasher le mot de passe
            $validated['password'] = bcrypt($validated['password']);

            // 💾 Enregistrer le membre
            $membre = Membre::create($validated);

            return response()->json([
                'success' => true,
                'message' => '✅ Membre ajouté avec succès',
                'data' => $membre
            ], 201);
        } catch (\Exception $e) {
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

            $validated = $request->validate([
                'nom' => 'required|string|max:255',
                'prenom' => 'required|string|max:255',
                'type' => 'required|string|max:100',
                'email' => 'required|email|unique:membres,email,' . $id,
                'statut' => 'required|string|max:100',
                'password' => 'nullable|string|min:6',
                'avatar' => 'nullable|file|image|max:2048',
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

            // 📸 Si une nouvelle image est envoyée
            if ($request->hasFile('avatar')) {
                // Supprimer l'ancienne image s'il y en a une
                if ($membre->avatar) {
                    $oldPath = str_replace(asset('storage/'), '', $membre->avatar);
                    Storage::disk('public')->delete($oldPath);
                }

                $path = $request->file('avatar')->store('avatars', 'public');
                $validated['avatar'] = asset('storage/' . $path);
            }

            // 🔐 Si un nouveau mot de passe est fourni, on le chiffre
            if (!empty($validated['password'])) {
                $validated['password'] = bcrypt($validated['password']);
            } else {
                unset($validated['password']);
            }

            // 💾 Mise à jour du membre
            $membre->update($validated);

            return response()->json([
                'success' => true,
                'message' => '✅ Membre modifié avec succès',
                'data' => $membre
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '❌ Erreur lors de la modification : ' . $e->getMessage()
            ], 400);
        }
    }

    // ✏️ Mettre à jour le profil (version simplifiée pour React)
    public function updateProfile(Request $request, $id)
    {
        try {
            $membre = Membre::findOrFail($id);

            $validated = $request->validate([
                'nom' => 'required|string|max:255',
                'prenom' => 'required|string|max:255',
                'email' => 'required|email|unique:membres,email,' . $id,
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
                'type' => 'required|string|max:100',
                'statut' => 'required|string|max:100',
                'password' => 'nullable|string|min:6',
            ]);

            // 🔐 Si un nouveau mot de passe est fourni, on le chiffre
            if (!empty($validated['password'])) {
                $validated['password'] = bcrypt($validated['password']);
            } else {
                unset($validated['password']);
            }

            // 💾 Mise à jour du membre
            $membre->update($validated);

            return response()->json([
                'success' => true,
                'message' => '✅ Profil modifié avec succès',
                'data' => $membre
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '❌ Erreur lors de la modification du profil : ' . $e->getMessage()
            ], 400);
        }
    }

    // 🖼️ Mettre à jour uniquement l'avatar
    public function updateAvatar(Request $request, $id)
    {
        try {
            $request->validate([
                'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            $membre = Membre::findOrFail($id);

            // Supprimer l'ancienne image s'il y en a une
            if ($membre->avatar) {
                $oldPath = str_replace(asset('storage/'), '', $membre->avatar);
                Storage::disk('public')->delete($oldPath);
            }

            // Stocker la nouvelle image
            $path = $request->file('avatar')->store('avatars', 'public');
            $avatarUrl = asset('storage/' . $path);

            $membre->update(['avatar' => $avatarUrl]);

            return response()->json([
                'success' => true,
                'message' => '✅ Avatar mis à jour avec succès',
                'avatar_url' => $avatarUrl,
                'data' => $membre
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '❌ Erreur lors du changement d\'avatar : ' . $e->getMessage()
            ], 400);
        }
    }

    // 🗑️ Supprimer un membre
    public function destroy($id)
    {
        try {
            $membre = Membre::findOrFail($id);

            if ($membre->avatar) {
                $oldPath = str_replace(asset('storage/'), '', $membre->avatar);
                Storage::disk('public')->delete($oldPath);
            }

            $membre->delete();

            return response()->json([
                'success' => true,
                'message' => '✅ Membre supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '❌ Erreur lors de la suppression : ' . $e->getMessage()
            ], 400);
        }
    }
}