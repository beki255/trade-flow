import { Router } from 'express';
import {
  getNotificationsHandler,
  markNotificationReadHandler,
  markAllNotificationsReadHandler,
  deleteNotificationHandler,
  sendNotificationHandler,
} from '../controllers/notification.controller';

const router = Router();

// GET /api/notifications
router.get('/', getNotificationsHandler);

// PATCH /api/notifications/read-all
router.patch('/read-all', markAllNotificationsReadHandler);

// PATCH /api/notifications/:id/read
router.patch('/:id/read', markNotificationReadHandler);

// DELETE /api/notifications/:id
router.delete('/:id', deleteNotificationHandler);

// POST /api/notifications/send
router.post('/send', sendNotificationHandler);

export default router;
