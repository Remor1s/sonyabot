const { Telegraf } = require('telegraf');
const moment = require('moment');
const { startGame, guessLetter } = require('./game/hangman');
const { handleRpsCommand, handleRpsChoice } = require('./game/rps');
const { startNumberGame, joinNumberGame, handleNumberGuess } = require('./game/numbergame');
const { getWeekdaysUntilSummer } = require('./other/summer'); // Подключаем summer.js

const bot = new Telegraf('7285463706:AAFH-W3xYx194RhvPg6jwfsEp-ZD4kjVM2M'); // Токен

// Хранение состояния игры
let gameState = {};

// Команда для получения количества рабочих дней до лета
bot.command('summer', (ctx) => {
    console.log('Команда /summer получена');
    try {
        const weekdays = getWeekdaysUntilSummer();
        ctx.reply(`До начала лета осталось ${weekdays} рабочих дней.`);
    } catch (error) {
        console.error('Ошибка в summer:', error);
        ctx.reply('Произошла ошибка при подсчете рабочих дней до лета.');
    }
});

// Команды и логика для игры в виселицу
bot.command('start_hangman', (ctx) => {
    console.log('Команда /start_hangman получена');
    try {
        const hiddenWord = startGame();
        if (!hiddenWord) {
            return ctx.reply('Слова закончились!');
        }
        gameState[ctx.chat.id] = { gameType: 'hangman', hiddenWord };
        ctx.reply(`Игра началась! Слово: ${hiddenWord}`);
    } catch (error) {
        console.error('Ошибка в start_hangman:', error);
        ctx.reply('Произошла ошибка при запуске игры в виселицу.');
    }
});

bot.command('guess', (ctx) => {
    console.log('Команда /guess получена');
    try {
        const messageParts = ctx.message.text.split(' ');
        if (messageParts.length < 2) {
            return ctx.reply('Пожалуйста, укажите одну букву после команды /guess.');
        }

        const letter = messageParts[1].toLowerCase();
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
    } catch (error) {
        console.error('Ошибка в guess:', error);
        ctx.reply('Произошла ошибка при попытке угадать букву.');
    }
});

// Команды и логика для игры "Камень, ножницы, бумага"
bot.command('play', (ctx) => {
    console.log('Команда /play получена');
    try {
        handleRpsCommand(ctx);
    } catch (error) {
        console.error('Ошибка в play:', error);
        ctx.reply('Произошла ошибка при запуске игры "Камень, ножницы, бумага".');
    }
});

bot.hears(/камень|ножницы|бумага/, (ctx) => {
    console.log('Команда камень/ножницы/бумага получена');
    try {
        handleRpsChoice(ctx);
    } catch (error) {
        console.error('Ошибка в hears камень/ножницы/бумага:', error);
        ctx.reply('Произошла ошибка при выборе "Камень, ножницы, бумага".');
    }
});

// Команды и логика для игры "Угадай число"
bot.command('creategame1', (ctx) => {
    console.log('Команда /creategame1 получена');
    try {
        startNumberGame(ctx);
    } catch (error) {
        console.error('Ошибка в creategame1:', error);
        ctx.reply('Произошла ошибка при создании игры "Угадай число".');
    }
});

bot.command('join1', (ctx) => {
    console.log('Команда /join1 получена');
    try {
        joinNumberGame(ctx);
    } catch (error) {
        console.error('Ошибка в join1:', error);
        ctx.reply('Произошла ошибка при присоединении к игре "Угадай число".');
    }
});

// Обработка сообщений для угадывания числа только в играх
bot.on('text', (ctx) => {
    console.log('Текстовое сообщение получено');
    try {
        if (gameState[ctx.chat.id] && gameState[ctx.chat.id].gameType === 'numbergame') {
            handleNumberGuess(ctx);
        }
    } catch (error) {
        console.error('Ошибка в handleNumberGuess:', error);
        ctx.reply('Произошла ошибка при попытке угадать число.');
    }
});

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
