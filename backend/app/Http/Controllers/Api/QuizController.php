<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\QuizAttemptRequest;
use App\Http\Resources\QuizAttemptResource;
use App\Http\Resources\QuizQuestionResource;
use App\Http\Resources\QuizResource;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $quizzes = Quiz::query()
            ->with(['module', 'filiere'])
            ->withCount('questions')
            ->where('is_published', true)
            ->when($request->integer('filiere_id'), fn (Builder $query, int $filiereId) => $query->where('filiere_id', $filiereId))
            ->when($request->integer('module_id'), fn (Builder $query, int $moduleId) => $query->where('module_id', $moduleId))
            ->latest()
            ->get();

        $stats = QuizAttempt::query()
            ->where('user_id', $user->id)
            ->whereIn('quiz_id', $quizzes->pluck('id'))
            ->selectRaw('quiz_id, count(*) as attempts_total, max(score) as best_score')
            ->groupBy('quiz_id')
            ->get()
            ->keyBy('quiz_id');

        $quizzes->each(function (Quiz $quiz) use ($stats) {
            $stat = $stats->get($quiz->id);
            $quiz->setAttribute('my_attempts_count', $stat?->attempts_total ?? 0);
            $quiz->setAttribute('my_best_score', $stat?->best_score);
        });

        return response()->json(['data' => QuizResource::collection($quizzes)]);
    }

    public function show(int $id, Request $request): JsonResponse
    {
        $quiz = Quiz::query()
            ->with(['module', 'filiere', 'questions.answers'])
            ->withCount('questions')
            ->where('is_published', true)
            ->findOrFail($id);

        $stat = QuizAttempt::query()
            ->where('user_id', $request->user()->id)
            ->where('quiz_id', $quiz->id)
            ->selectRaw('count(*) as attempts_total, max(score) as best_score')
            ->first();

        $quiz->setAttribute('my_attempts_count', $stat?->attempts_total ?? 0);
        $quiz->setAttribute('my_best_score', $stat?->best_score);

        return response()->json([
            'data' => array_merge(
                (new QuizResource($quiz))->toArray(request()),
                ['questions' => QuizQuestionResource::collection($quiz->questions)->resolve(request())],
            ),
        ]);
    }

    public function submitAttempt(int $id, QuizAttemptRequest $request): JsonResponse
    {
        $user = $request->user();

        $quiz = Quiz::query()
            ->with(['questions.answers', 'module'])
            ->where('is_published', true)
            ->findOrFail($id);

        $questions = $quiz->questions->keyBy('id');
        $submitted = collect($request->input('answers'))->keyBy('question_id');

        $correctCount = 0;
        $details = [];
        $review = [];

        foreach ($questions as $question) {
            /** @var Question $question */
            $correctAnswer = $question->answers->firstWhere('is_correct', true);
            $selectedId = $submitted->get($question->id)['answer_id'] ?? null;
            $selected = $selectedId ? $question->answers->firstWhere('id', (int) $selectedId) : null;

            $isCorrect = $selected !== null && $correctAnswer !== null && (int) $selected->id === (int) $correctAnswer->id;
            $correctCount += $isCorrect ? 1 : 0;

            $details[] = [
                'question_id' => $question->id,
                'answer_id' => $selected?->id,
                'is_correct' => $isCorrect,
            ];

            $review[] = [
                'question_id' => $question->id,
                'question' => $question->text,
                'type' => $question->type,
                'explanation' => $question->explanation,
                'selected_answer_id' => $selected?->id,
                'correct_answer_id' => $correctAnswer?->id,
                'is_correct' => $isCorrect,
                'answers' => $question->answers->map(fn ($answer) => [
                    'id' => $answer->id,
                    'text' => $answer->text,
                    'is_correct' => (bool) $answer->is_correct,
                ])->values()->all(),
            ];
        }

        $total = $questions->count();
        $score = $total > 0 ? (int) round($correctCount / $total * 100) : 0;

        $attempt = QuizAttempt::create([
            'quiz_id' => $quiz->id,
            'user_id' => $user->id,
            'score' => $score,
            'correct_count' => $correctCount,
            'total_questions' => $total,
            'duration_seconds' => $request->integer('duration_seconds') ?: null,
            'details' => $details,
            'completed_at' => now(),
        ]);

        $passed = $score >= $quiz->passing_score;

        if ($passed) {
            $user->appNotifications()->create([
                'type' => 'quiz_passed',
                'title' => 'Quiz réussi',
                'message' => 'Vous avez obtenu '.$score.'% au quiz « '.$quiz->title.' ». Félicitations !',
                'url' => '/quiz',
            ]);
        }

        return response()->json([
            'message' => $passed
                ? 'Félicitations, vous avez réussi le quiz avec '.$score.'%.'
                : 'Quiz terminé. Vous avez obtenu '.$score.'%. Continuez vos révisions et réessayez.',
            'data' => [
                'attempt' => new QuizAttemptResource($attempt),
                'quiz' => [
                    'id' => $quiz->id,
                    'title' => $quiz->title,
                    'passing_score' => (int) $quiz->passing_score,
                ],
                'review' => $review,
            ],
        ], 201);
    }

    public function attempts(int $id, Request $request)
    {
        $quiz = Quiz::where('is_published', true)->findOrFail($id);
        $perPage = min(max($request->integer('per_page', 10), 1), 48);

        $attempts = $quiz->attempts()
            ->where('user_id', $request->user()->id)
            ->orderByDesc('completed_at')
            ->paginate($perPage);

        return QuizAttemptResource::collection($attempts);
    }
}
