<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Admin;
use App\Models\Membre;
use App\Models\User;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        // Vérifie d'abord si c'est un admin (table admins)
        $admin = Admin::where('email', $request->email)->first();
        if ($admin) {
            // Vérification spéciale pour les mots de passe
            if ($this->checkPassword($request->password, $admin->password)) {
                $token = $admin->createToken('admin_token')->plainTextToken;
                return response()->json([
                    'message' => 'Connexion réussie ✅',
                    'user' => [
                        'id' => $admin->id,
                        'org_name' => $admin->org_name,
                        'email' => $admin->email,
                        'type' => 'admin'
                    ],
                    'token' => $token,
                    'redirect_to' => '/dashadmin'
                ]);
            }
        }

        // Vérifie si c'est un membre (table membres)
        $membre = Membre::where('email', $request->email)->first();
        if ($membre) {
            // Vérification spéciale pour les mots de passe
            if ($this->checkPassword($request->password, $membre->password)) {
                $token = $membre->createToken('membre_token')->plainTextToken;
                return response()->json([
                    'message' => 'Connexion réussie ✅',
                    'user' => [
                        'id' => $membre->id,
                        'nom' => $membre->nom,
                        'email' => $membre->email,
                        'type' => 'membre',
                        'statut' => $membre->statut,
                        'avatar' => $membre->avatar
                    ],
                    'token' => $token,
                    'redirect_to' => '/dashMembre'
                ]);
            }
        }

        // Vérifie si c'est un utilisateur de la table users (visiteur)
        $user = User::where('email', $request->email)->first();
        if ($user) {
            // Vérification spéciale pour les mots de passe
            if ($this->checkPassword($request->password, $user->password)) {
                $token = $user->createToken('user_token')->plainTextToken;
                
                return response()->json([
                    'message' => 'Connexion réussie ✅',
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'type' => 'visiteur',
                    ],
                    'token' => $token,
                    'redirect_to' => '/pubvisiteur'
                ]);
            }
        }

        return response()->json(['message' => 'Email ou mot de passe incorrect'], 401);
    }

    /**
     * Vérifie le mot de passe avec support pour différents algorithmes
     */
    private function checkPassword($plainPassword, $hashedPassword)
    {
        // D'abord essayer Bcrypt (standard Laravel)
        if (Hash::check($plainPassword, $hashedPassword)) {
            return true;
        }

        // Si Bcrypt échoue, vérifier si c'est le mot de passe en clair
        if ($plainPassword === $hashedPassword) {
            return true;
        }

        // Si MD5 (pour compatibilité)
        if (md5($plainPassword) === $hashedPassword) {
            return true;
        }

        return false;
    }
}