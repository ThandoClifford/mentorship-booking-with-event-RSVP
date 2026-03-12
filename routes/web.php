<?php

use Illuminate\Support\Facades\Route;

Route::view('/{path?}', 'react-app')
    ->where('path', '^(?!api(?:/|$)|storage(?:/|$)|up$).*$');
