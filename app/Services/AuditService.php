<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Log;

class AuditService
{
    public static function log(string|int|null $actorId, string $action, ?string $entityType = null, string|int|null $entityId = null, array $metadata = []): void
    {
        try {
            $request = request();

            AuditLog::create([
                'actor_id' => $actorId,
                'action' => $action,
                'entity_type' => $entityType,
                'entity_id' => $entityId,
                'metadata' => $metadata,
                'ip_address' => $request?->ip(),
                'user_agent' => $request?->userAgent(),
            ]);
        } catch (\Throwable $exception) {
            Log::warning('Audit log write failed', [
                'action' => $action,
                'message' => $exception->getMessage(),
            ]);
        }
    }
}
