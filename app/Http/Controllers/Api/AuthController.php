<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class AuthController extends Controller
{
    // Register
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'phone' => ['required','regex:/^[6-9]\d{9}$/','unique:users,phone'],
            'password' => 'required|min:6'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => 0
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'User registered successfully',
            'token' => $token,
            'user' => $user
        ]);
    }

    // Login
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'token' => $token,
            'user' => $user
        ]);
    }

    // Logout
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    // ============ FORGOT PASSWORD METHODS ============

public function sendOtp(Request $request)
{
    $validator = Validator::make($request->all(), [
        'email' => 'required|email|exists:users,email'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Email not found in our records'
        ], 404);
    }

    try {
        // Generate 6-digit OTP
        $otp = rand(100000, 999999);
        
        // Delete any existing OTP for this email
        PasswordReset::where('email', $request->email)->delete();
        
        // Save OTP to database
        PasswordReset::create([
            'email' => $request->email,
            'otp' => $otp,
            'expires_at' => Carbon::now()->addMinutes(10)
        ]);

        // ✅ UNCOMMENT THIS - ACTUALLY SEND EMAIL
        Mail::send('email.otp', ['otp' => $otp], function($message) use ($request) {
            $message->to($request->email);
            $message->subject('Password Reset OTP - Shopcart');
        });

        return response()->json([
            'success' => true,
            'message' => 'OTP sent successfully to your email'
        ]);

        // ❌ REMOVE OR COMMENT OUT THIS TESTING CODE
        /*
        return response()->json([
            'success' => true,
            'message' => 'OTP sent successfully',
            'otp' => $otp
        ]);
        */

    } catch (\Exception $e) {
        \Log::error('Send OTP Error: ' . $e->getMessage());
        \Log::error($e->getTraceAsString());
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to send OTP: ' . $e->getMessage()
        ], 500);
    }
}

    // Step 2: Verify OTP
    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid OTP format'
            ], 422);
        }

        $passwordReset = PasswordReset::where('email', $request->email)
            ->where('otp', $request->otp)
            ->first();

        if (!$passwordReset) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid OTP'
            ], 400);
        }

        // Check if OTP is expired
        if (Carbon::now()->isAfter($passwordReset->expires_at)) {
            $passwordReset->delete();
            return response()->json([
                'success' => false,
                'message' => 'OTP has expired'
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'OTP verified successfully'
        ]);
    }

    // Step 3: Resend OTP
public function resendOtp(Request $request)
{
    $validator = Validator::make($request->all(), [
        'email' => 'required|email|exists:users,email'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Email not found'
        ], 404);
    }

    try {
        // Generate new OTP
        $otp = rand(100000, 999999);
        
        // Update or create OTP
        PasswordReset::updateOrCreate(
            ['email' => $request->email],
            [
                'otp' => $otp,
                'expires_at' => Carbon::now()->addMinutes(10)
            ]
        );

        // Send OTP via email
        Mail::send('emails.otp', ['otp' => $otp], function($message) use ($request) {
            $message->to($request->email);
            $message->subject('Password Reset OTP - Shopcart');
        });

        return response()->json([
            'success' => true,
            'message' => 'OTP resent successfully'
        ]);

    } catch (\Exception $e) {
        \Log::error('Resend OTP Error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to resend OTP'
        ], 500);
    }
}

    // Step 4: Reset Password
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'password' => 'required|string|min:6'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Password must be at least 6 characters'
            ], 422);
        }

        // Check if OTP was verified (record exists)
        $passwordReset = PasswordReset::where('email', $request->email)->first();
        
        if (!$passwordReset) {
            return response()->json([
                'success' => false,
                'message' => 'Please verify OTP first'
            ], 400);
        }

        // Update password
        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        // Delete the OTP record
        PasswordReset::where('email', $request->email)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password reset successfully'
        ]);
    }
}
// Note: Only ONE closing brace for the class and ONE for the namespace (total 2 braces at the end)