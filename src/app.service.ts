import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    const quotes = [
      // Hackers
      "Mess with the best, die like the rest.",
      "Hack the Planet!",
      "Never fear, I is here.",
      "Never send a boy to do a woman's job.",
      // The Matrix
      "The Fight for the Future Begins.",
      "Reality is a thing of the past.",
      "Unfortunately, no one can be told what the Matrix is. You have to see it for yourself.",
      "There is no spoon.",
      "Follow the white rabbit.",
      "In a world of 1s and 0s... are you a zero, or The One?"
    ]
    return quotes[Math.floor(Math.random()*quotes.length)];
  }
}
