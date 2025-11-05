<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

use App\Http\Controllers\MembreController;
use App\Http\Controllers\PublicationController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\EvenementController;
use App\Http\Controllers\AppelOffreController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;


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
    
    // Vos autres routes...
});

Route::apiResource('publications', PublicationController::class);
Route::post('/publications/{id}/validate', [PublicationController::class, 'validatePublication']);
Route::get('/publications/{id}/download', [PublicationController::class, 'downloadFile']);
Route::apiResource('evenements', EvenementController::class);


Route::prefix('admin/notifications')->group(function () {
    Route::get('/', [NotificationController::class, 'index']);
    Route::put('/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/clear', [NotificationController::class, 'clearAll']);
    Route::delete('/{id}', [NotificationController::class, 'destroy']);
    Route::post('/', [NotificationController::class, 'store']);
});

Route::post('/login', [LoginController::class, 'login']);


Route::get('/publications', [PublicationController::class, 'index']);        // lister
Route::post('/publications', [PublicationController::class, 'store']);       // créer
Route::get('/publications/{id}', [PublicationController::class, 'show']);   // voir un seul
Route::put('/publications/{id}', [PublicationController::class, 'update']); // modifier
Route::delete('/publications/{id}', [PublicationController::class, 'destroy']); // supprimer


Route::get('/evenements', [EvenementController::class, 'index']);
Route::get('/evenements/{evenement}', [EvenementController::class, 'show']);
Route::post('/evenements', [EvenementController::class, 'store']);
Route::post('/evenements/{evenement}', [EvenementController::class, 'update']); // Avec _method=PUT dans FormData
Route::delete('/evenements/{evenement}', [EvenementController::class, 'destroy']);
Route::get('/evenements/search', [EvenementController::class, 'search']);


Route::get('/test', function () {
    return response()->json(['message' => 'API Laravel fonctionne ✅']);
});

Route::post('/register', [AuthController::class, 'register']);



Route::get('/membres', [MembreController::class, 'index']);
Route::post('/membres', [MembreController::class, 'store']);
Route::put('/membres/{id}', [MembreController::class, 'update']);
Route::delete('/membres/{id}', [MembreController::class, 'destroy']);

Route::apiResource('appeloffres', AppelOffreController::class);


// --- Routes de Messagerie Admin ---

// GET: Liste tous les messages (avec les réponses)
Route::get('/messages', [MessageController::class, 'index']);
// POST: Crée un nouveau message (Formulaire de contact client)
Route::post('/messages', [MessageController::class, 'store']); 
// DELETE: Supprime un message
Route::delete('/messages/{id}', [MessageController::class, 'destroy']); 
// PUT: Marque un message individuel comme lu
Route::put('/messages/{id}/read', [MessageController::class, 'markAsRead']); 
// PUT: Marque tous les messages comme lus
Route::put('/messages/mark-all-read', [MessageController::class, 'markAllAsRead']); 
// POST: Envoie la réponse de l'administrateur à un message existant
Route::post('/messages/{id}/reply', [MessageController::class, 'reply']); 

// --- Routes pour l'envoi de messages initiés par l'Admin ---

// GET: Liste les membres (destinataires potentiels)
Route::get('/members', [MessageController::class, 'listMembers']); 
// POST: Envoi d'un message initié par l'admin
Route::post('/messages/send-admin', [MessageController::class, 'sendAdminMessage']);