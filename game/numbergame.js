<<<<<<< HEAD
// game/numbergame.js

// Хранение состояния игры
let gameState = {};

// Функция для начала игры
function startNumberGame(ctx) {
    const chatId = ctx.chat.id;
    const secretNumber = Math.floor(Math.random() * 1000) + 1;

    if (gameState[chatId]) {
        return ctx.reply('Игра уже началась в этом чате. Попробуйте угадать число.');
    }

    gameState[chatId] = {
        secretNumber: secretNumber,
        players: [],
        currentPlayerIndex: 0 // Индекс текущего игрока
    };

    ctx.reply('Игра началась! Используйте команду /join1 для присоединения.');
}

// Функция для присоединения к игре
function joinNumberGame(ctx) {
    const chatId = ctx.chat.id;
    const playerName = ctx.from.username || ctx.from.first_name;

    if (!gameState[chatId]) {
        return ctx.reply('Игра не начата. Используйте команду /creategame1 для начала игры.');
    }

    if (!gameState[chatId].players.includes(playerName)) {
        gameState[chatId].players.push(playerName);
        ctx.reply(`${playerName} присоединился к игре!`);
    } else {
        ctx.reply('Вы уже участвуете в игре.');
    }
}

// Функция для угадывания числа
function handleNumberGuess(ctx) {
    const chatId = ctx.chat.id;
    const guess = parseInt(ctx.message.text);
    const playerName = ctx.from.username || ctx.from.first_name;

    if (!gameState[chatId]) {
        return ctx.reply('Игра не начата. Используйте команду /creategame1 для начала игры.');
    }

    if (!gameState[chatId].players.includes(playerName)) {
        return ctx.reply('Вы не участвуете в игре. Используйте команду /join1 для присоединения.');
    }

    const game = gameState[chatId];

    // Проверка очередности
    if (game.players[game.currentPlayerIndex] !== playerName) {
        return ctx.reply('Сейчас не ваше время для угадывания числа.');
    }

    if (isNaN(guess)) {
        return ctx.reply('Пожалуйста, введите правильное число.');
    }

    const secretNumber = game.secretNumber;

    if (guess === secretNumber) {
        delete gameState[chatId];
        ctx.reply(`Поздравляем, ${playerName}! Вы угадали число ${secretNumber}!`);
    } else if (guess < secretNumber) {
        ctx.reply('Загаданное число больше.');
    } else {
        ctx.reply('Загаданное число меньше.');
    }

    // Переход к следующему игроку
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
}

// Экспорт функций
module.exports = {
    startNumberGame,
    joinNumberGame,
    handleNumberGuess
};
=======
let gameState = {};

// Функция для начала игры
function startNumberGame(ctx) {
    const chatId = ctx.chat.id;
    const secretNumber = Math.floor(Math.random() * 1000) + 1;

    if (gameState[chatId]) {
        return ctx.reply('Игра уже началась в этом чате. Попробуйте угадать число.');
    }

    gameState[chatId] = {
        secretNumber: secretNumber,
        players: []
    };

    ctx.reply('Игра началась! Используйте команду /join1 для присоединения.');
}

// Функция для присоединения к игре
function joinNumberGame(ctx) {
    const chatId = ctx.chat.id;
    const playerName = ctx.from.username || ctx.from.first_name;

    if (!gameState[chatId]) {
        return ctx.reply('Игра не начата. Используйте команду /creategame1 для начала игры.');
    }

    if (!gameState[chatId].players.includes(playerName)) {
        gameState[chatId].players.push(playerName);
        ctx.reply(`${playerName} присоединился к игре!`);
    } else {
        ctx.reply('Вы уже участвуете в игре.');
    }
}

// Функция для угадывания числа
function guessNumber(ctx) {
    const chatId = ctx.chat.id;
    const guess = parseInt(ctx.message.text);
    const playerName = ctx.from.username || ctx.from.first_name;

    if (!gameState[chatId]) {
        return ctx.reply('Игра не начата. Используйте команду /creategame1 для начала игры.');
    }

    if (!gameState[chatId].players.includes(playerName)) {
        return ctx.reply('Вы не участвуете в игре. Используйте команду /join1 для присоединения.');
    }

    if (isNaN(guess)) {
        return ctx.reply('Пожалуйста, введите правильное число.');
    }

    const secretNumber = gameState[chatId].secretNumber;

    if (guess === secretNumber) {
        delete gameState[chatId];
        ctx.reply(`Поздравляем, ${playerName}! Вы угадали число ${secretNumber}!`);
    } else if (guess < secretNumber) {
        ctx.reply('Загаданное число больше.');
    } else {
        ctx.reply('Загаданное число меньше.');
    }
}

// Обработка сообщения для угадывания числа
function handleNumberGuess(ctx) {
    const messageText = ctx.message.text;
    const guess = parseInt(messageText);

    if (!isNaN(guess)) {
        guessNumber(ctx);
    }
}

module.exports = {
    startNumberGame,
    joinNumberGame,
    handleNumberGuess
};
>>>>>>> 7f19afcbc37d42290930bd7679685183a1182fd8
