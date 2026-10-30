export type NotificationType =
  | 'BID'
  | 'SHIPMENT'
  | 'CUSTOMS'
  | 'PAYMENT'
  | 'SECURITY'
  | 'VERIFICATION'
  | 'SYSTEM';

export type NotificationPriority = 'URGENT' | 'HIGH' | 'NORMAL';

export interface InAppNotification {
  id: string;
  userId?: string;
  role?: string; // 'SHIPPER' | 'TRANSPORTER' | 'DRIVER' | 'FREIGHT_FORWARDER' | 'CUSTOMS_OFFICER' | 'ADMIN'
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  read: boolean;
  createdAt: string;
  actionTab?: string;
  metadata?: Record<string, any>;
}

// Initial Notification Records populated with active consignment activities
let notificationsStore: InAppNotification[] = [
  {
    id: 'notif-customs-init-1',
    role: 'CUSTOMS',
    title: '📋 New Customs Dossier Submitted for Review',
    message: 'eyob plc formally submitted complete 4/4 customs dossier for "Specialty Export Yirgacheffe Coffee Beans" (35 Tons). Consistency validation passed. Ready for single-window inspection.',
    type: 'CUSTOMS',
    priority: 'HIGH',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    actionTab: 'compliance',
    metadata: {
      shipmentId: '30d2a3a6-5fce-4b0f-8c40-ed88cc822afe',
      cargoTitle: 'Specialty Export Yirgacheffe Coffee Beans',
      weightTons: 35,
    },
  },
  {
    id: 'notif-customs-init-2',
    role: 'CUSTOMS',
    title: '📎 Customs Document Uploaded: Commercial Invoice',
    message: 'eyob plc attached Commercial Invoice (ECC-CI-2026-9041) for consignment "Specialty Export Yirgacheffe Coffee Beans".',
    type: 'CUSTOMS',
    priority: 'NORMAL',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    actionTab: 'compliance',
    metadata: {
      docType: 'COMMERCIAL_INVOICE',
      docNumber: 'ECC-CI-2026-9041',
    },
  },
];

export class NotificationService {
  /**
   * Fetch all notifications filtered by user ID or role
   */
  static getNotifications(role?: string, userId?: string, filter?: 'all' | 'unread' | 'high'): {
    notifications: InAppNotification[];
    unreadCount: number;
  } {
    let list = [...notificationsStore];

    // Filter by role or user
    if (role) {
      const normalizedRole = role.toUpperCase();
      list = list.filter((n) => {
        if (n.userId && userId && n.userId === userId) return true;
        if (!n.role) return true;
        const targetRole = n.role.toUpperCase();
        if (normalizedRole === 'ADMIN' && targetRole === 'ADMIN') return true;
        if (normalizedRole === 'SHIPPER' && targetRole === 'SHIPPER') return true;
        if (
          (normalizedRole === 'FORWARDER' || normalizedRole === 'FREIGHT_FORWARDER') &&
          (targetRole === 'FORWARDER' || targetRole === 'FREIGHT_FORWARDER')
        )
          return true;
        if (
          (normalizedRole === 'CUSTOMS' || normalizedRole === 'CUSTOMS_OFFICER') &&
          (targetRole === 'CUSTOMS' || targetRole === 'CUSTOMS_OFFICER')
        )
          return true;
        if (
          (normalizedRole === 'TRANSPORTER' || normalizedRole === 'DRIVER') &&
          (targetRole === 'TRANSPORTER' || targetRole === 'DRIVER')
        )
          return true;
        return false;
      });
    }

    // Sort by latest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unreadCount = list.filter((n) => !n.read).length;

    // Apply subfilter if specified
    if (filter === 'unread') {
      list = list.filter((n) => !n.read);
    } else if (filter === 'high') {
      list = list.filter((n) => n.priority === 'URGENT' || n.priority === 'HIGH');
    }

    return {
      notifications: list,
      unreadCount,
    };
  }

  /**
   * Mark a single notification as read
   */
  static markAsRead(id: string): InAppNotification | null {
    const item = notificationsStore.find((n) => n.id === id);
    if (item) {
      item.read = true;
      return item;
    }
    return null;
  }

  /**
   * Mark all notifications as read for a given role or user
   */
  static markAllAsRead(role?: string, userId?: string): number {
    let count = 0;
    const normalizedRole = role ? role.toUpperCase() : undefined;

    notificationsStore.forEach((n) => {
      let matches = true;
      if (normalizedRole) {
        const targetRole = n.role ? n.role.toUpperCase() : '';
        matches =
          targetRole === normalizedRole ||
          (normalizedRole === 'CUSTOMS' && targetRole === 'CUSTOMS_OFFICER') ||
          (normalizedRole === 'FORWARDER' && targetRole === 'FREIGHT_FORWARDER') ||
          (normalizedRole === 'TRANSPORTER' && (targetRole === 'TRANSPORTER' || targetRole === 'DRIVER'));
      }
      if (matches && !n.read) {
        n.read = true;
        count++;
      }
    });

    return count;
  }

  /**
   * Dismiss/Delete a notification
   */
  static deleteNotification(id: string): boolean {
    const initialLen = notificationsStore.length;
    notificationsStore = notificationsStore.filter((n) => n.id !== id);
    return notificationsStore.length < initialLen;
  }

  /**
   * Trigger and broadcast a new real-time notification
   */
  static dispatchNotification(
    notif: Omit<InAppNotification, 'id' | 'createdAt' | 'read'> & {
      id?: string;
      createdAt?: string;
    }
  ): InAppNotification {
    const newNotif: InAppNotification = {
      id: notif.id || `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: notif.createdAt || new Date().toISOString(),
      read: false,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      priority: notif.priority || 'NORMAL',
      role: notif.role,
      userId: notif.userId,
      actionTab: notif.actionTab,
      metadata: notif.metadata,
    };

    notificationsStore.unshift(newNotif);
    // Keep max 200 notifications in memory
    if (notificationsStore.length > 200) {
      notificationsStore = notificationsStore.slice(0, 200);
    }

    return newNotif;
  }
}
