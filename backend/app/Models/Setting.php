<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;

class Setting extends Model
{
    protected $primaryKey = 'key';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['key', 'value'];

    /**
     * Get a setting value by key.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::remember("settings.{$key}", 3600, function () use ($key, $default) {
            $setting = static::find($key);

            if (!$setting) {
                return $default;
            }

            if (in_array($key, static::$encryptedKeys) && $setting->value) {
                try {
                    return Crypt::decryptString($setting->value);
                } catch (\Throwable) {
                    return $setting->value;
                }
            }

            return $setting->value;
        });
    }

    private static array $encryptedKeys = ['smtp_password'];

    /**
     * Set a setting value.
     */
    public static function set(string $key, mixed $value): void
    {
        $storedValue = in_array($key, static::$encryptedKeys) && $value
            ? Crypt::encryptString($value)
            : $value;

        static::updateOrCreate(['key' => $key], ['value' => $storedValue]);
        Cache::forget("settings.{$key}");
    }

    /**
     * Get all SMTP settings as an array.
     */
    public static function smtp(): array
    {
        return [
            'host' => static::get('smtp_host'),
            'port' => static::get('smtp_port', '587'),
            'username' => static::get('smtp_username'),
            'password' => static::get('smtp_password'),
            'encryption' => static::get('smtp_encryption', 'tls'),
            'from_address' => static::get('smtp_from_address'),
            'from_name' => static::get('smtp_from_name'),
        ];
    }

    /**
     * Check if SMTP is configured.
     */
    public static function smtpConfigured(): bool
    {
        $host = static::get('smtp_host');
        $username = static::get('smtp_username');

        return !empty($host) && !empty($username);
    }
}
