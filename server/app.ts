import express from 'express';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { PublicUser } from '../src/lib/models';
import type { Role } from '../src/lib/orderRules';
import type { Db } from './db';
import { HttpError } from './errors';
import * as admin from './services/admin';
import * as auth from './services/auth';
import * as orders from './services/orders';

const SESSION_COOKIE = 'wedlify_session';

function readSessionToken(req: Request): string | null {
  for (const part of (req.headers.cookie ?? '').split(';')) {
    const [name, ...value] = part.trim().split('=');

    if (name === SESSION_COOKIE) {
      return decodeURIComponent(value.join('='));
    }
  }

  return null;
}

function currentUser(res: Response): PublicUser {
  return res.locals.user as PublicUser;
}

function requireRole(role: Role): RequestHandler {
  return (_req, res, next) => {
    const user = res.locals.user as PublicUser | null;

    if (!user) {
      throw new HttpError(401, 'Silakan masuk terlebih dahulu.');
    }

    if (user.role !== role) {
      throw new HttpError(
        403,
        role === 'admin' ? 'Halaman ini hanya untuk admin.' : 'Halaman ini hanya untuk pelanggan.',
      );
    }

    next();
  };
}

const requireUser: RequestHandler = (_req, res, next) => {
  if (!res.locals.user) {
    throw new HttpError(401, 'Silakan masuk terlebih dahulu.');
  }

  next();
};

// `getDb` mengembalikan koneksi database. Koneksi dibuka satu kali lalu dipakai ulang.
export function createApp(getDb: () => Promise<Db>) {
  const app = express();
  const api = express.Router();
  const customer = requireRole('customer');
  const adminOnly = requireRole('admin');
  // Cookie hanya dikirim lewat HTTPS saat aplikasi berjalan di Vercel.
  const cookieOptions = { httpOnly: true, sameSite: 'lax', secure: process.env.VERCEL === '1', path: '/' } as const;

  // Menjalankan handler yang memakai database dan meneruskan kesalahannya ke penangan error.
  const handle =
    (handler: (db: Db, req: Request, res: Response) => Promise<unknown>): RequestHandler =>
    (req, res, next) => {
      getDb()
        .then((db) => handler(db, req, res))
        .catch(next);
    };

  api.use(express.json());
  api.use((req, res, next) => {
    getDb()
      .then((db) => auth.getSessionUser(db, readSessionToken(req)))
      .then((user) => {
        res.locals.user = user;
        next();
      })
      .catch(next);
  });

  // ---------- Autentikasi ----------
  api.post(
    '/auth/register',
    handle(async (db, req, res) => {
      res.status(201).json({ user: await auth.registerCustomer(db, req.body) });
    }),
  );

  api.post(
    '/auth/login',
    handle(async (db, req, res) => {
      const { user, token } = await auth.login(db, req.body);

      res.cookie(SESSION_COOKIE, token, { ...cookieOptions, maxAge: auth.SESSION_TTL_MS });
      res.json({ user });
    }),
  );

  api.post(
    '/auth/logout',
    handle(async (db, req, res) => {
      await auth.logout(db, readSessionToken(req));
      res.clearCookie(SESSION_COOKIE, cookieOptions);
      res.status(204).end();
    }),
  );

  api.get('/auth/me', (_req, res) => {
    res.json({ user: res.locals.user });
  });

  api.post(
    '/auth/forgot-password',
    handle(async (db, req, res) => {
      res.json({ simulatedEmail: await auth.requestPasswordReset(db, req.body) });
    }),
  );

  api.post(
    '/auth/reset-password',
    handle(async (db, req, res) => {
      await auth.resetPassword(db, req.body);
      res.clearCookie(SESSION_COOKIE, cookieOptions);
      res.status(204).end();
    }),
  );

  // ---------- Profil ----------
  api.patch(
    '/profile',
    requireUser,
    handle(async (db, req, res) => {
      res.json({ user: await auth.updateProfile(db, currentUser(res).id, req.body) });
    }),
  );

  api.post(
    '/profile/password',
    requireUser,
    handle(async (db, req, res) => {
      await auth.changePassword(db, currentUser(res).id, req.body);
      res.status(204).end();
    }),
  );

  // ---------- Pesanan pelanggan ----------
  // Hasil hitung yang tidak valid tetap dibalas 200 supaya ketikan promo yang
  // belum selesai tidak tercatat sebagai error di konsol browser.
  api.post(
    '/orders/quote',
    customer,
    handle(async (db, req, res) => {
      try {
        res.json({ price: await orders.quoteOrder(db, req.body) });
      } catch (error) {
        if (!(error instanceof HttpError) || error.status !== 422) {
          throw error;
        }

        res.json({ price: null, error: error.message, field: error.field });
      }
    }),
  );

  api.get(
    '/orders',
    customer,
    handle(async (db, _req, res) => {
      res.json({ orders: await orders.listOrders(db, currentUser(res).id) });
    }),
  );

  api.post(
    '/orders',
    customer,
    handle(async (db, req, res) => {
      res.status(201).json({ order: await orders.createOrder(db, currentUser(res).id, req.body) });
    }),
  );

  api.get(
    '/orders/:code',
    customer,
    handle(async (db, req, res) => {
      res.json({ order: await orders.getOrder(db, currentUser(res).id, req.params.code) });
    }),
  );

  api.put(
    '/orders/:code',
    customer,
    handle(async (db, req, res) => {
      res.json({ order: await orders.updateOrder(db, currentUser(res).id, req.params.code, req.body) });
    }),
  );

  api.post(
    '/orders/:code/payment',
    customer,
    handle(async (db, req, res) => {
      res.json({ order: await orders.confirmPayment(db, currentUser(res).id, req.params.code, req.body) });
    }),
  );

  api.post(
    '/orders/:code/cancel',
    customer,
    handle(async (db, req, res) => {
      res.json({ order: await orders.cancelOrder(db, currentUser(res).id, req.params.code) });
    }),
  );

  api.delete(
    '/orders/:code',
    customer,
    handle(async (db, req, res) => {
      await orders.deleteOrder(db, currentUser(res).id, req.params.code);
      res.status(204).end();
    }),
  );

  // ---------- Admin ----------
  api.get(
    '/admin/summary',
    adminOnly,
    handle(async (db, _req, res) => {
      res.json({ summary: await admin.getSummary(db) });
    }),
  );

  api.get(
    '/admin/orders',
    adminOnly,
    handle(async (db, _req, res) => {
      res.json({ orders: await admin.listAllOrders(db) });
    }),
  );

  api.get(
    '/admin/orders/:code',
    adminOnly,
    handle(async (db, req, res) => {
      res.json({ order: await admin.getAnyOrder(db, req.params.code) });
    }),
  );

  api.post(
    '/admin/orders/:code/approve',
    adminOnly,
    handle(async (db, req, res) => {
      res.json({ order: await admin.approvePayment(db, req.params.code) });
    }),
  );

  api.post(
    '/admin/orders/:code/reject',
    adminOnly,
    handle(async (db, req, res) => {
      res.json({ order: await admin.rejectPayment(db, req.params.code, req.body) });
    }),
  );

  api.post(
    '/admin/orders/:code/complete',
    adminOnly,
    handle(async (db, req, res) => {
      res.json({ order: await admin.completeOrder(db, req.params.code) });
    }),
  );

  api.get(
    '/admin/customers',
    adminOnly,
    handle(async (db, _req, res) => {
      res.json({ customers: await admin.listCustomers(db) });
    }),
  );

  api.patch(
    '/admin/customers/:id',
    adminOnly,
    handle(async (db, req, res) => {
      res.json({ customer: await admin.setCustomerActive(db, Number(req.params.id), req.body) });
    }),
  );

  api.get(
    '/admin/promos',
    adminOnly,
    handle(async (db, _req, res) => {
      res.json({ promos: await admin.listPromos(db) });
    }),
  );

  api.post(
    '/admin/promos',
    adminOnly,
    handle(async (db, req, res) => {
      res.status(201).json({ promo: await admin.createPromo(db, req.body) });
    }),
  );

  api.put(
    '/admin/promos/:id',
    adminOnly,
    handle(async (db, req, res) => {
      res.json({ promo: await admin.updatePromo(db, Number(req.params.id), req.body) });
    }),
  );

  api.delete(
    '/admin/promos/:id',
    adminOnly,
    handle(async (db, req, res) => {
      await admin.deletePromo(db, Number(req.params.id));
      res.status(204).end();
    }),
  );

  api.use(() => {
    throw new HttpError(404, 'Endpoint tidak ditemukan.');
  });

  api.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof HttpError) {
      res.status(error.status).json({ error: error.message, field: error.field });
      return;
    }

    if (error instanceof SyntaxError) {
      res.status(400).json({ error: 'Format JSON tidak valid.' });
      return;
    }

    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  });

  app.use('/api', api);
  return app;
}
