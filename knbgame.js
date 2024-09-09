const { Telegraf } = require('telegraf');

// Вставьте токен вашего бота прямо в код
const bot = new Telegraf('7285463706:AAFH-W3xYx194RhvPg6jwfsEp-ZD4kjVM2M');

// Список возможных вариантов
const choices = ['камень', 'ножницы', 'бумага'];

// Функция для определения победителя
function determineWinner(userChoice, botChoice) {
    if (userChoice === botChoice) return 'Ничья!';
    if (
        (userChoice === 'камень' && botChoice === 'ножницы') ||
        (userChoice === 'ножницы' && botChoice === 'бумага') ||
        (userChoice === 'бумага' && botChoice === 'камень')
    ) {
        return 'Вы выиграли!';
    } else {
        return 'Вы проиграли!';
    }
}

bot.start((ctx) => {
    ctx.reply('Добро пожаловать! Введите /play, чтобы начать игру.');
});

bot.command('play', (ctx) => {
    ctx.reply('Выберите камень, ножницы или бумагу');
});


bot.hears(/камень|ножницы|бумага/, (ctx) => {
    const userChoice = ctx.message.text.toLowerCase().trim();
    const botChoice = choices[Math.floor(Math.random() * choices.length)];
    const result = determineWinner(userChoice, botChoice);

    ctx.reply(`Вы выбрали ${userChoice}. Бот выбрал ${botChoice}. ${result}`);
});

// Запуск бота
bot.launch();
