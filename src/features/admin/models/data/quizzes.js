// Quizzes seeded on first launch so there is something to play right away.
// Anything written afterwards in the admin page lives in localStorage; edit
// these files only to change what a fresh browser starts with.
import { KDG_QUIZ } from './kdgQuiz.js'

export const QUIZ_DATA = [
  KDG_QUIZ,
  {
    id: 'quiz-sample',
    title: 'Sample quiz',
    questions: [
      {
        id: 'q-open-day',
        prompt: 'What is the university Open Day for?',
        options: [
          'Touring the campus and exploring degree programmes',
          'Sitting the official entrance exam',
          'Paying tuition fees',
          'Collecting your graduation certificate',
        ],
        correctIndex: 0,
        durationSeconds: 20,
      },
      {
        id: 'q-fablab',
        prompt: 'What kind of space is a FabLab?',
        options: [
          'A fabrication workshop where you build your own prototypes',
          'A library of printed books',
          'The board of directors meeting room',
          'A sports stadium',
        ],
        correctIndex: 0,
        durationSeconds: 20,
      },
      {
        id: 'q-3d-print',
        prompt: 'How does a 3D printer create an object?',
        options: [
          'By depositing material layer by layer',
          'By cutting it out of a solid block',
          'By casting it in a metal mould',
          'By blowing molten glass',
        ],
        correctIndex: 0,
        durationSeconds: 20,
      },
      {
        id: 'q-qr',
        prompt: 'How does a QR code differ from an ordinary barcode?',
        options: [
          'It stores data in two directions, so it holds much more',
          'It can only be read by specialised scanners',
          'It cannot store text, only numbers',
          'It has to be printed in colour to be scannable',
        ],
        correctIndex: 0,
        durationSeconds: 20,
      },
      {
        id: 'q-robot',
        prompt: 'What is an ultrasonic sensor on a robot used for?',
        options: [
          'Measuring the distance to an obstacle',
          'Measuring the motor temperature',
          'Playing music',
          'Charging the battery',
        ],
        correctIndex: 0,
        durationSeconds: 15,
      },
    ],
  },
]
