/**
 * The campus map: which buildings exist, what is inside them, and where they sit
 * on the plan.
 *
 * The map is a diagram, not a photograph — the plan is a two-row grid rather
 * than coordinates, because the only thing a visitor has to read off it is which
 * block is which and what they will find inside. `CAMPUS_ROWS` is that layout:
 * the three blocks along the top of the plan in the order they stand on the
 * street (B, C, D), and the main building on its own underneath.
 *
 * The icon belongs here with the block and not in the view: a visitor who cannot
 * read the letter from a distance recognises the cup or the car, so it carries
 * information rather than decorating the card.
 *
 * Every block also carries an **access notice**, and `CAMPUS_NOTICE` holds the
 * one that is true of the whole site. They are text, not a flag: "10 cm step at
 * the entrance" is something a visitor can plan around, while a symbol meaning
 * "partly accessible" is something they cannot. This is exactly the sort of
 * information the black-and-white rule is about — it is never signalled by an
 * amber card, only by the warning icon and the words next to it.
 *
 * Public API: CAMPUS_NOTICE, CAMPUS_BUILDINGS, CAMPUS_ROWS, buildingById(id)
 */
import { Car, Cpu, GraduationCap, Utensils } from 'lucide-react'

/** True of the whole site, so it is printed above the plan rather than in a card. */
export const CAMPUS_NOTICE =
  'No tactile guiding strips or adapted evacuation signals available on campus.'

export const CAMPUS_BUILDINGS = [
  {
    id: 'A',
    letter: 'A',
    name: 'Campus A',
    subtitle: 'Cafeteria',
    Icon: Utensils,
    description:
      'The heart of the campus. The cafeteria, the student info point and the library are here — the best place to grab lunch or ask a question about a study programme.',
    notice: 'Heavy doors, steep ramps, no Braille in the lifts.',
  },
  {
    id: 'B',
    letter: 'B',
    name: 'Campus B',
    subtitle: 'Lecture halls',
    Icon: GraduationCap,
    description:
      'Lecture halls and classrooms. Most of the Open Day talks and information sessions are given in this block.',
    notice: 'Stairs to the upper lecture halls, no hearing loop.',
  },
  {
    id: 'C',
    letter: 'C',
    name: 'Campus C',
    subtitle: 'New campus · FabLab',
    Icon: Cpu,
    description:
      'The newest building on the campus, home to the FabLab: 3D printers, laser cutters and the high-end computer labs where ideas turn into prototypes.',
    notice: 'Badge required, no gender-neutral toilets.',
  },
  {
    id: 'D',
    letter: 'D',
    name: 'Campus D',
    subtitle: 'Auto mechanics',
    Icon: Car,
    description:
      'The heavy-duty zone. This block houses the automotive workshops, with real engines, vehicle lifts and diagnostic equipment for hands-on engineering.',
    notice: '10 cm step at the entrance, no lift.',
  },
]

/** The plan itself: one array per row, top row first. */
export const CAMPUS_ROWS = [
  ['B', 'C', 'D'],
  ['A'],
]

export function buildingById(id) {
  return CAMPUS_BUILDINGS.find((building) => building.id === id) ?? null
}
