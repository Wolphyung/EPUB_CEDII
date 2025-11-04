<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\AdminReply;
use App\Models\Membre; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException; 

class MessageController extends Controller
{
    /**
     * Affiche une liste de tous les messages (avec leurs réponses de l'admin).
     */
    public function index()
    {
        return response()->json(
            Message::with('replies') 
                ->orderBy('created_at', 'desc')
                ->get()
        );
    }
    
    // Vous n'avez pas fourni 'store' - il n'est pas modifié ici.
    public function store(Request $request) 
    {
        // Placez votre logique pour les messages utilisateurs ici
        return response()->json(['message' => 'Méthode store non implémentée pour les messages utilisateurs'], 501);
    }

    /**
     * 🗑️ Supprimer un message (CORRIGÉ: Ajout de la suppression des réponses liées).
     */
    public function destroy($id)
    {
        try {
            $message = Message::findOrFail($id);

            // Étape CRUCIALE : Supprimer toutes les réponses associées
            // Avant de supprimer le message parent. Ceci évite l'erreur 500.
            $message->replies()->delete(); 

            // Supprimer le message principal
            $message->delete();

            // Code 204 No Content est la réponse standard pour une suppression réussie
            return response()->json(null, 204); 

        } catch (\Exception $e) {
            return response()->json([
                'message' => '❌ Erreur lors de la suppression du message : ' . $e->getMessage()
            ], 500); 
        }
    }

    /**
     * Marque un message comme lu.
     */
    public function markAsRead($id)
    {
        try {
            $message = Message::findOrFail($id);
            $message->read = true; // Met le statut à LU
            $message->save();

            return response()->json($message);
        } catch (\Exception $e) {
             return response()->json(['message' => 'Erreur lors de la mise à jour: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Marque tous les messages comme lus.
     */
    public function markAllAsRead()
    {
        $count = Message::where('read', false)->update(['read' => true]);
        return response()->json(['message' => 'Opération réussie', 'count' => $count]);
    }
    
    /**
     * Enregistre la réponse de l'administrateur à un message.
     */
    public function reply(Request $request, $id)
    {
        $request->validate([
            'content' => 'required|string', 
        ]);

        $message = Message::findOrFail($id);
        
        AdminReply::create([
            'message_id' => $message->id,
            'content' => $request->content,
            // 'admin_id' : Ajoutez la logique d'authentification si disponible
        ]);

        $message->read = true;
        $message->save();

        // Retourne le message complet avec toutes les réponses
        return response()->json(Message::with('replies')->find($message->id));
    }


    // --- Méthodes pour l'envoi de messages initiés par l'Admin ---

    /**
     * Liste des utilisateurs/membres (destinataires potentiels).
     */
    public function listMembers()
    {
        try {
            $membres = Membre::select('id', 'nom', 'email', 'type')
                                   ->orderBy('nom')
                                   ->get();

            return response()->json($membres);
        } catch (\Exception $e) {
             return response()->json(['message' => 'Erreur lors du chargement des membres: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Permet à l'administrateur d'envoyer un nouveau message à un membre.
     */
    public function sendAdminMessage(Request $request)
    {
        try {
            $request->validate([
                'recipient_id' => 'required|exists:membres,id', 
                'subject' => 'required|string|max:255', 
                'content' => 'required|string',
            ]);
            
            $recipient = Membre::find($request->recipient_id);

            $message = Message::create([
                'sender' => $recipient->nom, 
                'email' => $recipient->email,
                'category' => $request->subject, 
                'content' => "ADMINISTRATEUR ({$recipient->type}): " . $request->content, 
                'read' => true,
            ]);
            
            return response()->json($message, 201);
            
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Erreur de validation: ' . $e->getMessage(), 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de l\'envoi du message admin: ' . $e->getMessage()], 500);
        }
    }
}