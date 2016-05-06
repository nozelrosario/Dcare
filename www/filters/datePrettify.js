angular.module('dCare.datePrettify', [])
  .filter('prettifyDate', [
    function () {
        return function (date, frequency, repeatingEvery) {
        //var momented = moment(date);
        //return momented[method].apply(momented, Array.prototype.slice.call(arguments, 2));
          var currentDate = Date.now();
          var currentDateObj = {
              month: currentDate.toString("MMMM"),
              year: currentDate.toString("yyyy"),
              day: currentDate.toString("dd"),
              weekday: currentDate.toString("ddd"),
              time: currentDate.toString("hh:mm"),
              minutes: currentDate.toString("m"),
              ampm: currentDate.toString("tt")
          };
          var targetDate = new Date(castToLongDate(date));
          var targetDateObj = {
              month: targetDate.toString("MMMM"),
              year: targetDate.toString("yyyy"),
              day: targetDate.toString("dd"),
              weekday: targetDate.toString("ddd"),
              time: targetDate.toString("hh:mm"),
              minutes: targetDate.toString("m"),
              ampm: targetDate.toString("tt")
          };
          var dateText = "";
          var ordinalize = function (number) {
              var b = parseInt(number) % 10;
              var output = (~~(parseInt(number) % 100 / 10) === 1) ? 'th' :
                  (b === 1) ? 'st' :
                  (b === 2) ? 'nd' :
                  (b === 3) ? 'rd' : 'th';
              return number + output;
          };
          if (repeatingEvery && frequency) {
              switch (repeatingEvery) {
                  case "Year": //Yearly
                      dateText = "Every " + frequency + " Year(s) on " + targetDateObj.month + " " + ordinalize(targetDateObj.day) + " " + targetDateObj.time + " " + targetDateObj.ampm;
                      break;
                  case "Month": //Monthly
                      dateText = "Every " + frequency + " Month(s) on " + ordinalize(targetDateObj.day) + " day at " + targetDateObj.time + " " + targetDateObj.ampm;
                      break;
                  case "Week": //Weekly
                      dateText = "Every " + frequency + " Week(s) on " + targetDateObj.weekday + " " + targetDateObj.time + " " + targetDateObj.ampm;
                      break;
                  case "Hour": //Hourly
                      dateText = "Every " + frequency + " Hour(s)";//+ ordinalize(targetDateObj.minutes) + " minute of hour";
                      break;
                  case "Minutes":
                      dateText = "Every " + frequency + " Minute(s)";
                      break;
              }
          } else {
              if (currentDateObj.day == targetDateObj.day && currentDateObj.month == targetDateObj.month && currentDateObj.year == targetDateObj.year) {
                  dateText = "Today at " + targetDateObj.time + " " + targetDateObj.ampm;
              } else if (currentDateObj.month == targetDateObj.month && currentDateObj.year == targetDateObj.year && (parseInt(currentDateObj.day) + 1) == targetDateObj.day) {
                  dateText = "Tomorrow at " + targetDateObj.time + " " + targetDateObj.ampm;
              } else {
                  dateText = "At " + targetDateObj.weekday + " " + targetDateObj.month + " " + targetDateObj.day + " " + targetDateObj.time + " " + targetDateObj.ampm;
              }
          }
          return dateText;
      };
    }
  ]);