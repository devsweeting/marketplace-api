import { Injectable } from '@nestjs/common';

export const quotes = [
  // Hackers
  'Mess with the best, die like the rest.',
  'Hack the Planet!',
  'Never fear, I is here.',
  "Never send a boy to do a woman's job.",
  // The Matrix
  'The Fight for the Future Begins.',
  'Reality is a thing of the past.',
  'Unfortunately, no one can be told what the Matrix is. You have to see it for yourself.',
  'There is no spoon.',
  'Follow the white rabbit.',
  'In a world of 1s and 0s... are you a zero, or The One?',
];

@Injectable()
export class AppService {
  getHello(): string {
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
}
