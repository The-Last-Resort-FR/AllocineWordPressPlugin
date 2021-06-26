
jQuery('document').ready(function () {

    tlrUtil.makeDays();
    
});

var tlrUtil = {
    dbg: "",
    daysToInt: new Map(),
    IntToDays: ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"],
    IntToDaysFR: ["Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche", "Lundi", "Mardi"],

    makeDays: function () {
        this.daysToInt.set("Wed", 0);
        this.daysToInt.set("Thu", 1);
        this.daysToInt.set("Fri", 2);
        this.daysToInt.set("Sat", 3);
        this.daysToInt.set("Sun", 4);
        this.daysToInt.set("Mon", 5);
        this.daysToInt.set("Tue", 6);
    },
    // returns Wed Thu Fri .... Tue 
    getDay: function(date){
        if(date === undefined){
            date = new Date();
        } 
        return date.toString().substring(0,3);
    },
    // returns 0 1 2 .... 6 
    getDayNumber: function(date){
        return this.daysToInt.get(this.getDay(date));
    },
    // parameter:     0   1   2   ....  6 
    // returns:       Wed Thu Fri .... Tue 
    getDayIndex: function(dayNumber)
    {
        return this.IntToDays[dayNumber];
    },

    XmlHourToFr: function (hour) {
        let tmp = hour.split(":")
        return tmp[0] + "h" + tmp[1];
    },

    //[ "Wed", "Thu", "Fri", "Sat", "Sun", "Mon","Tue" ]
    XmlDateStringToJsDate: function (date) {
        let dateStr = [];
        let dateStr2 = [];
        dateStr = date.split(" ");
        dateStr2 = dateStr[0].split("-");
        return dateStr2[2] + "-" + dateStr2[1] + "-" + dateStr2[0] + "T" + dateStr[1];
    },
    XmlDateStringToJsDateNH: function (date) {
        let dateArr = date.split("/");
        return dateArr[2] + "-" + dateArr[1] + "-" + dateArr[0];
    },
    FilmDateToJsDate: function (date) {
        let dateArr = date.split("-");
        return dateArr[2] + "-" + dateArr[1] + "-" + dateArr[0];
    },
    XmlDateToFRDate: function (date) {
        let dateStr = [];
        let dateStr2 = [];
        let dateStr3 = [];
        dateStr = date.split(" ");
        dateStr2 = dateStr[0].split("-");
        dateStr3 = dateStr[1].split(":");
        return dateStr2[0] + "/" + dateStr2[1] + "/" + dateStr2[2] + " à " + dateStr3[0] + "h" + dateStr3[1];
    },

    encode_utf8: function (s) {
        return unescape(encodeURIComponent(s));
    },

    decode_utf8: function (s) {
        return decodeURIComponent(escape(s));
    },

    PrepareDates: function (date, vo, lang) {
        // 02-06-2021 14:00:00;02-06-2021 16:15:00;06-06-2021 11:00:00
        let dates = [];
        let senario = 0;
        let langs = lang.split("|");
        let voFirst;
        if(vo == "0|1") {
            senario = 1;
            voFirst = false;
        } 
        else if(vo == "1|0") {
            senario = 2;
            voFirst = true;
        }
        else if(vo == "0") senario = 3;
        else if(vo == "1") senario = 4;

        let datesLang = date.split("|");
        let datesTmp = datesLang[0].split(";");
        let datesTmp2
        if (datesLang[1] != null)
        {
            datesTmp2 = datesLang[1].split(";");
        }
        datesTmp.forEach(d => {
            let tmp = new Date(this.XmlDateStringToJsDate(d)).toDateString();
            let splited = tmp.split(" ");
            let tmp2 = this.daysToInt.get(splited[0]);
            let hour = d.split(" ");
            if (dates[tmp2] == null) {
                if(voFirst != null && voFirst == true){
                    dates[tmp2] = "vo (" + langs[0] + ") : " + this.XmlHourToFr(hour[1]);
                }
                else if(voFirst != null && voFirst == false){
                    dates[tmp2] = "vf : " + this.XmlHourToFr(hour[1]) + '\n';
                }
                else if(voFirst == null) {
                    dates[tmp2] = lang + " : " + this.XmlHourToFr(hour[1]) + '\n';
                }
            }
            else {
                if(voFirst != null && voFirst == true){
                    dates[tmp2] += "vo (" + langs[0] + ") : " + this.XmlHourToFr(hour[1]) + '\n';
                }
                else if(voFirst != null && voFirst == false){
                    dates[tmp2] += "vf : " + this.XmlHourToFr(hour[1]) + '\n';
                }
                else if(voFirst == null) {
                    dates[tmp2] += lang + " : " + this.XmlHourToFr(hour[1]) + '\n';
                }
            }
        });
        if (datesLang[1] != null)
        {
            datesTmp2.forEach(d => {
                let tmp = new Date(this.XmlDateStringToJsDate(d)).toDateString();
                let splited = tmp.split(" ");
                let tmp2 = this.daysToInt.get(splited[0]);
                let hour = d.split(" ");
                if (dates[tmp2] == null) {
                    if(voFirst != null && voFirst == false){
                        dates[tmp2] = "vo (" + langs[0] + ") : " + this.XmlHourToFr(hour[1]) + '\n';
                    }
                    else if(voFirst != null && voFirst == true){
                        dates[tmp2] = "vf : " + this.XmlHourToFr(hour[1]) + '\n';
                    }
                    else if(voFirst == null) {
                        dates[tmp2] = lang + " : " + this.XmlHourToFr(hour[1]) + '\n';
                    }
                }
                else {
                    if(voFirst != null && voFirst == false){
                        dates[tmp2] += "vo (" + langs[0] + ") : " + this.XmlHourToFr(hour[1]) + '\n';
                    }
                    else if(voFirst != null && voFirst == true){
                        dates[tmp2] += "vf : " + this.XmlHourToFr(hour[1]) + '\n';
                    }
                    else if(voFirst == null) {
                        dates[tmp2] += lang + " : " + this.XmlHourToFr(hour[1]) + '\n';
                    }
                }
            });
        }
        return dates;
    }


}

