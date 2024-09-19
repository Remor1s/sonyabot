// hangman.js
const fs = require('fs');
const path = require('path');

let words = [];
let currentWord = '';
let hiddenWord = '';
let attemptsLeft = 6;
let guessedLetters = [];

// Функция загрузки слов из файла
function loadWords() {
    try {
        const data = fs.readFileSync(path.join(__dirname, '../data/words.json'), 'utf-8');
        const parsedData = JSON.parse(data);
        if (parsedData.words && Array.isArray(parsedData.words)) {
            words = parsedData.words;
        } else {
            throw new Error("Некорректный формат файла слов.");
        }
    } catch (err) {
        console.error("Ошибка загрузки файла слов: ", err);
        words = [];
    }
}

// Функция сохранения слов в файл
function saveWords() {
    try {
        fs.writeFileSync(path.join(__dirname, '../data/words.json'), JSON.stringify({ words: words }, null, 2));
    } catch (err) {
        console.error("Ошибка сохранения файла слов: ", err);
    }
}

// Функция для выбора случайного слова
function pickRandomWord() {
    if (words.length === 0) {
        return null;
    }
    const randomIndex = Math.floor(Math.random() * words.length);
    const word = words[randomIndex];
    words.splice(randomIndex, 1); // Удаление использованного слова
    saveWords(); // Сохраняем измененный список слов
    return word;
}

// Начало новой игры
function startGame() {
    loadWords(); // Загружаем список слов перед началом игры
    currentWord = pickRandomWord();
    if (!currentWord) {
        return null;
    }
    hiddenWord = '_ '.repeat(currentWord.length).trim(); // Формирование строки с подчеркиваниями
    attemptsLeft = 6;
    guessedLetters = [];
    return { hiddenWord }; // Возвращаем объект с hiddenWord
}

// Отгадка буквы
function guessLetter(letter, game) {
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
            updatedWord += guessedLetters.includes(currentWord[i]) ? currentWord[i] + ' ' : '_ ';
        }
        hiddenWord = updatedWord.trim();

        if (hiddenWord.replace(/ /g, '') === currentWord) {
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
