const Notification = require('../models/Notification');

/**
 * createNotification({ title, message, type, user? })
 * Fires-and-forgets — never throws so it never breaks the caller.
 */
async function createNotification({ title, message, type, user = null }) {
  try {
    await Notification.create({ title, message, type, user });
  } catch (err) {
    console.error('[Notification] failed to create:', err.message);
  }
}

module.exports = { createNotification };
