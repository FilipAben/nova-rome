function notify(type, title, message) {
    let request = new NotificationRequest(type);
    request.title = nova.localize(title);
    request.body = nova.localize(message);
    request.actions = [nova.localize('OK')];
    nova.notifications.add(request);
}

module.exports = notify;

