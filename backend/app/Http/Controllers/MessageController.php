<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\AdminReply;
use App\Models\Membre; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException; 
use App\Http\Controllers\NotificationController;

class MessageController extends Controller
{
    /**
     * Affiche une liste de tous les messages groupés par membre (pour l'admin)
     */
    public function index()
    {
        try {
            // Récupérer tous les membres avec leurs derniers messages
            $membres = Membre::with(['messages' => function($query) {
                    $query->orderBy('created_at', 'desc');
                }])
                ->withCount(['messages as unread_count' => function($query) {
                    $query->where('read', false);
                }])
                ->orderBy('nom')
                ->get();

            return response()->json($membres);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement des membres: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupère la conversation complète avec un membre spécifique (pour l'admin)
     */
    public function getConversation($membreId)
    {
        try {
            $membre = Membre::findOrFail($membreId);
            
            // Récupérer tous les messages et réponses
            $messages = Message::where('membre_id', $membreId)
                ->with('replies')
                ->orderBy('created_at', 'asc')
                ->get();

            // Structurer tous les messages dans un seul tableau
            $allMessages = collect();
            
            foreach ($messages as $message) {
                // Ajouter le message principal
                $allMessages->push([
                    'id' => $message->id,
                    'content' => $message->content,
                    'created_at' => $message->created_at,
                    'is_from_admin' => $message->is_from_admin,
                    'read' => $message->read,
                    'sender' => $message->sender,
                    'type' => 'message'
                ]);

                // Ajouter les réponses (toujours de l'admin)
                foreach ($message->replies as $reply) {
                    $allMessages->push([
                        'id' => $reply->id,
                        'content' => $reply->content,
                        'created_at' => $reply->created_at,
                        'is_from_admin' => true, // Les réponses viennent toujours de l'admin
                        'read' => true,
                        'sender' => 'Admin',
                        'type' => 'reply'
                    ]);
                }
            }

            // Trier par date
            $sortedMessages = $allMessages->sortBy('created_at')->values();

            return response()->json([
                'membre' => $membre,
                'messages' => $sortedMessages
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement de la conversation: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupère toutes les conversations d'un membre (pour le frontend membre)
     */
    public function getMemberConversations($memberId)
    {
        try {
            // Récupérer tous les messages pour ce membre
            $messages = Message::where('membre_id', $memberId)
                ->with(['replies' => function($query) {
                    $query->orderBy('created_at', 'asc');
                }])
                ->orderBy('created_at', 'desc')
                ->get();

            // Si pas de messages, créer une conversation vide
            if ($messages->isEmpty()) {
                return response()->json([]);
            }

            // Formater les messages
            $formattedMessages = $this->formatMessagesForMember($messages);

            // Pour le membre, on considère qu'il n'y a qu'une seule conversation avec le support
            $conversation = [
                'id' => $messages->first()->id, // Utiliser le premier message comme ID de conversation
                'sender' => "Support CEDII",
                'avatarUrl' => null,
                'nonLu' => $messages->where('read', false)->count(),
                'lastMessage' => $messages->sortByDesc('created_at')->first(),
                'messages' => $formattedMessages
            ];

            return response()->json([$conversation]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement des conversations: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Formate les messages pour l'affichage côté membre
     */
    private function formatMessagesForMember($messages)
    {
        $allMessages = collect();
        
        foreach ($messages as $message) {
            // Message du membre ou de l'admin
            $allMessages->push([
                'id' => $message->id,
                'content' => $message->content,
                'created_at' => $message->created_at,
                'is_from_admin' => $message->is_from_admin,
                'read' => $message->read,
                'sender' => $message->sender,
                'type' => 'message'
            ]);

            // Réponses de l'admin
            foreach ($message->replies as $reply) {
                $allMessages->push([
                    'id' => $reply->id,
                    'content' => $reply->content,
                    'created_at' => $reply->created_at,
                    'is_from_admin' => true,
                    'read' => true,
                    'sender' => 'Admin',
                    'type' => 'reply'
                ]);
            }
        }

        // Trier par date croissante
        return $allMessages->sortBy('created_at')->values();
    }

    /**
     * Envoi d'un message par l'admin à un membre
     */
    public function sendToMembre(Request $request, $membreId)
    {
        try {
            $request->validate([
                'content' => 'required|string',
            ]);

            $membre = Membre::findOrFail($membreId);

            // Créer le message de l'admin
            $message = Message::create([
                'membre_id' => $membreId,
                'sender' => 'Admin',
                'email' => 'admin@system.com',
                'category' => 'Admin',
                'content'      => $request->input('content'),
                'read' => false, // Le membre ne l'a pas encore lu
                'is_from_admin' => true,
            ]);

            // Retourner le message formaté
            return response()->json([
                'id' => $message->id,
                'content' => $message->content,
                'created_at' => $message->created_at,
                'is_from_admin' => true,
                'read' => false,
                'sender' => 'Admin',
                'type' => 'message'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de l\'envoi du message: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Message d'un membre à l'admin
     */
    public function store(Request $request) 
    {
        try {
            $request->validate([
                'membre_id' => 'required|exists:membres,id',
                'sender' => 'required|string|max:255',
                'email' => 'required|email',
                'category' => 'required|string',
                'content' => 'required|string',
            ]);

            $message = Message::create([
                'membre_id' => $request->membre_id,
                'sender' => $request->sender,
                'email' => $request->email,
                'category' => $request->category,
                'content'      => $request->input('content'),
                'read' => false, // L'admin ne l'a pas encore lu
                'is_from_admin' => false,
            ]);

            // Retourner le message formaté
            return response()->json([
                'id' => $message->id,
                'content' => $message->content,
                'created_at' => $message->created_at,
                'is_from_admin' => false,
                'read' => false,
                'sender' => $request->sender,
                'type' => 'message'
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de l\'envoi du message: ' . $e->getMessage()
            ], 500);
        }
        NotificationController::createNotification([
            'type' => 'new_message',
            'message' => 'Nouveau message de ' . auth()->user()->name,
            'organisation_name' => 'Messagerie',
            'user_id' => $request->receiver_id,
            'item_id' => $message->id,
            'item_type' => 'message'
        ]);
    }

    /**
     * Réponse de l'admin à un message spécifique
     */
    public function reply(Request $request, $id)
    {
        try {
            $request->validate([
                'content' => 'required|string', 
            ]);

            $message = Message::findOrFail($id);
            
            // Créer la réponse de l'admin
            $reply = AdminReply::create([
                'message_id' => $message->id,
                'content'      => $request->input('content'),
                'is_from_admin' => true,
            ]);

            $message->read = true;
            $message->save();

            // Retourner la réponse formatée
            return response()->json([
                'id' => $reply->id,
                'content' => $reply->content,
                'created_at' => $reply->created_at,
                'is_from_admin' => true,
                'read' => true,
                'sender' => 'Admin',
                'type' => 'reply'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de l\'envoi de la réponse: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Démarre une nouvelle conversation
     */
    public function startConversation(Request $request)
    {
        try {
            $request->validate([
                'membre_id' => 'required|exists:membres,id',
                'subject' => 'required|string',
                'content' => 'required|string',
            ]);

            $membre = Membre::find($request->membre_id);

            $message = Message::create([
                'membre_id' => $membre->id,
                'sender' => $membre->nom,
                'email' => $membre->email,
                'category' => $request->subject,
                'content'      => $request->input('content'),
                'read' => false,
                'is_from_admin' => false,
            ]);

            return response()->json([
                'message' => 'Conversation démarrée avec succès',
                'conversation' => [
                    'id' => $message->id,
                    'content' => $message->content,
                    'created_at' => $message->created_at,
                    'is_from_admin' => false,
                    'read' => false,
                    'sender' => $membre->nom,
                    'type' => 'message'
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du démarrage de la conversation: ' . $e->getMessage()
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
            $message->read = true;
            $message->save();

            return response()->json($message);
        } catch (\Exception $e) {
             return response()->json(['message' => 'Erreur lors de la mise à jour: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Marque tous les messages comme lus pour un membre spécifique
     */
    public function markAllAsRead($membreId)
    {
        try {
            $count = Message::where('membre_id', $membreId)
                ->where('read', false)
                ->update(['read' => true]);

            return response()->json([
                'message' => 'Tous les messages marqués comme lus',
                'count' => $count
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprime un message
     */
    public function destroy($id)
    {
        try {
            $message = Message::findOrFail($id);
            $membreId = $message->membre_id;

            $message->replies()->delete();
            $message->delete();

            return response()->json([
                'message' => 'Message supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => '❌ Erreur lors de la suppression du message : ' . $e->getMessage()
            ], 500); 
        }
    }

    /**
     * Récupère les détails d'une conversation spécifique
     */
    public function getConversationDetail($conversationId)
    {
        try {
            $message = Message::with('replies')
                ->findOrFail($conversationId);

            $allMessages = collect();
            
            // Message principal
            $allMessages->push([
                'id' => $message->id,
                'content' => $message->content,
                'created_at' => $message->created_at,
                'is_from_admin' => $message->is_from_admin,
                'read' => $message->read,
                'sender' => $message->sender,
                'type' => 'message'
            ]);

            // Réponses
            foreach ($message->replies as $reply) {
                $allMessages->push([
                    'id' => $reply->id,
                    'content' => $reply->content,
                    'created_at' => $reply->created_at,
                    'is_from_admin' => true,
                    'read' => true,
                    'sender' => 'Admin',
                    'type' => 'reply'
                ]);
            }

            // Trier par date
            $sortedMessages = $allMessages->sortBy('created_at')->values();

            return response()->json([
                'id' => $message->id,
                'sender' => "Support CEDII",
                'avatarUrl' => null,
                'nonLu' => $message->read ? 0 : 1,
                'messages' => $sortedMessages
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement de la conversation: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Liste des membres (pour la modale admin)
     */
    public function listMembers()
    {
        try {
            $membres = Membre::select('id', 'nom', 'email', 'type')
                ->orderBy('nom')
                ->get();

            return response()->json($membres);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement des membres: ' . $e->getMessage()
            ], 500);
        }
    }
    
    public function getContactsForVisitor()
{
    try {
        // Récupérer tous les membres
        $membres = Membre::select('id', 'nom', 'email', 'type')
            ->orderBy('nom')
            ->get();

        // Récupérer les admins
        $admins = DB::table('admins')
            ->select('id', 'nom', 'email', DB::raw("'admin' as type"))
            ->orderBy('nom')
            ->get();

        // Fusionner les deux collections
        $contacts = $membres->concat($admins)->sortBy('nom')->values();

        return response()->json($contacts);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Erreur lors du chargement des contacts: ' . $e->getMessage()
        ], 500);
    }
}
}