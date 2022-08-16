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
import { v4 } from 'uuid';
import fs from 'fs';
import { ethers } from 'ethers';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AdminJSExpress = require('@adminjs/express');

const getRouter = async (adminJS: AdminJS, serviceAccessor: ServiceAccessor): Promise<object> => {
  const predefinedRouter = express.Router();
  predefinedRouter.use(bodyParser.json());

  const auth = getAuth(serviceAccessor);
  const session = await getSessionOptions(serviceAccessor);

  const loginPath = adminJS.options.loginPath.replace(adminJS.options.rootPath, '');

  predefinedRouter.use(expressSession(session));

  predefinedRouter.get(loginPath, (req: SessionRequestInterface, res) => {
    if (req.session.adminUser) {
      return res.redirect(adminJS.options.rootPath);
    }
    req.session.nonce = v4();
    const file = path.join(__dirname, '..', '..', '..', 'public', 'login.html');
    return res.send(fs.readFileSync(file).toString().replace('__NONCE__', req.session.nonce));
  });

  // Disabling here because this is not in the critical path, and will be removed in the future.
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  predefinedRouter.post(loginPath, async (req: SessionRequestInterface, res) => {
    if (!req.body.message || !req.body.address || !req.body.signed)
      return res.status(400).json({
        message: adminJS.translateMessage('Invalid credentials'),
      });

    if (!req.session?.nonce || !req.body.message.includes(req.session.nonce)) {
      return res.status(401).json({
        message: adminJS.translateMessage('Invalid nonce'),
      });
    }

    const address = ethers.utils.verifyMessage(req.body.message, req.body.signed);
    if (address.toLowerCase() !== req.body.address.toLowerCase()) {
      return res.status(401).json({
        message: adminJS.translateMessage('Invalid signature'),
      });
    }

    const user = await auth.authenticate(address);
    if (!user)
      return res.status(401).json({
        message: adminJS.translateMessage('There are no users matching given address'),
      });

    req.session.adminUser = user;
    await req.session.save();

    return res.status(200).json(user);
  });

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
