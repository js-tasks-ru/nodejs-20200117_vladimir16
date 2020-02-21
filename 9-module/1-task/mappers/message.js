module.exports = function mapMessage(message) {
    return {
        date: message.date.toISOString(),
        text: message.text,
        id: message.id,
        user: message.user
    };
};
  