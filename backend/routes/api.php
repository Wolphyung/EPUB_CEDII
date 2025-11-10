<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\MembreController;
use App\Http\Controllers\PublicationController;
use App\Http\Controllers\EvenementController;
use App\Http\Controllers\AppelOffreController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;

// Routes publiques
Route::get('/test', function () {
    return response()->json(['message' => 'API Laravel fonctionne ✅']);
});

// Authentification
Route::post('/register', [RegisterController::class, 'register']);
Route::post('/login', [LoginController::class, 'login']);

// Publications (publiques)
Route::get('/publications', [PublicationController::class, 'index']);
Route::get('/publications/{id}', [PublicationController::class, 'show']);
Route::get('/publications/{id}/download', [PublicationController::class, 'downloadFile']);

// Événements (publics)
Route::get('/evenements', [EvenementController::class, 'index']);
Route::get('/evenements/{evenement}', [EvenementController::class, 'show']);

// Appels d'offres (publics)
Route::get('/appeloffres', [AppelOffreController::class, 'index']);

// Messages visiteurs
Route::post('/messages', [MessageController::class, 'store']);

// Routes protégées par Sanctum
Route::middleware('auth:sanctum')->group(function () {
    // Routes pour les notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::post('/', [NotificationController::class, 'store']);
        Route::put('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::put('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/clear', [NotificationController::class, 'clearAll']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
    });
    
    // User info
    Route::get('/user', function (Request $request) {
        return response()->json([
            'user' => [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'type' => 'visiteur',
            ]
        ]);
    });

    // Publications protégées
    Route::post('/publications', [PublicationController::class, 'store']);
    Route::put('/publications/{id}', [PublicationController::class, 'update']);
    Route::delete('/publications/{id}', [PublicationController::class, 'destroy']);
    Route::post('/publications/{id}/validate', [PublicationController::class, 'validatePublication']);

    // Événements protégés
    Route::post('/evenements', [EvenementController::class, 'store']);
    Route::post('/evenements/{evenement}', [EvenementController::class, 'update']);
    Route::delete('/evenements/{evenement}', [EvenementController::class, 'destroy']);

    // Appels d'offres protégés
    Route::post('/appeloffres', [AppelOffreController::class, 'store']);
    Route::put('/appeloffres/{id}', [AppelOffreController::class, 'update']);
    Route::delete('/appeloffres/{id}', [AppelOffreController::class, 'destroy']);

    // Messages protégés
    Route::get('/messages', [MessageController::class, 'index']);
    Route::delete('/messages/{id}', [MessageController::class, 'destroy']);
    Route::put('/messages/{id}/read', [MessageController::class, 'markAsRead']);
    Route::put('/messages/mark-all-read', [MessageController::class, 'markAllAsRead']);
    Route::post('/messages/{id}/reply', [MessageController::class, 'reply']);
});

// Routes admin pour notifications
Route::prefix('admin/notifications')->group(function () {
    Route::get('/', [NotificationController::class, 'index']);
    Route::put('/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/clear', [NotificationController::class, 'clearAll']);
    Route::delete('/{id}', [NotificationController::class, 'destroy']);
    Route::post('/', [NotificationController::class, 'store']);
});

// Membres
Route::get('/membres', [MembreController::class, 'index']);
Route::post('/membres', [MembreController::class, 'store']);
Route::put('/membres/{id}', [MembreController::class, 'update']);
Route::delete('/membres/{id}', [MembreController::class, 'destroy']);
Route::get('membres/{id}/profile', [MembreController::class, 'show']);
Route::put('membres/{id}/profile', [MembreController::class, 'updateProfile']);
Route::post('membres/{id}/avatar', [MembreController::class, 'updateAvatar']);

// Messages supplémentaires
Route::get('/messages/member/{memberId}', [MessageController::class, 'getMemberConversations']);
Route::post('/messages/start-conversation', [MessageController::class, 'startConversation']);
Route::get('/messages/conversation/{membreId}', [MessageController::class, 'getConversation']);
Route::post('/messages/send-to/{membreId}', [MessageController::class, 'sendToMembre']);
Route::get('/messages/conversation-detail/{conversationId}', [MessageController::class, 'getConversationDetail']);
Route::put('/messages/mark-all-read/{membreId}', [MessageController::class, 'markAllAsRead']);
Route::post('/messages/send-admin', [MessageController::class, 'sendAdminMessage']);
Route::get('/members', [MessageController::class, 'listMembers']);

// Contenus validés pour visiteurs
Route::get('/publications/validees', [PublicationController::class, 'getPublicationsValidees']);
Route::get('/evenements/valides', [EvenementController::class, 'getEvenementsValides']);
Route::get('/appeloffres/valides', [AppelOffreController::class, 'getAppelsOffresValides']);