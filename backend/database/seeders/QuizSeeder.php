<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Answer;
use App\Models\Filiere;
use App\Models\Module;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Database\Seeder;

class QuizSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedQuiz('DD', '1A', 'M102', [
            'title' => 'Quiz — Acquérir les bases de l\'algorithmique',
            'description' => 'Évaluez vos connaissances sur la logique algorithmique : variables, conditions, boucles et fonctions.',
            'duration_minutes' => 15,
            'passing_score' => 50,
            'questions' => [
                [
                    'type' => 'qcm',
                    'text' => 'Quelle structure permet de répéter un bloc d\'instructions plusieurs fois ?',
                    'explanation' => 'Les boucles (for, while, Tant que) répètent un bloc tant qu\'une condition est respectée.',
                    'answers' => [
                        ['Une boucle', true],
                        ['Une condition', false],
                        ['Une fonction', false],
                        ['Une constante', false],
                    ],
                ],
                [
                    'type' => 'true_false',
                    'text' => 'Un algorithme doit obligatoirement être écrit en langage machine pour pouvoir être exécuté.',
                    'explanation' => 'Un algorithme est une description indépendante du langage : il est ensuite traduit en code puis exécuté.',
                    'answers' => [['Vrai', false], ['Faux', true]],
                ],
                [
                    'type' => 'qcm',
                    'text' => 'Que fait l\'instruction « x = 5 » en pseudocode ?',
                    'explanation' => 'C\'est une affectation : la valeur 5 est rangée dans la variable x.',
                    'answers' => [
                        ['Elle range la valeur 5 dans la variable x', true],
                        ['Elle compare x et 5', false],
                        ['Elle affiche la valeur 5', false],
                        ['Elle incrémente x de 5', false],
                    ],
                ],
                [
                    'type' => 'qcm',
                    'text' => 'Quel type de données utiliser pour stocker la valeur vrai/faux ?',
                    'explanation' => 'Le type booléen ne prend que deux valeurs : vrai ou faux.',
                    'answers' => [
                        ['Le type booléen', true],
                        ['Le type entier', false],
                        ['Le type chaîne de caractères', false],
                        ['Le type réel', false],
                    ],
                ],
                [
                    'type' => 'true_false',
                    'text' => 'Une fonction peut être appelée plusieurs fois dans un même programme.',
                    'explanation' => 'C\'est justement l\'intérêt d\'une fonction : écrire une fois, réutiliser autant que nécessaire.',
                    'answers' => [['Vrai', true], ['Faux', false]],
                ],
                [
                    'type' => 'qcm',
                    'text' => 'Combien d\'éléments contient un tableau dont les indices vont de 0 à 9 ?',
                    'explanation' => 'L\'indice commence à 0 : de 0 à 9, le tableau contient 10 éléments.',
                    'answers' => [
                        ['10 éléments', true],
                        ['9 éléments', false],
                        ['11 éléments', false],
                        ['1 élément', false],
                    ],
                ],
                [
                    'type' => 'qcm',
                    'text' => 'Quelle structure exécute un bloc uniquement si une condition est vraie ?',
                    'explanation' => 'L\'instruction conditionnelle (si… sinon) permet de choisir entre deux blocs.',
                    'answers' => [
                        ['L\'instruction conditionnelle (si… sinon)', true],
                        ['La boucle for', false],
                        ['La boucle tant que', false],
                        ['La déclaration de variable', false],
                    ],
                ],
                [
                    'type' => 'true_false',
                    'text' => 'En pseudocode, l\'instruction « Tant que » représente une boucle conditionnelle.',
                    'explanation' => '« Tant que » répète le bloc tant que la condition reste vraie.',
                    'answers' => [['Vrai', true], ['Faux', false]],
                ],
            ],
        ]);

        $this->seedQuiz('DD', '1A', 'M107', [
            'title' => 'Quiz — Développer des sites web dynamiques',
            'description' => 'Vérifiez vos acquis sur le fonctionnement des pages dynamiques côté serveur, les formulaires et la sécurité.',
            'duration_minutes' => 12,
            'passing_score' => 60,
            'questions' => [
                [
                    'type' => 'qcm',
                    'text' => 'Où s\'exécute le code PHP d\'une page web ?',
                    'explanation' => 'PHP est un langage côté serveur : le navigateur ne reçoit que le HTML généré.',
                    'answers' => [
                        ['Sur le serveur', true],
                        ['Dans le navigateur du visiteur', false],
                        ['Dans la base de données', false],
                        ['Dans le routeur', false],
                    ],
                ],
                [
                    'type' => 'true_false',
                    'text' => 'Les sessions permettent de conserver des informations entre plusieurs requêtes d\'un même utilisateur.',
                    'explanation' => 'La session est liée à l\'utilisateur grâce à un identifiant conservé côté navigateur.',
                    'answers' => [['Vrai', true], ['Faux', false]],
                ],
                [
                    'type' => 'qcm',
                    'text' => 'Quelle méthode HTTP est recommandée pour envoyer un formulaire de connexion ?',
                    'explanation' => 'POST transmet les données dans le corps de la requête, contrairement à GET qui les expose dans l\'URL.',
                    'answers' => [
                        ['POST', true],
                        ['GET', false],
                        ['HEAD', false],
                        ['OPTIONS', false],
                    ],
                ],
                [
                    'type' => 'qcm',
                    'text' => 'Quel mécanisme permet de se protéger des injections SQL ?',
                    'explanation' => 'Les requêtes préparées séparent la requête des données : la valeur reçue ne peut pas modifier la requête.',
                    'answers' => [
                        ['Les requêtes préparées (requêtes paramétrées)', true],
                        ['La concaténation directe des variables dans la requête', false],
                        ['La désactivation de l\'affichage des erreurs', false],
                        ['Le passage par la méthode GET', false],
                    ],
                ],
                [
                    'type' => 'true_false',
                    'text' => 'Le HTML généré par PHP est interprété par le navigateur du visiteur.',
                    'explanation' => 'Le serveur exécute PHP puis renvoie du HTML que le navigateur affiche.',
                    'answers' => [['Vrai', true], ['Faux', false]],
                ],
                [
                    'type' => 'qcm',
                    'text' => 'Que fait la fonction isset() en PHP ?',
                    'explanation' => 'isset() vérifie qu\'une variable existe et que sa valeur n\'est pas nulle.',
                    'answers' => [
                        ['Elle vérifie qu\'une variable existe et n\'est pas nulle', true],
                        ['Elle supprime une variable', false],
                        ['Elle affiche le contenu d\'une variable', false],
                        ['Elle compare deux variables', false],
                    ],
                ],
                [
                    'type' => 'true_false',
                    'text' => 'Un formulaire HTML doit préciser une action et une méthode pour envoyer ses données au serveur.',
                    'explanation' => 'Les attributs action (destination) et method (GET ou POST) définissent l\'envoi du formulaire.',
                    'answers' => [['Vrai', true], ['Faux', false]],
                ],
            ],
        ]);

        $this->seedQuiz('ID', '1A', 'M103', [
            'title' => 'Quiz — Concevoir un réseau informatique',
            'description' => 'Testez vos connaissances sur les équipements réseau, l\'adressage IP et les services essentiels.',
            'duration_minutes' => 18,
            'passing_score' => 50,
            'questions' => [
                [
                    'type' => 'qcm',
                    'text' => 'Quel équipement relie plusieurs réseaux entre eux ?',
                    'explanation' => 'Le routeur interconnecte des réseaux différents et achemine les paquets entre eux.',
                    'answers' => [
                        ['Le routeur', true],
                        ['Le commutateur (switch)', false],
                        ['Le concentrateur (hub)', false],
                        ['Le répéteur', false],
                    ],
                ],
                [
                    'type' => 'qcm',
                    'text' => 'Que représente l\'adresse 192.168.1.10 ?',
                    'explanation' => 'La plage 192.168.0.0/16 fait partie des adresses IPv4 privées.',
                    'answers' => [
                        ['Une adresse IPv4 privée', true],
                        ['Une adresse IPv6', false],
                        ['Une adresse MAC', false],
                        ['Un nom de domaine', false],
                    ],
                ],
                [
                    'type' => 'true_false',
                    'text' => 'Le masque de sous-réseau permet de distinguer la partie réseau et la partie hôte d\'une adresse IP.',
                    'explanation' => 'Le masque indique quels bits identifient le réseau et quels bits identifient la machine.',
                    'answers' => [['Vrai', true], ['Faux', false]],
                ],
                [
                    'type' => 'qcm',
                    'text' => 'Quel protocole attribue automatiquement les adresses IP aux machines ?',
                    'explanation' => 'DHCP attribue dynamiquement une adresse IP, un masque, une passerelle et des serveurs DNS.',
                    'answers' => [
                        ['DHCP', true],
                        ['DNS', false],
                        ['HTTP', false],
                        ['SSH', false],
                    ],
                ],
                [
                    'type' => 'qcm',
                    'text' => 'À quoi sert le service DNS ?',
                    'explanation' => 'Le DNS traduit les noms de domaine (ex. ofppt.info) en adresses IP.',
                    'answers' => [
                        ['À traduire les noms de domaine en adresses IP', true],
                        ['À attribuer les adresses IP', false],
                        ['À chiffrer les communications', false],
                        ['À partager des fichiers', false],
                    ],
                ],
                [
                    'type' => 'true_false',
                    'text' => 'Le switch fonctionne principalement au niveau 2 du modèle OSI.',
                    'explanation' => 'Le switch commute les trames en se basant sur les adresses MAC (couche liaison de données).',
                    'answers' => [['Vrai', true], ['Faux', false]],
                ],
                [
                    'type' => 'qcm',
                    'text' => 'Combien d\'adresses IP utilisables offre un réseau en /24 (hors adresse réseau et diffusion) ?',
                    'explanation' => 'Un /24 contient 256 adresses ; on retire l\'adresse réseau et l\'adresse de diffusion : 254 utilisables.',
                    'answers' => [
                        ['254 adresses', true],
                        ['256 adresses', false],
                        ['255 adresses', false],
                        ['128 adresses', false],
                    ],
                ],
            ],
        ]);

        $this->seedAttempts();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function seedQuiz(string $filiereCode, string $anneeCode, string $moduleCode, array $data): void
    {
        $filiere = Filiere::where('code', $filiereCode)->first();

        if (! $filiere) {
            return;
        }

        $module = Module::query()
            ->where('code', $moduleCode)
            ->whereHas('anneeFormation', fn ($query) => $query
                ->where('code', $anneeCode)
                ->where('filiere_id', $filiere->id))
            ->first();

        $quiz = Quiz::updateOrCreate(
            ['title' => $data['title']],
            [
                'module_id' => $module?->id,
                'filiere_id' => $filiere->id,
                'description' => $data['description'],
                'duration_minutes' => $data['duration_minutes'],
                'passing_score' => $data['passing_score'],
                'is_published' => true,
            ],
        );

        if ($quiz->questions()->exists()) {
            return;
        }

        foreach ($data['questions'] as $position => $questionData) {
            $question = Question::create([
                'quiz_id' => $quiz->id,
                'type' => $questionData['type'],
                'text' => $questionData['text'],
                'explanation' => $questionData['explanation'],
                'position' => $position + 1,
            ]);

            foreach ($questionData['answers'] as $answerPosition => [$text, $isCorrect]) {
                Answer::create([
                    'question_id' => $question->id,
                    'text' => $text,
                    'is_correct' => $isCorrect,
                    'position' => $answerPosition + 1,
                ]);
            }
        }
    }

    private function seedAttempts(): void
    {
        $students = User::where('role', UserRole::Student)->where('is_active', true)->get();

        if ($students->isEmpty()) {
            return;
        }

        $quizzes = Quiz::with(['questions.answers'])->where('is_published', true)->get();

        foreach ($quizzes as $quiz) {
            if ($quiz->questions->isEmpty()) {
                continue;
            }

            $attemptStudents = $students->random(min($students->count(), rand(3, 6)));

            $salma = $students->firstWhere('email', 'etudiant@digital-academy.ma');
            if ($salma && ! $attemptStudents->contains('id', $salma->id)) {
                $attemptStudents = $attemptStudents->push($salma);
            }

            foreach ($attemptStudents as $index => $student) {
                $successRate = $index % 4 === 0 ? 0.5 : 0.78;
                $details = [];
                $correctCount = 0;

                foreach ($quiz->questions as $question) {
                    $correctAnswer = $question->answers->firstWhere('is_correct', true);
                    $wrongAnswers = $question->answers->where('is_correct', false);

                    $useCorrect = $correctAnswer && (mt_rand() / mt_getrandmax()) < $successRate;
                    $answer = $useCorrect ? $correctAnswer : ($wrongAnswers->random() ?? $correctAnswer);

                    if (! $answer) {
                        continue;
                    }

                    $isCorrect = (bool) $answer->is_correct;
                    $correctCount += $isCorrect ? 1 : 0;

                    $details[] = [
                        'question_id' => $question->id,
                        'answer_id' => $answer->id,
                        'is_correct' => $isCorrect,
                    ];
                }

                $total = $quiz->questions->count();
                $completedAt = now()->subDays(rand(1, 21))->subMinutes(rand(0, 900));

                $attempt = new QuizAttempt([
                    'quiz_id' => $quiz->id,
                    'user_id' => $student->id,
                    'score' => $total > 0 ? (int) round($correctCount / $total * 100) : 0,
                    'correct_count' => $correctCount,
                    'total_questions' => $total,
                    'duration_seconds' => rand(120, max(240, ($quiz->duration_minutes ?? 15) * 55)),
                    'details' => $details,
                    'completed_at' => $completedAt,
                ]);
                $attempt->created_at = $completedAt;
                $attempt->updated_at = $completedAt;
                $attempt->save();
            }
        }
    }
}
