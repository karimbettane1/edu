<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\ContactRequest;
use App\Models\ContactMessage;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class ContactController extends Controller
{
    public function store(ContactRequest $request): JsonResponse
    {
        $message = ContactMessage::create($request->validated());

        User::where('role', UserRole::Admin)
            ->where('is_active', true)
            ->get()
            ->each(fn (User $admin) => $admin->appNotifications()->create([
                'type' => 'contact_message',
                'title' => 'Nouveau message de contact',
                'message' => $message->name.' : '.$message->subject,
                'url' => '/admin/parametres',
            ]));

        return response()->json([
            'message' => 'Merci ! Votre message a bien été envoyé. Notre équipe vous répondra dans les plus brefs délais.',
        ], 201);
    }
}
