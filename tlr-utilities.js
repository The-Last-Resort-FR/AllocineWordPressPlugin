var tlrUtil = {
    XmlDateStringToJsDate: function(date){
        let dateStr = [];
        let dateStr2 = [];
        dateStr = date.split(" "); 
        dateStr2 = dateStr[0].split("-");
        return dateStr2[2] + "-" + dateStr2[1] + "-" + dateStr2[0] + "T" + dateStr[1];
    },

    XmlDateToFRDate: function(date){
        let dateStr = [];
        let dateStr2 = [];
        let dateStr3 = [];
        dateStr = date.split(" "); 
        dateStr2 = dateStr[0].split("-");
        dateStr3 = dateStr[1].split(":");
        return dateStr2[0] + "/" + dateStr2[1] + "/" + dateStr2[2] + " à " + dateStr3[0] + "h" + dateStr3[1];
    }
}
// 04-06-2021 17:30:00
// Fri Jun 04 2021 11:25:12 GMT+0200 (Central European Summer Time)