<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;

class AdminSettingsController extends Controller
{
    public function edit(): Response
    {
        $smtp = Setting::smtp();

        return Inertia::render('Admin/Settings', [
            'smtp' => [
                'host' => $smtp['host'] ?? '',
                'port' => $smtp['port'] ?? '587',
                'username' => $smtp['username'] ?? '',
                'password' => $smtp['password'] ? '••••••••' : '',
                'encryption' => $smtp['encryption'] ?? 'tls',
                'from_address' => $smtp['from_address'] ?? '',
                'from_name' => $smtp['from_name'] ?? '',
            ],
            'isConfigured' => Setting::smtpConfigured(),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'host' => 'required|string|max:255',
            'port' => 'required|integer|min:1|max:65535',
            'username' => 'required|string|max:255',
            'password' => 'nullable|string|max:255',
            'encryption' => 'required|in:tls,ssl,none',
            'from_address' => 'required|email|max:255',
            'from_name' => 'required|string|max:255',
        ]);

        Setting::set('smtp_host', $validated['host']);
        Setting::set('smtp_port', $validated['port']);
        Setting::set('smtp_username', $validated['username']);
        Setting::set('smtp_encryption', $validated['encryption']);
        Setting::set('smtp_from_address', $validated['from_address']);
        Setting::set('smtp_from_name', $validated['from_name']);

        // Only update password if a new one was provided (not the masked placeholder)
        if ($validated['password'] && $validated['password'] !== '••••••••') {
            Setting::set('smtp_password', $validated['password']);
        }

        return redirect()->route('admin.settings')
            ->with('success', 'Configuracion SMTP guardada correctamente.');
    }

    public function testConnection(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        if (!Setting::smtpConfigured()) {
            return back()->with('error', 'Primero configura los datos SMTP.');
        }

        try {
            $smtp = Setting::smtp();

            config([
                'mail.default' => 'smtp',
                'mail.mailers.smtp.host' => $smtp['host'],
                'mail.mailers.smtp.port' => (int) $smtp['port'],
                'mail.mailers.smtp.username' => $smtp['username'],
                'mail.mailers.smtp.password' => $smtp['password'],
                'mail.mailers.smtp.encryption' => $smtp['encryption'] === 'none' ? null : $smtp['encryption'],
                'mail.from.address' => $smtp['from_address'],
                'mail.from.name' => $smtp['from_name'],
            ]);

            // Purge the cached mailer so it picks up new config
            Mail::purge('smtp');

            Mail::raw('Este es un correo de prueba desde BuilderApp para verificar la configuracion SMTP.', function ($message) use ($request, $smtp) {
                $message->to($request->email)
                    ->subject('Prueba de conexion SMTP - BuilderApp')
                    ->from($smtp['from_address'], $smtp['from_name']);
            });

            return back()->with('success', "Correo de prueba enviado a {$request->email}.");
        } catch (TransportExceptionInterface $e) {
            return back()->with('error', 'Error de conexion SMTP: ' . $e->getMessage());
        } catch (\Throwable $e) {
            return back()->with('error', 'Error al enviar: ' . $e->getMessage());
        }
    }
}
