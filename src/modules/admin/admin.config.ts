import AdminJS from 'adminjs';
import { getAdminJSOptions, getAuth, getSessionOptions } from './admin.options';
import { INestApplication } from '@nestjs/common';
import { AbstractHttpAdapter, HttpAdapterHost } from '@nestjs/core';
import { getServiceAccessor, ServiceAccessor } from 'modules/admin/utils/service.accessor';
import express from 'express';
import path from 'path';
import expressSession from 'express-session';
import bodyParser from 'body-parser';
import { SessionRequestInterface } from 'modules/admin/interfaces/session-request.interface';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AdminJSExpress = require('@adminjs/express');

const getRouter = async (adminJS: AdminJS, serviceAccessor: ServiceAccessor): Promise<object> => {
  const predefinedRouter = express.Router();
  predefinedRouter.use(bodyParser.json());

  const auth = getAuth(serviceAccessor);
  const session = await getSessionOptions(serviceAccessor);

  predefinedRouter.use(expressSession(session));

  predefinedRouter.get(
    adminJS.options.loginPath.replace(adminJS.options.rootPath, ''),
    (req: SessionRequestInterface, res) => {
      if (req.session.adminUser) {
        return res.redirect(adminJS.options.rootPath);
      }
      return res.sendFile(path.join(__dirname, '..', '..', '..', 'public', 'login.html'));
    },
  );

  predefinedRouter.post(
    adminJS.options.loginPath.replace(adminJS.options.rootPath, ''),
    async (req: SessionRequestInterface, res) => {
      if (!req.body.email || !req.body.password)
        return res.status(400).json({
          message: adminJS.translateMessage('Email and/or password cannot be empty'),
        });

      const user = await auth.authenticate(req.body.email, req.body.password);
      if (!user)
        return res.status(401).json({
          message: adminJS.translateMessage('There are no users matching given credentials'),
        });

      req.session.adminUser = user;
      await req.session.save();

      return res.status(200).json(user);
    },
  );

  return AdminJSExpress.buildAuthenticatedRouter(adminJS, auth, predefinedRouter, {
    httpOnly: false,
    resave: true,
    saveUninitialized: true,
    ...session,
  });
};

const setUpAdminJS = async (app: INestApplication): Promise<void> => {
  const expressApp: AbstractHttpAdapter = app.get(HttpAdapterHost).httpAdapter;
  const serviceAccessor = getServiceAccessor(app);
  const adminJS = new AdminJS(getAdminJSOptions(serviceAccessor));
  const router = await getRouter(adminJS, serviceAccessor);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  expressApp.use(adminJS.options.rootPath, router);
};

export default setUpAdminJS;
