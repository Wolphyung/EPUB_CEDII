<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Admin;
use App\Models\Membre;
use App\Models\User;
use App\Models\Abonnement;
use Carbon\Carbon;

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
            if ($this->checkPassword($request->password, $membre->password)) {
                
                // VÉRIFICATION DE L'ABONNEMENT
                $abonnementValide = $this->verifierAbonnementMembre($membre->id);
                
                if (!$abonnementValide['valide']) {
                    // Abonnement expiré ou inexistant
                    return response()->json([
                        'message' => 'Votre abonnement a expiré ou est inexistant. Veuillez renouveler votre abonnement.',
                        'abonnement_info' => $abonnementValide,
                        'redirect_to' => '/abonnement-page' // Page pour renouveler l'abonnement
                    ], 403);
                }
                
                // Vérifie si le membre est actif
                if ($membre->statut !== 'actif') {
                    return response()->json([
                        'message' => 'Votre compte est ' . ($membre->statut === 'inactif' ? 'en attente d\'activation' : 'suspendu'),
                        'user' => [
                            'id' => $membre->id,
                            'nom' => $membre->nom,
                            'email' => $membre->email,
                            'type' => 'membre',
                            'statut' => $membre->statut,
                            'avatar' => $membre->avatar
                        ],
                        'token' => null,
                        'redirect_to' => '/login'
                    ], 403);
                }

                $token = $membre->createToken('membre_token')->plainTextToken;
                return response()->json([
                    'message' => 'Connexion réussie ✅',
                    'user' => [
                        'id' => $membre->id,
                        'nom' => $membre->nom,
                        'email' => $membre->email,
                        'type' => 'membre',
                        'statut' => $membre->statut,
                        'avatar' => $membre->avatar,
                        'abonnement' => $abonnementValide['abonnement']
                    ],
                    'token' => $token,
                    'redirect_to' => '/dashMembre',
                    'abonnement_info' => $abonnementValide
                ]);
            }
        }

        // Vérifie si c'est un utilisateur de la table users (visiteur)
        $user = User::where('email', $request->email)->first();
        if ($user) {
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
     * Vérifie l'abonnement d'un membre
     */
    private function verifierAbonnementMembre($membreId)
    {
        // Récupère le dernier abonnement actif du membre
        $abonnement = Abonnement::where('membre_id', $membreId)
            ->where('statut', 'actif')
            ->orderBy('date_fin', 'desc')
            ->first();

        if (!$abonnement) {
            return [
                'valide' => false,
                'message' => 'Aucun abonnement actif trouvé',
                'abonnement' => null,
                'jours_restants' => 0
            ];
        }

        $now = Carbon::now();
        $dateFin = Carbon::parse($abonnement->date_fin);
        
        // Vérifie si l'abonnement est encore valide
        if ($dateFin->isPast()) {
            // Marque l'abonnement comme expiré
            $abonnement->update(['statut' => 'expiré']);
            
            return [
                'valide' => false,
                'message' => 'Abonnement expiré depuis ' . $dateFin->diffForHumans($now),
                'abonnement' => $abonnement,
                'jours_restants' => 0,
                'date_fin' => $abonnement->date_fin
            ];
        }

        // Calcule les jours restants
        $joursRestants = $now->diffInDays($dateFin, false);
        
        // Vérifie si l'abonnement expire bientôt (moins de 7 jours)
        $expireBientot = $joursRestants <= 7;
        
        return [
            'valide' => true,
            'message' => $expireBientot 
                ? 'Abonnement actif (expire dans ' . $joursRestants . ' jours)' 
                : 'Abonnement actif',
            'abonnement' => $abonnement,
            'jours_restants' => $joursRestants,
            'date_fin' => $abonnement->date_fin,
            'type_abonnement' => $abonnement->type_abonnement,
            'expire_bientot' => $expireBientot
        ];
    }

    /**
     * Vérifie le mot de passe avec support pour différents algorithmes
     */
    private function checkPassword($plainPassword, $hashedPassword)
    {
        if (Hash::check($plainPassword, $hashedPassword)) {
            return true;
        }

        if ($plainPassword === $hashedPassword) {
            return true;
        }

        if (md5($plainPassword) === $hashedPassword) {
            return true;
        }

        return false;
    }
}