<?php

namespace App\Providers;

use App\Models\Setting;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Super admin bypasses all gates & policies
        Gate::before(function ($user, $ability) {
            if ($user->isSuperAdmin()) {
                return true;
            }
        });

        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }

        // Override mail config from DB settings (if configured)
        $this->app->booted(function () {
            try {
                if (Setting::smtpConfigured()) {
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

                    Mail::purge('smtp');
                }
            } catch (\Throwable) {
                // DB not ready yet (migrations pending) — ignore
            }
        });
    }
}
