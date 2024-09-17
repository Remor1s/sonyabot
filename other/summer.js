const moment = require('moment');

// Функция для подсчета количества рабочих дней между двумя датами
function countWeekdays(startDate, endDate) {
    let count = 0;
    let currentDate = moment(startDate);

    while (currentDate.isBefore(endDate)) {
        if (currentDate.isoWeekday() < 6) { // Проверка, является ли день рабочим (понедельник-пятница)
            count++;
        }
        currentDate.add(1, 'days');
    }
    return count;
}

// Определение сегодняшней даты и даты начала лета
function getWeekdaysUntilSummer() {
    const today = moment();
    const summerStart = moment(today).set({ month: 5, date: 1 }); // 1 июня

    // Проверка, не наступило ли лето
    if (today.isAfter(summerStart)) {
        summerStart.add(1, 'year'); // Если лето уже началось, берем следующее лето
    }

    // Подсчет рабочих дней до начала лета
    return countWeekdays(today, summerStart);
}

module.exports = {
    getWeekdaysUntilSummer
};
