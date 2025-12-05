<?php
// app/Http/Controllers/Api/AbonnementController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Abonnement;
use App\Models\Membre;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AbonnementController extends Controller
{
    public function index()
    {
        try {
            $abonnements = Abonnement::with('membre')
                ->orderBy('created_at', 'desc')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $abonnements
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des abonnements',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'membre_id' => 'required|exists:membres,id',
            'type_abonnement' => 'required|in:mensuel,trimestriel,annuel',
            'date_debut' => 'required|date',
            'montant' => 'required|numeric|min:0',
            'methode_paiement' => 'nullable|string',
            'statut' => 'nullable|in:actif,expiré,annulé',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $dateDebut = \Carbon\Carbon::parse($request->date_debut);
            $dateFin = $dateDebut->copy();
            
            switch($request->type_abonnement) {
                case 'mensuel':
                    $dateFin->addMonth();
                    break;
                case 'trimestriel':
                    $dateFin->addMonths(3);
                    break;
                case 'annuel':
                    $dateFin->addYear();
                    break;
                default:
                    $dateFin->addMonth();
            }

            $abonnement = Abonnement::create([
                'membre_id' => $request->membre_id,
                'type_abonnement' => $request->type_abonnement,
                'date_debut' => $dateDebut,
                'date_fin' => $dateFin,
                'statut' => $request->statut ?? 'actif',
                'montant' => $request->montant,
                'methode_paiement' => $request->methode_paiement,
                'transaction_id' => $request->transaction_id,
                'notes' => $request->notes
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Abonnement créé avec succès',
                'data' => $abonnement
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de l\'abonnement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $abonnement = Abonnement::with('membre')->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $abonnement
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Abonnement non trouvé'
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $abonnement = Abonnement::findOrFail($id);
            
            $validator = Validator::make($request->all(), [
                'type_abonnement' => 'sometimes|in:mensuel,trimestriel,annuel',
                'date_debut' => 'sometimes|date',
                'date_fin' => 'sometimes|date',
                'statut' => 'sometimes|in:actif,expiré,annulé',
                'montant' => 'sometimes|numeric|min:0',
                'methode_paiement' => 'nullable|string',
                'notes' => 'nullable|string',
                'membre_id' => 'sometimes|exists:membres,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $abonnement->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Abonnement mis à jour avec succès',
                'data' => $abonnement
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de l\'abonnement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $abonnement = Abonnement::findOrFail($id);
            $abonnement->delete();

            return response()->json([
                'success' => true,
                'message' => 'Abonnement supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de l\'abonnement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function stats()
    {
        try {
            $total = Abonnement::count();
            $actifs = Abonnement::where('statut', 'actif')
                ->where('date_fin', '>=', now())
                ->count();
            $expires = Abonnement::where('statut', 'expiré')
                ->orWhere('date_fin', '<', now())
                ->count();
            $revenus = Abonnement::sum('montant');

            return response()->json([
                'success' => true,
                'data' => [
                    'total' => $total,
                    'actifs' => $actifs,
                    'expires' => $expires,
                    'revenus' => (float) $revenus
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du calcul des statistiques',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function byMembre($membreId)
    {
        try {
            $abonnements = Abonnement::where('membre_id', $membreId)
                ->orderBy('created_at', 'desc')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $abonnements
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des abonnements du membre',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function checkMembreAbonnement($membreId)
    {
        try {
            $abonnement = Abonnement::where('membre_id', $membreId)
                ->where('statut', 'actif')
                ->where('date_fin', '>=', now())
                ->first();

            return response()->json([
                'success' => true,
                'has_abonnement' => !is_null($abonnement),
                'data' => $abonnement
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la vérification de l\'abonnement',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}