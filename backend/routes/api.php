<?php

use Illuminate\Http\Request;
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
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Log;

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

// Publications (publiques) - ROUTES CORRIGÉES POUR LES RÉACTIONS
Route::get('/publications/validees', [PublicationController::class, 'getPublicationsValidees']);
Route::get('/publications', [PublicationController::class, 'index']);
Route::get('/publications/{id}', [PublicationController::class, 'show']);
Route::get('/publications/{id}/download', [PublicationController::class, 'downloadFile']);

// Routes pour les réactions des visiteurs - DÉPLACÉES HORS AUTH
Route::post('/publications/{id}/react', [PublicationController::class, 'react']);
Route::post('/publications/{id}/view', [PublicationController::class, 'view']);


// Événements (publics)
Route::get('/evenements', [EvenementController::class, 'index']);
Route::get('/evenements/{evenement}', [EvenementController::class, 'show']);
Route::get('/evenements/valides', [EvenementController::class, 'getEvenementsValides']);
// Routes pour les visiteurs (événements validés)
Route::get('/evenements-valides', [EvenementController::class, 'getEvenementsValides']);
// Routes pour les réactions et vues des événements visiteurs
Route::post('/evenements/{id}/react', [EvenementController::class, 'react']);
Route::post('/evenements/{id}/view', [EvenementController::class, 'view']);
Route::get('/evenements/{id}/stats', [EvenementController::class, 'getStats']);

// Appels d'offres (publics)
Route::get('/appeloffres', [AppelOffreController::class, 'index']);
Route::get('/appeloffres/valides', [AppelOffreController::class, 'getAppelsOffresValides']);
Route::get('/appels-offre-valides', [AppelOffreController::class, 'getAppelsOffreValides']);
// Routes pour les réactions et vues des appels d'offre visiteurs
Route::post('/appeloffres/{id}/react', [AppelOffreController::class, 'react']);
Route::post('/appeloffres/{id}/view', [AppelOffreController::class, 'view']);
Route::get('/appeloffres/{id}/stats', [AppelOffreController::class, 'getStats']);

// Messages visiteurs
Route::post('/messages', [MessageController::class, 'store']);
Route::get('/contacts-visiteur', [MessageController::class, 'getContactsForVisitor']);

// Membres (publics - lecture seulement)
Route::get('/membres', [MembreController::class, 'index']);
Route::get('/membres/{id}/profile', [MembreController::class, 'show']);

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
        // Les routes react et view sont maintenant publiques pour les visiteurs
    });

    // ==================== ÉVÉNEMENTS ====================
    Route::prefix('evenements')->group(function () {
        Route::post('/', [EvenementController::class, 'store']);
        Route::put('/{evenement}', [EvenementController::class, 'update']);
        Route::delete('/{evenement}', [EvenementController::class, 'destroy']);
        // Routes POST spécifiques pour les mises à jour
        Route::post('/{id}/status', [EvenementController::class, 'updateStatus']);
        Route::post('/{id}/update', [EvenementController::class, 'updateEvent']);
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

    // Autres routes admin peuvent être ajoutées ici...

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

// Route de test directe sans contrôleur
Route::get('/test-direct', function() {
    try {
        Log::info('=== TEST DIRECT ROUTE CALLED ===');
        
        $publications = \App\Models\Publication::where('statut', 'Validé')->get();
        
        return response()->json([
            'success' => true,
            'count' => $publications->count(),
            'publications' => $publications->map(function($pub) {
                return [
                    'id' => $pub->id_publication,
                    'titre' => $pub->titre,
                    'statut' => $pub->statut
                ];
            })->toArray()
        ]);
        
    } catch (\Exception $e) {
        Log::error('Direct route error:', ['error' => $e->getMessage()]);
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
});