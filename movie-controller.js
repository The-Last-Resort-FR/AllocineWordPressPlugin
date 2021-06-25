var tlrUtil = {
    dbg: "",
    daysToInt: new Map(),
    IntToDays: ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"],
    IntToDaysFR: ["Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche", "Lundi", "Mardi"],

    MakeDays: function () {
        this.daysToInt.set("Wed", 0);
        this.daysToInt.set("Thu", 1);
        this.daysToInt.set("Fri", 2);
        this.daysToInt.set("Sat", 3);
        this.daysToInt.set("Sun", 4);
        this.daysToInt.set("Mon", 5);
        this.daysToInt.set("Tue", 6);
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
tlrUtil.MakeDays();








jQuery('document').ready(function () {

    movieController.init();
    movieController.RemovePast();
    movieController.loadModel();
    //movieController.SortWeeks();
    movieController.CancelFilmDesc(0);
});

var movieController = {

    parser: '',
    xmlDOM: '',
    FilmDescriptionHTML: '<div id="filmDesc"><span id="bCancel">retour</span></div>',
    HoursTableHTML: '<div><label for="week-selector">Choisir une semaine : </label><select name="week" id="week-selector"></select></div><div id="mosaic"></div>',


    weeks: [],
    weekIndex: 0,
    films: [],
    nbFilms: 0,

    init: function () {
        this.parser = new DOMParser();
        this.xmlDOM = this.parser.parseFromString(atob(acp.xmlContent), 'application/xml');
        let weekTmp = this.xmlDOM.querySelectorAll('semaine');
        weekTmp.forEach(element => {
            this.weeks.push(
                element.getAttribute('date')
            );
        });
    },
    SortWeeks: function() { // Makes weeks from monday to monday
        let filmArr = [];
        let tmpFilms = [];
        let twoDaysOffest = 172800000;

        this.films.forEach( week => {
            week.forEach(film => {
                filmArr.push(film);
            });
        });
        this.weeks.forEach((week, index) => {
            let monday = new Date(tlrUtil.XmlDateStringToJsDateNH(week)).getTime() - twoDaysOffest; // Find monday
            let month = (new Date(monday).getMonth() < 10) ? ( "0" + new Date(monday).getMonth()) : new Date(monday).getMonth(); // add the 0 if not superior to 10
            this.weeks[index] =  new Date(monday).getDate() + "/" + month + "/" + new Date(monday).getFullYear();
        });
        let i = 0;
        this.weeks.forEach((week, index) => {
            tmpFilms.push(new Map());
            let currenMonday = new Date(tlrUtil.XmlDateStringToJsDateNH(week)).getTime();
            if(index == this.weeks.length - 1)
            {
                filmArr.forEach(film => {
                    let dateTmp = film.date.split(' ');
                    let filmDate = new Date(tlrUtil.FilmDateToJsDate(dateTmp[0])).getTime()
                    if( filmDate >= currenMonday)
                        tmpFilms[i].set(film.id, film);
                });
                return;
            }
            else
            {
                let nextMonday = new Date(tlrUtil.XmlDateStringToJsDateNH(this.weeks[index + 1])).getTime();
                filmArr.forEach(film => {
                    let dateTmp = film.date.split(' ');
                    let filmDate = new Date(tlrUtil.FilmDateToJsDate(dateTmp[0])).getTime()
                    if( filmDate >= currenMonday && filmDate < nextMonday)
                        tmpFilms[i].push(film);
                });
            }
            i++;
        });
        i = 0;
    },
    SwitchToFilmDesc: function() {
        let tmp = document.getElementById('mosaicTable');
        tmp.innerHTML = this.FilmDescriptionHTML;
    },
    SwitchToHoursTable: function() {
        let tmp = document.getElementById('mosaicTable');
        tmp.innerHTML = this.HoursTableHTML;
    },
    showDateSelector: function () {
        selection = jQuery('#week-selector');
        selection.empty();

        movieController.weeks.forEach(function (week) {
            selection.append('<option value="' + week + '">' + week + '</option>');
        })

    },
    CancelFilmDesc: function(week) {
        movieController.SwitchToHoursTable();
        movieController.showDateSelector();
        movieController.WeekSelector();
        movieController.ShowList(week);
    },
    ShowFilmDesc: function(week, id) {
        movieController.SwitchToFilmDesc();
        let cancelButton = document.getElementById("bCancel");
        cancelButton.style.cursor = "pointer";
        cancelButton.addEventListener("click", function () { movieController.CancelFilmDesc(week); }, false);
        let film = movieController.films[week].get(id);
        let filmDesc = document.getElementById("filmDesc");
        let img = document.createElement("img");
        img.src = film.img;
        img.style.float = "left";
        let filmInfo = document.createElement("div");
        filmInfo.style.float = "right";
        let infos = document.createElement("p");
        infos.innerHTML = "titre : " + film.title + '\n' + "<br>" +
        "Réalistateur : " + film.director + '\n' +"<br>" +
        "Acteurs : " + film.actor + '\n' +"<br>" +
        "Synopsis : " + film.sumup +'\n' +"<br>" +
        "Année de production : " + film.prodYear + '\n' +"<br>" +
        "Date de sortie : " + film.releaseDate + '\n' +"<br>" +
        "Durée : " + film.duration + '\n' +"<br>" +
        "Nationalité : " + film.nationality + '\n' + "<br>";
        let a = document.createElement('a');
        a.href = film.video;
        a.innerText = "Cliquez ici pour voir la bande annonce";
        a.target = "_blank";
        infos.appendChild(a);
        filmInfo.appendChild(infos);

        filmDesc.appendChild(img);
        filmDesc.appendChild(filmInfo);

    },
    WeekSelector: function () {

        jQuery('#week-selector').change(function () {
            movieController.ShowList(document.getElementById("week-selector").options.selectedIndex);
        });

    },
    RemovePast: function () {
        let past = [];
        let currentDate = new Date().getTime();
        for (let i = 1; i < movieController.weeks.length; i++)
        {
            let weekDate = new Date(tlrUtil.XmlDateStringToJsDateNH(movieController.weeks[i])).getTime()
            if(currentDate > weekDate)
            {
                past.push(i - 1);
                //movieController.weeks.splice(i - 1, 1);
            }
                
        }
        for (let i = 0; i < past.length; i++)
            movieController.weeks.splice(0, 1);
    },


    loadModel: function () {
        var films = this.xmlDOM.querySelectorAll('films');
        films.forEach((filmsNode, index) => {

            this.nbFilms++;
            this.films[this.nbFilms - 1] = new Map();
            filmsNode.querySelectorAll('film').forEach(film => {
                this.films[this.nbFilms - 1].set(film.getAttribute('id'), {
                    title: tlrUtil.decode_utf8(film.getAttribute('titre')),
                    id: film.getAttribute('id'),
                    img: film.getAttribute('affichette'),
                    director: tlrUtil.decode_utf8(film.getAttribute('realisateurs')),
                    actor: tlrUtil.decode_utf8(film.getAttribute('acteurs')),
                    sumup: tlrUtil.decode_utf8(film.getAttribute('synopsis')),
                    prodYear: film.getAttribute('anneeproduction'),
                    releaseDate: film.getAttribute('datesortie'),
                    duration: film.getAttribute('duree'),
                    nationality: tlrUtil.decode_utf8(film.getAttribute('nationalite')),
                    date: film.childNodes[1].innerHTML + (film.childNodes[3] != null ? ("|" + film.childNodes[3].innerHTML) : ""),
                    dates: tlrUtil.PrepareDates(film.childNodes[1].innerHTML + (film.childNodes[3] != null ? ("|" + film.childNodes[3].innerHTML) : ""),film.childNodes[1].getAttribute('vo') + (film.childNodes[3] != null ? "|" + film.childNodes[3].getAttribute('vo'): ""), tlrUtil.decode_utf8(film.childNodes[1].getAttribute('version') + (film.childNodes[3] != null ? "|" + film.childNodes[3].getAttribute('version'): ""))),
                    vo: film.childNodes[1].getAttribute('vo') + (film.childNodes[3] != null ? "|" + film.childNodes[3].getAttribute('vo'): ""),
                    lang: tlrUtil.decode_utf8(film.childNodes[1].getAttribute('version') + (film.childNodes[3] != null ? "|" + film.childNodes[3].getAttribute('version'): "")),
                    video: "http://player.allocine.fr/" + film.getAttribute('video') + ".html",
                });
            });

        });
    },
    showWeek: function (index) {
        var filmPack = movieController.films[index];
        let tableFilms = document.getElementById('filmstab');
        tableFilms.innerHTML = "\n<thead>\n<tr>\n<th>Affiche</th>\n<th>Titre</th>\n<th>Réalistateur</th>\n<th>Acteurs</th>\n<th>Synopsis</th>\n<th>Dates</th>\n<th style=\"min-width: 20%;\">Informations</th>\n</tr>\n</thead>\n<tbody>\n\n</tbody>\n";
        filmPack.forEach(film => {
            //console.log(film.title);
            let row = document.createElement('tr');

            // affiche
            let td = document.createElement('td');
            img = document.createElement('img');
            img.src = film.img;
            td.appendChild(img);
            row.appendChild(td);

            //  Titre
            td = document.createElement('td');
            td.innerText = film.title;
            row.appendChild(td);

            // Réalistateur
            td = document.createElement('td');
            td.innerText = film.director;
            row.appendChild(td);

            // Acteurs
            td = document.createElement('td');
            td.innerText = film.actor;
            row.appendChild(td);

            // Synopsis
            td = document.createElement('td');
            td.innerText = film.sumup;
            row.appendChild(td);

            // dates
            td = document.createElement('td');
            td.innerText = film.date;
            td.date = td.innerText;
            row.appendChild(td);

            // Info
            td = document.createElement('td');
            td.innerText = "Année de production : " + film.prodYear + '\n' +
                "Date de sortie : " + film.releaseDate + '\n' +
                "Durée : " + film.duration + '\n' +
                "Nationalité : " + film.nationality + '\n';
            a = document.createElement('a');
            a.href = film.video;
            a.innerText = "Cliquez ici pour voir la bande annonce";
            a.target = "_blank";
            td.appendChild(a);
            row.appendChild(td);


            tableFilms.appendChild(row);
        });
    },

    ShowDay: function (index, filmId, elementId, week, buttonId) {
        let hours = document.getElementById(elementId + "h");
        let tmp = movieController.films[week].get(filmId).dates[index];
        let loopBreaker;
        hours.innerHTML = "";
        if (tmp != null) {
            let tmp2 = tmp.split(";");
            tmp2.forEach(hour => {
                let row = document.createElement("p");
                row.innerText = hour;
                loopBreaker = row.innerText;
                hours.appendChild(row);
            });
        }
        else {
            let row = document.createElement("p");
            row.innerText = "Pas d'horaires prévus à ce jour";
            loopBreaker = row.innerText;
            hours.appendChild(row);
        }
        let ids = buttonId.split(" ");
        let tmp2 = ids[0];
        let buttons = document.querySelectorAll("button[id^=\"" + tmp2 + "\"]");
        let allButtons = document.querySelectorAll(".mosaicButtons")
        allButtons.forEach(button => {
            button.style = "";
        });
        buttons.forEach(otherbutton => {
            let id = otherbutton.id.split(" ");
            if (otherbutton.getAttribute("clicked") != 1 ) {
                otherbutton.click();
                otherbutton.setAttribute("clicked", 1);
                otherbutton.style = "outline-offset: -6px; outline: dotted 3px yellow;";
            }
            else {
                otherbutton.setAttribute("clicked", 0);
            }
        });

    },

    ShowList: function (index) {
        let filmPack = movieController.films[index];
        let mosaic = document.getElementById("mosaic");
        mosaic.innerHTML = "";
        let buttonRowId = 0;
        filmPack.forEach(film => {
            let entry = document.createElement("div");
            entry.classList.add("entry");
            entry.id = film.title.replaceAll(" ", "");



            let cover = document.createElement("div");
            let img = document.createElement("img");
            img.src = film.img;
            img.addEventListener("click", function () { movieController.ShowFilmDesc(index, film.id); }, false);
            img.style.cursor = "pointer";
            cover.classList.add("cover");
            cover.appendChild(img);



            let dates = document.createElement("div");
            dates.classList.add("dates");

            let days = document.createElement("div");
            days.classList.add("days");
            let i = 0;
            for (i = 0; i <= 6; i++) {
                let button = document.createElement("button");
                button.innerText = tlrUtil.IntToDaysFR[i];
                let abc = i;
                button.id = "b" + abc + " " + buttonRowId;
                button.addEventListener("click", function () { movieController.ShowDay(abc, film.id, entry.id, index, button.id); }, false);
                button.classList.add("mosaicButtons");
                
                days.appendChild(button);
            }
            let hours = document.createElement("div");
            hours.classList.add("hours");
            hours.id = film.title.replaceAll(" ", "") + "h";
            hours.innerText = "Cliquer sur un jour pour voir la programmation de celui ci";

            buttonRowId++;
            dates.appendChild(days);
            dates.appendChild(hours);
            entry.appendChild(cover);
            entry.appendChild(dates);
            mosaic.appendChild(entry);
        });
    },
}