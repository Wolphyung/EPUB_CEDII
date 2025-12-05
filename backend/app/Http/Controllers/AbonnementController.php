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
    // Récupérer tous les abonnements
    public function index()
    {
        $abonnements = Abonnement::with('membre')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $abonnements
        ]);
    }

    // Récupérer les abonnements d'un membre
    public function byMembre($membreId)
    {
        $abonnements = Abonnement::where('membre_id', $membreId)
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $abonnements
        ]);
    }

    // Créer un nouvel abonnement
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'membre_id' => 'required|exists:membres,id',
            'type_abonnement' => 'required|in:mensuel,trimestriel,annuel',
            'date_debut' => 'required|date',
            'montant' => 'required|numeric|min:0',
            'methode_paiement' => 'nullable|string',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Calculer la date de fin selon le type
        $dateDebut = \Carbon\Carbon::parse($request->date_debut);
        $dateFin = match($request->type_abonnement) {
            'mensuel' => $dateDebut->copy()->addMonth(),
            'trimestriel' => $dateDebut->copy()->addMonths(3),
            'annuel' => $dateDebut->copy()->addYear(),
            default => $dateDebut->copy()->addMonth(),
        };

        $abonnement = Abonnement::create([
            'membre_id' => $request->membre_id,
            'type_abonnement' => $request->type_abonnement,
            'date_debut' => $dateDebut,
            'date_fin' => $dateFin,
            'statut' => 'actif',
            'montant' => $request->montant,
            'methode_paiement' => $request->methode_paiement,
            'notes' => $request->notes
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Abonnement créé avec succès',
            'data' => $abonnement
        ]);
    }

    // Mettre à jour un abonnement
    public function update(Request $request, $id)
    {
        $abonnement = Abonnement::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'type_abonnement' => 'sometimes|in:mensuel,trimestriel,annuel',
            'date_debut' => 'sometimes|date',
            'date_fin' => 'sometimes|date',
            'statut' => 'sometimes|in:actif,expiré,annulé',
            'montant' => 'sometimes|numeric|min:0',
            'notes' => 'nullable|string'
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
    }

    // Supprimer un abonnement
    public function destroy($id)
    {
        $abonnement = Abonnement::findOrFail($id);
        $abonnement->delete();

        return response()->json([
            'success' => true,
            'message' => 'Abonnement supprimé avec succès'
        ]);
    }

    // Vérifier l'abonnement d'un membre
    public function checkMembreAbonnement($membreId)
    {
        $abonnement = Abonnement::where('membre_id', $membreId)
            ->where('statut', 'actif')
            ->where('date_fin', '>=', now())
            ->first();

        return response()->json([
            'success' => true,
            'has_abonnement' => !is_null($abonnement),
            'data' => $abonnement
        ]);
    }

    // Statistiques des abonnements
    public function stats()
    {
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
                'revenus' => $revenus
            ]
        ]);
    }
}