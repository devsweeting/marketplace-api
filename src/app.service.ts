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
  // Eddy Van Halen
  'Rock stars come and go. Musicians play until they die.',
  'To hell with the rules. If it sounds right, then it is.',
  "Bass is for people who can't play guitar.",
  // David Lee Roth
  "It doesn't get better, it doesn't get worse, but it sure gets different!",
  // Van Halen
  "You gotta roll with the punches to get to what's real",
];

@Injectable()
export class AppService {
  getHello(): string {
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
}
