const Notification = require('../models/Notification');

const createNotification = async ({ recipient, sender, type, post, question }, io) => {
  if (recipient.toString() === sender.toString()) return;
  const notif = await Notification.create({ recipient, sender, type, post, question });
  const populated = await notif.populate('sender', 'username avatar');
  if (io) io.to(recipient.toString()).emit('notification', populated);
  return populated;
};

module.exports = createNotification;
