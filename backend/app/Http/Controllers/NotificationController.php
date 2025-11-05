<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index()
    {
        try {
            $notifications = Notification::orderBy('created_at', 'desc')->get();
            
            return response()->json([
                'success' => true,
                'data' => $notifications
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'type' => 'required|string',
                'message' => 'required|string',
                'organisation_name' => 'required|string',
                'item_id' => 'required|integer',
                'item_type' => 'required|string'
            ]);

            $notification = Notification::create($validated);

            return response()->json([
                'success' => true,
                'data' => $notification,
                'message' => 'Notification créée avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de la notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function markAsRead($id)
    {
        try {
            $notification = Notification::findOrFail($id);
            $notification->update(['read' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Notification marquée comme lue'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Notification non trouvée'
            ], 404);
        }
    }

    public function markAllAsRead()
    {
        try {
            Notification::where('read', false)->update(['read' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Toutes les notifications marquées comme lues'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du marquage des notifications'
            ], 500);
        }
    }

    public function clearAll()
    {
        try {
            Notification::truncate();

            return response()->json([
                'success' => true,
                'message' => 'Toutes les notifications supprimées'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression des notifications'
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $notification = Notification::findOrFail($id);
            $notification->delete();

            return response()->json([
                'success' => true,
                'message' => 'Notification supprimée'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Notification non trouvée'
            ], 404);
        }
    }
}