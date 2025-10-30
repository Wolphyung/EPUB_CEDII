<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Admin;
use App\Models\Membre;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        // Vérifie d'abord si c'est un admin
        $admin = Admin::where('email', $request->email)->first();

        if ($admin && Hash::check($request->password, $admin->password)) {
            return response()->json([
                'message' => 'Connexion réussie ✅',
                'user' => [
                    'id' => $admin->id,
                    'org_name' => $admin->org_name,
                    'email' => $admin->email,
                    'type' => 'admin'
                ]
            ]);
        }

        // Sinon, vérifie si c'est un membre
        $membre = Membre::where('email', $request->email)->first();

        if ($membre && Hash::check($request->password, $membre->password)) {
            return response()->json([
                'message' => 'Connexion réussie ✅',
                'user' => [
                    'id' => $membre->id,
                    'nom' => $membre->nom,
                    'email' => $membre->email,
                    'type' => 'membre',
                    'statut' => $membre->statut,
                    'avatar' => $membre->avatar
                ]
            ]);
        }

        // Si aucun des deux n'existe
        return response()->json(['message' => 'Email ou mot de passe incorrect'], 401);
    }
}
