<?php

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000', 'http://192.168.56.1:3000'],
    'allowed_headers' => ['*'],
    'supports_credentials' => false,
];

