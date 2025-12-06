<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\MembreController;
use App\Http\Controllers\UserController; // Ajouté
use App\Http\Controllers\PublicationController;
use App\Http\Controllers\EvenementController;
use App\Http\Controllers\AppelOffreController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Api\AbonnementController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// =========================================================================
// ROUTES PUBLIQUES (Sans authentification)
// =========================================================================

// Route de test
Route::get('/test', function () {
    return response()->json(['message' => 'API Laravel fonctionne ✅']);
});

// Authentification
Route::post('/register', [RegisterController::class, 'register']);
Route::post('/login', [LoginController::class, 'login']);

// Publications (publiques)
Route::get('/publications/validees', [PublicationController::class, 'getPublicationsValidees']);
Route::get('/publications', [PublicationController::class, 'index']);
Route::get('/publications/{id}', [PublicationController::class, 'show']);
Route::get('/publications/{id}/download', [PublicationController::class, 'downloadFile']);

// Routes pour les réactions des visiteurs
Route::post('/publications/{id}/react', [PublicationController::class, 'react']);
Route::post('/publications/{id}/view', [PublicationController::class, 'view']);

// Événements (publics)
Route::get('/evenements', [EvenementController::class, 'index']);
Route::get('/evenements/{evenement}', [EvenementController::class, 'show']);
Route::get('/evenements/valides', [EvenementController::class, 'getEvenementsValides']);
Route::get('/evenements-valides', [EvenementController::class, 'getEvenementsValides']);
Route::post('/evenements/{id}/react', [EvenementController::class, 'react']);
Route::post('/evenements/{id}/view', [EvenementController::class, 'view']);
Route::get('/evenements/{id}/stats', [EvenementController::class, 'getStats']);

// Appels d'offres (publics)
Route::get('/appeloffres', [AppelOffreController::class, 'index']);
Route::get('/appeloffres/valides', [AppelOffreController::class, 'getAppelsOffresValides']);
Route::get('/appels-offre-valides', [AppelOffreController::class, 'getAppelsOffreValides']);
Route::post('/appeloffres/{id}/react', [AppelOffreController::class, 'react']);
Route::post('/appeloffres/{id}/view', [AppelOffreController::class, 'view']);
Route::get('/appeloffres/{id}/stats', [AppelOffreController::class, 'getStats']);

// Messages visiteurs
Route::post('/messages', [MessageController::class, 'store']);
Route::get('/contacts-visiteur', [MessageController::class, 'getContactsForVisitor']);

// Membres (publics - lecture seulement)
Route::get('/membres', [MembreController::class, 'index']);
Route::get('/membres/{id}/profile', [MembreController::class, 'show']);

// Visiteurs (publics - lecture seulement pour l'admin)
Route::get('/users', [UserController::class, 'index']);

// =========================================================================
// ROUTES PROTÉGÉES PAR SANCTUM (Authentification requise)
// =========================================================================

Route::middleware('auth:sanctum')->group(function () {

    // Informations utilisateur
    Route::get('/user', function (Request $request) {
        return response()->json([
            'user' => [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'type' => $request->user()->type ?? 'visiteur',
            ]
        ]);
    });

    // Profile
    Route::get('/profile', [ProfileController::class, 'getProfile']);
    Route::put('/profile', [ProfileController::class, 'updateProfile']);
    Route::put('/profile/password', [ProfileController::class, 'changePassword']);

    // ==================== PUBLICATIONS ====================
    Route::prefix('publications')->group(function () {
        Route::post('/', [PublicationController::class, 'store']);
        Route::put('/{id}', [PublicationController::class, 'update']);
        Route::delete('/{id}', [PublicationController::class, 'destroy']);
        Route::post('/{id}/validate', [PublicationController::class, 'validatePublication']);
    });

    // ==================== ÉVÉNEMENTS ====================
    Route::prefix('evenements')->group(function () {
        Route::post('/', [EvenementController::class, 'store']);
        Route::put('/{evenement}', [EvenementController::class, 'update']);
        Route::delete('/{evenement}', [EvenementController::class, 'destroy']);
        Route::post('/{id}/status', [EvenementController::class, 'updateStatus']);
        Route::post('/{id}/update', [EvenementController::class, 'updateEvent']);
    });

    // ==================== ABONNEMENTS ====================
    Route::prefix('abonnements')->group(function () {
        Route::get('/', [AbonnementController::class, 'index']);
        Route::get('/stats', [AbonnementController::class, 'stats']);
        Route::get('/membre/{membreId}', [AbonnementController::class, 'byMembre']);
        Route::get('/check/{membreId}', [AbonnementController::class, 'checkMembreAbonnement']);
        Route::post('/', [AbonnementController::class, 'store']);
        Route::put('/{id}', [AbonnementController::class, 'update']);
        Route::delete('/{id}', [AbonnementController::class, 'destroy']);
    });

    // ==================== APPELS D'OFFRES ====================
    Route::prefix('appeloffres')->group(function () {
        Route::post('/', [AppelOffreController::class, 'store']);
        Route::put('/{id}', [AppelOffreController::class, 'update']);
        Route::delete('/{id}', [AppelOffreController::class, 'destroy']);
    });

    // ==================== MESSAGES ====================
    Route::prefix('messages')->group(function () {
        Route::get('/', [MessageController::class, 'index']);
        Route::delete('/{id}', [MessageController::class, 'destroy']);
        Route::put('/{id}/read', [MessageController::class, 'markAsRead']);
        Route::put('/mark-all-read', [MessageController::class, 'markAllAsRead']);
        Route::post('/{id}/reply', [MessageController::class, 'reply']);

        // Messages entre membres
        Route::get('/member/{memberId}', [MessageController::class, 'getMemberConversations']);
        Route::post('/start-conversation', [MessageController::class, 'startConversation']);
        Route::get('/conversation/{membreId}', [MessageController::class, 'getConversation']);
        Route::post('/send-to/{membreId}', [MessageController::class, 'sendToMembre']);
        Route::get('/conversation-detail/{conversationId}', [MessageController::class, 'getConversationDetail']);
        Route::put('/mark-all-read/{membreId}', [MessageController::class, 'markAllAsRead']);
        Route::post('/send-admin', [MessageController::class, 'sendAdminMessage']);
        Route::get('/members', [MessageController::class, 'listMembers']);
    });

    // ==================== NOTIFICATIONS ====================
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::post('/', [NotificationController::class, 'store']);
        Route::put('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::put('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/clear', [NotificationController::class, 'clearAll']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
    });

    // ==================== MEMBRES (Opérations CRUD) ====================
    Route::prefix('membres')->group(function () {
        Route::post('/', [MembreController::class, 'store']);
        Route::put('/{id}', [MembreController::class, 'update']);
        Route::delete('/{id}', [MembreController::class, 'destroy']);
        Route::put('/{id}/profile', [MembreController::class, 'updateProfile']);
        Route::post('/{id}/avatar', [MembreController::class, 'updateAvatar']);
    });

    // ==================== VISITEURS (Utilisateurs - Opérations CRUD Admin) ====================
    Route::prefix('users')->group(function () {
        Route::post('/', [UserController::class, 'store']);
        Route::put('/{id}', [UserController::class, 'update']);
        Route::delete('/{id}', [UserController::class, 'destroy']);
    });

});

// =========================================================================
// ROUTES ADMIN (Peut nécessiter des permissions supplémentaires)
// =========================================================================

Route::prefix('admin')->group(function () {

    // Notifications admin
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::put('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::put('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/clear', [NotificationController::class, 'clearAll']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
        Route::post('/', [NotificationController::class, 'store']);
    });

});

// =========================================================================
// ROUTES DE FALLBACK (Pour les routes non trouvées)
// =========================================================================

Route::fallback(function () {
    return response()->json([
        'message' => 'Route API non trouvée. Veuillez vérifier l\'URL.',
        'status' => 404
    ], 404);
});