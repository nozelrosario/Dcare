
function castToLongDate(date) {
    var converted_date='';
    if (date) {
        if (date instanceof Date) {
            converted_date = date.getTime(); // Date.parse(date);
        } else if (typeof (date) === "Date") {
            converted_date = date.getTime(); // Date.parse(date);
        }else if(typeof(date) === "string") {
            converted_date = (new Date(date)).getTime(); //Date.parse(new Date(date));
        } else if(typeof(date) === "number") {
            converted_date = date
        }
    }
    return converted_date;
}

function getElapsedTime(startDate, endDate) {
    var elapsedSeconds = Math.abs(endDate - startDate) / 1000,
        elapsedTime = {},
        totalSecondsIn = {
            year: 31536000,
            month: 2592000,
            week: 604800, 
            day: 86400,
            hour: 3600,
            minute: 60,
            second: 1
        };
    if (startDate && endDate) {
        Object.keys(totalSecondsIn).forEach(function (key) {
            elapsedTime[key] = Math.floor(elapsedSeconds / totalSecondsIn[key]);
            elapsedSeconds -= elapsedTime[key] * totalSecondsIn[key];
        });
    }
    return elapsedTime;
}

