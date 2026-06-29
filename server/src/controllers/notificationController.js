import Notification from '../../models/Notification.js';
import logger from '../utils/logger.js';

// @desc    Get all notifications for the authenticated user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();
    const { type, read, limit = 50, page = 1 } = req.query;

    const query = { userEmail };
    if (type) query.type = type;
    if (read !== undefined) query.read = read === 'true';

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userEmail, read: false });

    res.status(200).json({
      success: true,
      message: 'Notifications retrieved.',
      data: {
        notifications,
        unreadCount,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total,
          totalPages: Math.ceil(total / parseInt(limit, 10))
        }
      },
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all unread notifications as read
// @route   PATCH /api/notifications/read
// @access  Private
export const markAllAsRead = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();

    const result = await Notification.updateMany(
      { userEmail, read: false },
      { $set: { read: true } }
    );

    logger.debug(`[NOTIF] Marked ${result.modifiedCount} notifications as read for ${userEmail}`);

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notification(s) marked as read.`,
      data: { modifiedCount: result.modifiedCount },
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markOneAsRead = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { id, userEmail },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.',
        data: null,
        errors: [{ message: 'Notification ID does not exist.' }]
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: notification,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a specific notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();
    const { id } = req.params;

    const deleted = await Notification.findOneAndDelete({ id, userEmail });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.',
        data: null,
        errors: [{ message: 'Notification ID does not exist.' }]
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted.',
      data: null,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all read notifications
// @route   DELETE /api/notifications/clear
// @access  Private
export const clearReadNotifications = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();

    const result = await Notification.deleteMany({ userEmail, read: true });

    logger.debug(`[NOTIF] Cleared ${result.deletedCount} read notifications for ${userEmail}`);

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} read notification(s) cleared.`,
      data: { deletedCount: result.deletedCount },
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a notification (internal use, also exposed for testing)
// @route   POST /api/notifications
// @access  Private
export const createNotification = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();
    const { title, message, type, contextAware } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required.',
        data: null,
        errors: [{ message: 'Missing required fields.' }]
      });
    }

    const notification = await Notification.create({
      id: `notif-manual-${Date.now()}`,
      userEmail,
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: type || 'coach',
      read: false,
      contextAware: contextAware || false
    });

    res.status(201).json({
      success: true,
      message: 'Notification created.',
      data: notification,
      errors: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/count
// @access  Private
export const getUnreadCount = async (req, res, next) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();
    const count = await Notification.countDocuments({ userEmail, read: false });

    res.status(200).json({
      success: true,
      message: 'Unread count retrieved.',
      data: { unreadCount: count },
      errors: null
    });
  } catch (error) {
    next(error);
  }
};
