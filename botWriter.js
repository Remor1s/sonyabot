/**
 * Функция для отправки сообщения в чат
 * @param {Object} bot - Экземпляр бота Telegraf
 * @param {Number} chatId - ID чата, в который нужно отправить сообщение
 * @param {String} message - Сообщение, которое нужно отправить
 */
function sendMessageToChat(bot, chatId, message) {
    if (!chatId || !message) {
        console.error('Необходимо указать chatId и message');
        return;
    }

    bot.telegram.sendMessage(chatId, message)
        .then(() => {
            console.log(`Сообщение успешно отправлено в чат ${chatId}`);
        })
        .catch((error) => {
            console.error(`Ошибка при отправке сообщения в чат ${chatId}:`, error);
        });
}

// Экспортируем функцию для использования в других файлах
module.exports = {
    sendMessageToChat
};
