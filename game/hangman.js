const fs = require('fs');
const path = require('path');

let words = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/words.json'), 'utf-8')).words;
let currentWord = '';
let hiddenWord = '';
let attemptsLeft = 6;
let guessedLetters = [];

function pickRandomWord() {
    if (words.length === 0) {
        return null;
    }
    const randomIndex = Math.floor(Math.random() * words.length);
    const word = words[randomIndex];
    words.splice(randomIndex, 1); // Удаление использованного слова
    saveWords();
    return word;
}

function saveWords() {
    fs.writeFileSync(path.join(__dirname, '../data/words.json'), JSON.stringify({ words: words }, null, 2));
}

function startGame() {
    currentWord = pickRandomWord();
    if (!currentWord) {
        return null;
    }
    hiddenWord = '_'.repeat(currentWord.length);
    attemptsLeft = 6;
    guessedLetters = [];
    return hiddenWord;
}

function guessLetter(letter) {
    if (!currentWord || attemptsLeft === 0) {
        return { message: 'Игра не начата! Используйте команду /start_hangman.' };
    }

    if (guessedLetters.includes(letter)) {
        return { message: 'Эта буква уже была отгадана.' };
    }

    guessedLetters.push(letter);

    if (currentWord.includes(letter)) {
        let updatedWord = '';
        for (let i = 0; i < currentWord.length; i++) {
            updatedWord += guessedLetters.includes(currentWord[i]) ? currentWord[i] : '_';
        }
        hiddenWord = updatedWord;

        if (hiddenWord === currentWord) {
            const finishedWord = currentWord;
            currentWord = '';
            return { message: `Поздравляем! Вы угадали слово: ${finishedWord}`, finished: true };
        }

        return { message: `Верно! Слово: ${hiddenWord}` };
    } else {
        attemptsLeft--;
        if (attemptsLeft === 0) {
            const lostWord = currentWord;
            currentWord = '';
            return { message: `Вы проиграли! Слово было: ${lostWord}`, finished: true };
        } else {
            return { message: `Неверно! Осталось попыток: ${attemptsLeft}` };
        }
    }
}

module.exports = { startGame, guessLetter };
