<?php

namespace Tests\Feature;

use App\Models\Answer;
use App\Models\Question;
use App\Models\Quiz;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\CreatesAcademy;
use Tests\TestCase;

class QuizAttemptTest extends TestCase
{
    use CreatesAcademy, RefreshDatabase;

    /**
     * @return array{quiz: Quiz, correct_first: Answer, wrong_second: Answer, questions: array<int, int>}
     */
    private function makePublishedQuiz(bool $published = true): array
    {
        $filiere = $this->makeFiliere();
        $module = $this->makeModule($filiere);

        $quiz = Quiz::create([
            'module_id' => $module->id,
            'filiere_id' => $filiere->id,
            'title' => 'Quiz de démonstration',
            'duration_minutes' => 10,
            'passing_score' => 50,
            'is_published' => $published,
        ]);

        $first = Question::create([
            'quiz_id' => $quiz->id,
            'type' => 'multiple_choice',
            'text' => 'Première question ?',
            'position' => 0,
        ]);
        $second = Question::create([
            'quiz_id' => $quiz->id,
            'type' => 'multiple_choice',
            'text' => 'Deuxième question ?',
            'position' => 1,
        ]);

        $firstCorrect = Answer::create(['question_id' => $first->id, 'text' => 'Bonne réponse', 'is_correct' => true, 'position' => 0]);
        Answer::create(['question_id' => $first->id, 'text' => 'Mauvaise réponse', 'is_correct' => false, 'position' => 1]);

        Answer::create(['question_id' => $second->id, 'text' => 'Bonne réponse', 'is_correct' => true, 'position' => 0]);
        $secondWrong = Answer::create(['question_id' => $second->id, 'text' => 'Mauvaise réponse', 'is_correct' => false, 'position' => 1]);

        return [
            'quiz' => $quiz,
            'correct_first' => $firstCorrect,
            'wrong_second' => $secondWrong,
            'questions' => [$first->id, $second->id],
        ];
    }

    public function test_server_grades_attempt_and_persists_it(): void
    {
        ['quiz' => $quiz, 'correct_first' => $correct, 'wrong_second' => $wrong, 'questions' => $questions] = $this->makePublishedQuiz();

        $student = $this->makeUser();
        Sanctum::actingAs($student);

        $response = $this->postJson("/api/quizzes/{$quiz->id}/attempts", [
            'answers' => [
                ['question_id' => $questions[0], 'answer_id' => $correct->id],
                ['question_id' => $questions[1], 'answer_id' => $wrong->id],
            ],
            'duration_seconds' => 42,
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.attempt.score', 50)
            ->assertJsonPath('data.attempt.correct_count', 1)
            ->assertJsonPath('data.attempt.total_questions', 2)
            ->assertJsonPath('data.attempt.passed', true);

        $this->assertDatabaseHas('quiz_attempts', [
            'quiz_id' => $quiz->id,
            'user_id' => $student->id,
            'score' => 50,
            'correct_count' => 1,
        ]);
    }

    public function test_client_cannot_force_a_score(): void
    {
        ['quiz' => $quiz, 'correct_first' => $correct, 'wrong_second' => $wrong, 'questions' => $questions] = $this->makePublishedQuiz();

        Sanctum::actingAs($this->makeUser());

        // Toutes les réponses sont fausses malgré le score « 100 » envoyé par le client.
        $this->postJson("/api/quizzes/{$quiz->id}/attempts", [
            'answers' => [
                ['question_id' => $questions[0], 'answer_id' => $wrong->id],
                ['question_id' => $questions[1], 'answer_id' => $wrong->id],
            ],
            'score' => 100,
        ])->assertCreated()->assertJsonPath('data.attempt.score', 0);
    }

    public function test_unpublished_quiz_cannot_be_attempted(): void
    {
        ['quiz' => $quiz, 'correct_first' => $correct, 'questions' => $questions] = $this->makePublishedQuiz(published: false);

        Sanctum::actingAs($this->makeUser());

        $this->postJson("/api/quizzes/{$quiz->id}/attempts", [
            'answers' => [['question_id' => $questions[0], 'answer_id' => $correct->id]],
        ])->assertNotFound();
    }

    public function test_guest_cannot_submit_attempt(): void
    {
        ['quiz' => $quiz, 'correct_first' => $correct, 'questions' => $questions] = $this->makePublishedQuiz();

        $this->postJson("/api/quizzes/{$quiz->id}/attempts", [
            'answers' => [['question_id' => $questions[0], 'answer_id' => $correct->id]],
        ])->assertUnauthorized();
    }

    public function test_attempt_history_is_scoped_to_current_user(): void
    {
        ['quiz' => $quiz, 'correct_first' => $correct, 'questions' => $questions] = $this->makePublishedQuiz();

        $author = $this->makeUser();
        Sanctum::actingAs($author);
        $this->postJson("/api/quizzes/{$quiz->id}/attempts", [
            'answers' => [['question_id' => $questions[0], 'answer_id' => $correct->id]],
        ])->assertCreated();

        Sanctum::actingAs($this->makeUser(attributes: ['email' => 'autre@example.com']));
        $this->assertCount(0, $this->getJson("/api/quizzes/{$quiz->id}/attempts")->assertOk()->json('data'));
    }
}
