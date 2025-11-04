<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Laravel CORS Configuration
    |--------------------------------------------------------------------------
    |
    | Cette configuration permet d’autoriser ton frontend (React, Vue, etc.)
    | à communiquer avec ton backend Laravel sans blocage CORS.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'], // Inclut Sanctum si tu fais une auth plus tard

    'allowed_methods' => ['*'], // Autorise toutes les méthodes HTTP (GET, POST, PUT, DELETE, etc.)

    'allowed_origins' => [
        'http://localhost:3000',
        'http://192.168.56.1:3000',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'], // Autorise tous les headers (utile pour Axios)

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true, // ← mets TRUE si tu veux utiliser cookies/token d’authentification
];
