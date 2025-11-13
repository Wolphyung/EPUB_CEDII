<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    // Récupère le profil du visiteur connecté
    public function getProfile(Request $request)
    {
        try {
            $user = $request->user(); // Vérifie que l'utilisateur est authentifié
            if (!$user) {
                return response()->json(['message' => 'Utilisateur non authentifié'], 401);
            }

            return response()->json($user, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur serveur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Mettre à jour le profil
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id
        ]);

        $user->update($request->only('name', 'email'));

        return response()->json([
            'message' => 'Profil mis à jour',
            'user' => $user
        ]);
    }

    // Changer le mot de passe
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed'
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Mot de passe actuel incorrect'], 422);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json(['message' => 'Mot de passe changé avec succès']);
    }
}
