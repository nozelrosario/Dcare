
function castToLongDate(date) {
    var converted_date;
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
