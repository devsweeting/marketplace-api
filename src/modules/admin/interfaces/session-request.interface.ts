import express from 'express';
import expressSession from 'express-session';

export interface SessionRequestInterface extends express.Request {
  session: expressSession;
}
