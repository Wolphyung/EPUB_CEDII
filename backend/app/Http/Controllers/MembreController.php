<?php

namespace App\Http\Controllers;

use App\Models\Membre;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class MembreController extends Controller
{
    // Lister tous les membres
    public function index()
    {
        try {
            $membres = Membre::select('id', 'nom', 'prenom', 'email', 'telephone', 'profession', 'avatar', 'statut', 'created_at')
                              ->get();
            return response()->json($membres, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors du chargement des membres'], 500);
        }
    }

    // Afficher un membre
    public function show($id)
    {
        try {
            $membre = Membre::findOrFail($id);
            return response()->json(['success' => true, 'data' => $membre], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Membre non trouvé'], 404);
        }
    }

    // Créer un membre
    public function store(Request $request)
    {
        try {
            Log::info('Création membre', $request->all());

            $validator = Validator::make($request->all(), [
                'nom'           => 'required|string|max:255',
                'prenom'        => 'required|string|max:255',
                'email'         => 'required|email|unique:membres,email',
                'password'      => 'required|string|min:6',
                'type'          => 'required|in:membre,admin,moderateur',
                'statut'        => 'required|in:actif,inactif,suspendu',
                'telephone'     => 'nullable|string|max:20',
                'adresse'       => 'nullable|string|max:255',
                'ville'         => 'nullable|string|max:100',
                'pays'          => 'nullable|string|max:100',
                'bio'           => 'nullable|string',
                'date_naissance'=> 'nullable|date',
                'profession'    => 'nullable|string|max:255',
                'site_web'      => 'nullable|url',
                'linkedin'      => 'nullable|url',
                'twitter'       => 'nullable|url',
                'avatar'        => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de validation',
                    'errors'  => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();
            $data['prenom'] = trim($data['prenom']) ?: 'Membre';

            if ($request->hasFile('avatar')) {
                $path = $request->file('avatar')->store('avatars', 'public');
                $data['avatar'] = $path;
            }

            $data['password'] = bcrypt($data['password']);
            $membre = Membre::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Membre créé avec succès',
                'data'    => $membre
            ], 201);

        } catch (\Exception $e) {
            Log::error('Erreur création', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Erreur serveur'], 500);
        }
    }

    // Mise à jour complète (admin)
    public function update(Request $request, $id)
    {
        try {
            $membre = Membre::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'nom'           => 'required|string|max:255',
                'prenom'        => 'required|string|max:255',
                'email'         => 'required|email|unique:membres,email,' . $id,
                'type'          => 'sometimes|in:membre,admin,moderateur',
                'statut'        => 'required|in:actif,inactif,suspendu',
                'telephone'     => 'nullable|string|max:20',
                'adresse'       => 'nullable|string|max:255',
                'ville'         => 'nullable|string|max:100',
                'pays'          => 'nullable|string|max:100',
                'bio'           => 'nullable|string',
                'date_naissance'=> 'nullable|date',
                'profession'    => 'nullable|string|max:255',
                'site_web'      => 'nullable|url',
                'linkedin'      => 'nullable|url',
                'twitter'       => 'nullable|url',
                'password'      => 'nullable|string|min:6',
                'avatar'        => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de validation',
                    'errors'  => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();
            $data['prenom'] = trim($data['prenom']) ?: 'Membre';

            if ($request->hasFile('avatar')) {
                if ($membre->avatar && Storage::disk('public')->exists($membre->avatar)) {
                    Storage::disk('public')->delete($membre->avatar);
                }
                $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
            }

            if (!empty($data['password'])) {
                $data['password'] = bcrypt($data['password']);
            } else {
                unset($data['password']);
            }

            $membre->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Membre mis à jour avec succès',
                'data'    => $membre
            ], 200);

        } catch (\Exception $e) {
            Log::error('Erreur update', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Erreur serveur'], 500);
        }
    }

    // Mise à jour du profil personnel (appelée par ton React)
    public function updateProfile(Request $request, $id)
    {
        try {
            // 1. Vérification auth
            if (!auth('sanctum')->check() || auth('sanctum')->id() != $id) {
                return response()->json(['success' => false, 'message' => 'Non autorisé'], 403);
            }

            $membre = Membre::findOrFail($id);

            // 2. On prend TOUT ce qui arrive et on filtre à la main (plus de surprise)
            $input = $request->all();

            // 3. On garde SEULEMENT ce qui existe dans la table
            $data = [
                'nom'           => $input['nom'] ?? null,
                'prenom'        => trim($input['prenom'] ?? '') ?: 'Membre',
                'email'         => $input['email'] ?? null,
                'telephone'     => $input['telephone'] ?? null,
                'adresse'       => $input['adresse'] ?? null,
                'ville'         => $input['ville'] ?? null,
                'pays'          => $input['pays'] ?? null,
                'bio'           => $input['bio'] ?? null,
                'date_naissance'=> $input['date_naissance'] ?? null,
                'profession'    => $input['profession'] ?? null,
                'site_web'      => $input['site_web'] ?? null,
                'linkedin'      => $input['linkedin'] ?? null,
                'twitter'       => $input['twitter'] ?? null,
                'statut'        => $input['statut'] ?? 'actif',
                'type'          => 'membre', // forcé pour toujours
            ];

            // 4. Validation manuelle ultra-stricte
            $rules = [
                'nom'           => 'required|string|max:255',
                'prenom'        => 'required|string|max:255',
                'email'         => 'required|email|unique:membres,email,'.$id,
                'telephone'     => 'nullable|string|max:20',
                'adresse'       => 'nullable|string|max:255',
                'ville'         => 'nullable|string|max:100',
                'pays'          => 'nullable|string|max:100',
                'bio'           => 'nullable|string',
                'date_naissance'=> 'nullable|date',
                'profession'    => 'nullable|string|max:255',
                'site_web'      => 'nullable|url',
                'linkedin'      => 'nullable|url',
                'twitter'       => 'nullable|url',
                'statut'        => 'required|in:actif,inactif,suspendu',
            ];

            $validator = Validator::make($data, $rules);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation échouée',
                    'errors'  => $validator->errors()
                ], 422);
            }

            // 5. Mise à jour
            $membre->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Profil mis à jour avec succès !',
                'data'    => $membre->fresh()
            ], 200);

        } catch (\Exception $e) {
            Log::error('updateProfile error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur serveur',
                'debug'   => $e->getMessage()
            ], 500);
        }
    }

    // Changer l'avatar
    public function updateAvatar(Request $request, $id)
    {
        try {
            if (auth('sanctum')->id() != $id) {
                return response()->json(['success' => false, 'message' => 'Accès refusé'], 403);
            }

            $membre = Membre::findOrFail($id);

            $request->validate([
                'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            if ($membre->avatar && Storage::disk('public')->exists($membre->avatar)) {
                Storage::disk('public')->delete($membre->avatar);
            }

            $path = $request->file('avatar')->store('avatars', 'public');
            $membre->update(['avatar' => $path]);

            return response()->json([
                'success' => true,
                'message' => 'Photo mise à jour !',
                'avatar_url' => asset('storage/' . $path)
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur upload'], 500);
        }
    }

    // Supprimer un membre
    public function destroy($id)
    {
        try {
            $membre = Membre::findOrFail($id);

            if ($membre->avatar && Storage::disk('public')->exists($membre->avatar)) {
                Storage::disk('public')->delete($membre->avatar);
            }

            $membre->delete();

            return response()->json(['success' => true, 'message' => 'Membre supprimé'], 200);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erreur suppression'], 500);
        }
    }
}