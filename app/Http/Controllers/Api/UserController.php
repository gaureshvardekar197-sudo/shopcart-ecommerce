<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;

class UserController extends Controller
{
    // Get all users
    public function index()
    {
        $users = User::select('id','name','email','phone','role','created_at')->get();

        return response()->json([
            'status' => true,
            'users' => $users
        ]);
    }

    // Get only admins
    public function admins()
    {
        $admins = User::where('role', 1)
            ->select('id','name','email','phone','role','created_at')
            ->get();

        return response()->json([
            'status' => true,
            'admins' => $admins
        ]);
    }
}