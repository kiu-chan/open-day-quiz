// The Open Day quiz about KdG itself. Same shape as any quiz saved by the admin
// page, so it can be edited there like the rest.
export const KDG_QUIZ = {
  id: 'quiz-kdg',
  title: 'About KdG',
  questions: [
    {
      id: 'q-kdg-name',
      prompt: 'What does KdG stand for?',
      options: [
        'Koninklijke Digital Group',
        'Karel de Grote University of Applied Sciences and Arts',
        'Knowledge Development Group',
        'King of Digital Games',
      ],
      correctIndex: 1,
      durationSeconds: 20,
    },
    {
      id: 'q-kdg-city',
      prompt: 'In which city is KdG located?',
      options: ['Brussels', 'Antwerp', 'Ghent', 'Leuven'],
      correctIndex: 1,
      durationSeconds: 20,
    },
    {
      id: 'q-kdg-color',
      prompt: "What color is most associated with KdG's branding?",
      options: ['Blue', 'Green', 'Black', 'Yellow'],
      correctIndex: 2,
      durationSeconds: 20,
    },
    {
      id: 'q-kdg-institution',
      prompt: 'What type of institution is KdG?',
      options: [
        'Medical school',
        'Language school',
        'University of Applied Sciences and Arts',
        'High school',
      ],
      correctIndex: 2,
      durationSeconds: 20,
    },
    {
      id: 'q-kdg-faculty',
      prompt: 'Which of these is a faculty at KdG?',
      options: [
        'Space Engineering',
        'Marine Biology',
        'Business & Management',
        'Archaeology',
      ],
      correctIndex: 2,
      durationSeconds: 20,
    },
    {
      id: 'q-kdg-studying',
      prompt: 'What is an important part of studying at KdG?',
      options: [
        'No group work',
        'Only online exams',
        'Practical projects and internships',
        'No presentations',
      ],
      correctIndex: 2,
      durationSeconds: 20,
    },
    {
      id: 'q-kdg-platform',
      prompt: 'How do many students access their courses and materials at KdG?',
      options: ['Module', 'Instagram', 'Canvas', 'Strobbo'],
      correctIndex: 2,
      durationSeconds: 20,
    },
    {
      id: 'q-kdg-language',
      prompt: 'What is the main language of most KdG programmes?',
      options: ['Dutch', 'French', 'German', 'Spanish'],
      correctIndex: 0,
      durationSeconds: 20,
    },
    {
      id: 'q-kdg-known-for',
      prompt: 'What is KdG known for?',
      options: [
        'Only theoretical education',
        'Practice-oriented learning',
        'Military training',
        'Aviation only',
      ],
      correctIndex: 1,
      durationSeconds: 20,
    },
    {
      id: 'q-kdg-bring',
      prompt: 'What should you bring to most classes at KdG?',
      options: [
        'Sports equipment',
        'Laboratory coat every day',
        'A laptop',
        'A calculator only',
      ],
      correctIndex: 2,
      durationSeconds: 20,
    },
  ],
}
