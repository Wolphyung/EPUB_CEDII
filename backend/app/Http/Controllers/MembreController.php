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
        $membres = Membre::all(); // Récupère tous les membres
        return response()->json($membres, 200);
    } catch (\Exception $e) {
        return response()->json([
            'message' => '❌ Erreur lors du chargement des membres : ' . $e->getMessage()
        ], 500);
    }
}
    // ➕ Ajouter un membre
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nom' => 'required|string|max:255',
                'type' => 'required|string|max:100',
                'email' => 'required|email|unique:membres,email',
                'password' => 'required|string|min:6',
                'statut' => 'required|string|max:100',
                'avatar' => 'nullable|file|image|max:2048',
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
                'message' => '✅ Membre ajouté avec succès',
                'data' => $membre
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => '❌ Erreur lors de l’ajout du membre : ' . $e->getMessage()
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
                'type' => 'required|string|max:100',
                'email' => 'required|email|unique:membres,email,' . $id,
                'statut' => 'required|string|max:100',
                'password' => 'nullable|string|min:6',
                'avatar' => 'nullable|file|image|max:2048',
            ]);

            // 📸 Si une nouvelle image est envoyée
            if ($request->hasFile('avatar')) {
                // Supprimer l’ancienne image s’il y en a une
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
                'message' => '✅ Membre modifié avec succès',
                'data' => $membre
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => '❌ Erreur lors de la modification : ' . $e->getMessage()
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

            return response()->json(['message' => '✅ Membre supprimé avec succès']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => '❌ Erreur lors de la suppression : ' . $e->getMessage()
            ], 400);
        }
    }
}
