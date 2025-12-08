<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Récupérer tous les utilisateurs (visiteurs)
     */
    public function index()
    {
        try {
            $users = User::all();
            return response()->json([
                'success' => true,
                'data' => $users
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des utilisateurs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer un nouvel utilisateur (visiteur)
     */
    public function store(Request $request)
    {
        try {
            Log::info('Store user request:', [
                'name' => $request->name,
                'email' => $request->email,
                'email_verified_at' => $request->email_verified_at,
                'all_data' => $request->all()
            ]);
            Log::info('FULL REQUEST:', [
                'headers' => $request->headers->all(),
                'all_data' => $request->all(),
                'content_type' => $request->header('Content-Type')
            ]);

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8',
                'statut' => 'nullable|in:actif,inactif,suspendu',
                'email_verified_at' => 'nullable|date',
            ]);

            if ($validator->fails()) {
                Log::error('Validation errors:', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Erreurs de validation',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = [
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'statut' => $request->statut ?? 'actif',
            ];

            // Gérer email_verified_at correctement
            if ($request->has('email_verified_at') && $request->email_verified_at) {
                $data['email_verified_at'] = $request->email_verified_at;
            } else {
                $data['email_verified_at'] = null;
            }

            $user = User::create($data);

            Log::info('User created:', ['user_id' => $user->id]);

            return response()->json([
                'success' => true,
                'message' => 'Visiteur créé avec succès',
                'data' => $user
            ], 201);

        } catch (\Exception $e) {
            Log::error('Store user error:', [
                'error' => $e->getMessage(), 
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du visiteur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour un utilisateur (visiteur)
     */
    public function update(Request $request, $id)
    {
        try {
            Log::info('Update user request:', [
                'id' => $id, 
                'data' => $request->all(),
            ]);
            
            $user = User::find($id);
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Visiteur non trouvé'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $id,
                'password' => 'sometimes|nullable|string|min:8',
                'statut' => 'sometimes|nullable|in:actif,inactif,suspendu',
                'email_verified_at' => 'nullable|date',
            ]);

            if ($validator->fails()) {
                Log::error('Validation errors:', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            // Préparer les données à mettre à jour
            $updateData = [];
            
            // Vérifier si le champ est présent dans la requête (même s'il est null)
            if ($request->filled('name')) {
                $updateData['name'] = $request->name;
            }
            
            if ($request->filled('email')) {
                $updateData['email'] = $request->email;
            }
            
            if ($request->filled('password') && !empty($request->password)) {
                $updateData['password'] = Hash::make($request->password);
            }
            
            if ($request->filled('statut')) {
                $updateData['statut'] = $request->statut;
            }
            
            // email_verified_at peut être explicitement null
            if ($request->has('email_verified_at')) {
                $updateData['email_verified_at'] = $request->email_verified_at;
            }

            Log::info('Données à mettre à jour:', $updateData);

            // Mettre à jour l'utilisateur
            if (!empty($updateData)) {
                $user->update($updateData);
            }

            Log::info('Utilisateur mis à jour avec succès:', [
                'id' => $user->id,
                'name' => $user->name,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Visiteur mis à jour avec succès',
                'data' => $user
            ]);

        } catch (\Exception $e) {
            Log::error('Update user error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du visiteur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un utilisateur (visiteur)
     */
    public function destroy($id)
    {
        try {
            $user = User::find($id);
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Visiteur non trouvé'
                ], 404);
            }

            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'Visiteur supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            Log::error('Destroy user error:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression du visiteur',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}