function castToLongDate(date) {
    var converted_date;
    if (date) {
        if (typeof (date) === "Date") {
            converted_date = Date.parse(date);
        }else if(typeof(date) === "string") {
            converted_date = Date.parse(new Date(date));
        } else if(typeof(date) === "number") {
            converted_date = date
        }
    }
    return converted_date;
}