<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ResolveReportRequest;
use App\Http\Resources\ReportResource;
use App\Models\AuditLog;
use App\Models\Report;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min(max($request->integer('per_page', 15), 1), 48);

        $reports = Report::query()
            ->with(['user', 'resource'])
            ->when($request->string('status')->toString(), fn (Builder $query, string $status) => $query->where('status', $status))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return ReportResource::collection($reports);
    }

    public function update(Report $report, ResolveReportRequest $request): \Illuminate\Http\JsonResponse
    {
        $report->forceFill([
            'status' => $request->string('status')->toString(),
            'resolved_by' => $request->user()->id,
            'resolved_at' => now(),
        ])->save();

        AuditLog::record(
            'report.'.$report->status,
            'Traitement d\'un signalement (ressource #'.$report->resource_id.')',
            $report,
        );

        if ($report->user_id) {
            $report->user?->appNotifications()->create([
                'type' => 'report_processed',
                'title' => 'Votre signalement a été traité',
                'message' => $report->status === 'resolved'
                    ? 'Merci ! Le signalement concernant « '.($report->resource?->title ?? 'une ressource').' » a été traité.'
                    : 'Le signalement concernant « '.($report->resource?->title ?? 'une ressource').' » a été examiné et classé.',
                'url' => '/etudiant',
            ]);
        }

        return response()->json([
            'message' => $report->status === 'resolved'
                ? 'Le signalement a été marqué comme résolu.'
                : 'Le signalement a été classé sans suite.',
            'data' => new ReportResource($report->load(['user', 'resource'])),
        ]);
    }
}
