<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

use App\Http\Controllers\MembreController;
use App\Http\Controllers\PublicationController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\EvenementController;
use App\Http\Controllers\AppelOffreController;

Route::apiResource('evenements', EvenementController::class);


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
