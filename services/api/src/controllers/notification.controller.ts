import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';

/**
 * GET /api/notifications
 * Fetch notifications tailored to user role / id
 */
export const getNotificationsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const role = (req.query.role as string) || (req.headers['x-user-role'] as string);
    const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string);
    const filter = req.query.filter as 'all' | 'unread' | 'high' | undefined;

    const result = NotificationService.getNotifications(role, userId, filter);

    res.json({
      success: true,
      data: result.notifications,
      unreadCount: result.unreadCount,
      totalCount: result.notifications.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, error: 'Internal server error while fetching notifications.' });
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read
 */
export const markNotificationReadHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, error: 'Notification ID is required.' });
      return;
    }

    const updated = NotificationService.markAsRead(id);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Notification not found.' });
      return;
    }

    res.json({ success: true, notification: updated });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, error: 'Failed to update notification state.' });
  }
};

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for current user / role
 */
export const markAllNotificationsReadHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const role = (req.body.role as string) || (req.query.role as string);
    const userId = (req.body.userId as string) || (req.query.userId as string);

    const count = NotificationService.markAllAsRead(role, userId);

    res.json({
      success: true,
      message: `Marked ${count} notifications as read.`,
      unreadCount: 0,
    });
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, error: 'Failed to mark all as read.' });
  }
};

/**
 * DELETE /api/notifications/:id
 * Dismiss or delete a notification
 */
export const deleteNotificationHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = NotificationService.deleteNotification(id);

    if (!deleted) {
      res.status(404).json({ success: false, error: 'Notification not found.' });
      return;
    }

    res.json({ success: true, message: 'Notification dismissed successfully.' });
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, error: 'Failed to delete notification.' });
  }
};

/**
 * POST /api/notifications/send
 * Trigger and broadcast a new notification
 */
export const sendNotificationHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, message, type, priority, role, userId, actionTab, metadata } = req.body;

    if (!title || !message) {
      res.status(400).json({ success: false, error: 'Title and message are required.' });
      return;
    }

    const created = NotificationService.dispatchNotification({
      title,
      message,
      type: type || 'SYSTEM',
      priority: priority || 'NORMAL',
      role,
      userId,
      actionTab,
      metadata,
    });

    // Broadcast through socket.io if available
    const io = req.app.get('io');
    if (io) {
      io.emit('notification:new', created);
      if (role) {
        io.to(`role:${role.toUpperCase()}`).emit('notification:new', created);
      }
    }

    res.status(201).json({ success: true, notification: created });
  } catch (error: any) {
    console.error('Error dispatching notification:', error);
    res.status(500).json({ success: false, error: 'Failed to dispatch notification.' });
  }
};
