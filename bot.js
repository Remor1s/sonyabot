const { Telegraf } = require('telegraf');
const { startGame, guessLetter } = require('./game/hangman');
const { handleRpsCommand, handleRpsChoice } = require('./game/rps');
const { startNumberGame, joinNumberGame, handleNumberGuess } = require('./game/numbergame');

const bot = new Telegraf('7285463706:AAFH-W3xYx194RhvPg6jwfsEp-ZD4kjVM2M'); // Замените на ваш реальный токен

// Хранение состояния игры
let gameState = {};

// Команды и логика для игры в виселицу
bot.command('start_hangman', (ctx) => {
    const hiddenWord = startGame();
    if (!hiddenWord) {
        return ctx.reply('Слова закончились!');
    }
    gameState[ctx.chat.id] = { gameType: 'hangman', hiddenWord };
    ctx.reply(`Игра началась! Слово: ${hiddenWord}`);
});

bot.command('guess', (ctx) => {
    const letter = ctx.message.text.split(' ')[1].toLowerCase();
    if (!letter || letter.length !== 1 || !/[а-яё]/.test(letter)) {
        return ctx.reply('Пожалуйста, укажите одну букву после команды /guess.');
    }

    if (gameState[ctx.chat.id] && gameState[ctx.chat.id].gameType === 'hangman') {
        const result = guessLetter(letter);
        ctx.reply(result.message);
        if (result.finished) {
            delete gameState[ctx.chat.id];
            ctx.reply('Игра окончена! Используйте команду /start_hangman, чтобы начать новую игру.');
        }
    } else {
        ctx.reply('Игра в виселицу не начата. Используйте команду /start_hangman для начала игры.');
    }
});

// Команды и логика для игры "Камень, ножницы, бумага"
bot.command('play', (ctx) => {
    handleRpsCommand(ctx);
});

bot.hears(/камень|ножницы|бумага/, (ctx) => {
    handleRpsChoice(ctx);
});

// Команды и логика для игры "Угадай число"
bot.command('creategame1', startNumberGame);
bot.command('join1', joinNumberGame);

// Обработка любых сообщений для угадывания числа
bot.on('text', handleNumberGuess);

// Запуск бота
bot.launch()
    .then(() => {
        console.log('Бот успешно запущен');
    })
    .catch((err) => {
        console.error('Ошибка запуска бота:', err);
    });

// Обработка сигнала завершения работы бота
process.on('SIGINT', () => {
    bot.stop('SIGINT');
    console.log('Бот остановлен');
});

process.on('SIGTERM', () => {
    bot.stop('SIGTERM');
    console.log('Бот остановлен');
});
