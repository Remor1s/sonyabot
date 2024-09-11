const choices = ['камень', 'ножницы', 'бумага'];

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

function handleRpsCommand(ctx) {
    ctx.reply('Выберите камень, ножницы или бумагу');
}

function handleRpsChoice(ctx) {
    const userChoice = ctx.message.text.toLowerCase().trim();
    if (!choices.includes(userChoice)) {
        return ctx.reply('Пожалуйста, выберите камень, ножницы или бумагу.');
    }

    const botChoice = choices[Math.floor(Math.random() * choices.length)];
    const result = determineWinner(userChoice, botChoice);

    ctx.reply(`Вы выбрали ${userChoice}. Бот выбрал ${botChoice}. ${result}`);
}

module.exports = { handleRpsCommand, handleRpsChoice };
