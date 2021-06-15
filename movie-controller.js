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
                    dates[tmp2] = "vf : " + this.XmlHourToFr(hour[1]);
                }
                else if(voFirst == null) {
                    dates[tmp2] = lang + " : " + this.XmlHourToFr(hour[1]);
                }
            }
            else {
                if(voFirst != null && voFirst == true){
                    dates[tmp2] += "vo (" + langs[0] + ") : " + this.XmlHourToFr(hour[1]);
                }
                else if(voFirst != null && voFirst == false){
                    dates[tmp2] += "vf : " + this.XmlHourToFr(hour[1]);
                }
                else if(voFirst == null) {
                    dates[tmp2] += lang + " : " + this.XmlHourToFr(hour[1]);
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
                        dates[tmp2] = "vo (" + langs[0] + ") : " + this.XmlHourToFr(hour[1]);
                    }
                    else if(voFirst != null && voFirst == true){
                        dates[tmp2] = "vf : " + this.XmlHourToFr(hour[1]);
                    }
                    else if(voFirst == null) {
                        dates[tmp2] = lang + " : " + this.XmlHourToFr(hour[1]);
                    }
                }
                else {
                    if(voFirst != null && voFirst == false){
                        dates[tmp2] += "vo (" + langs[0] + ") : " + this.XmlHourToFr(hour[1]);
                    }
                    else if(voFirst != null && voFirst == true){
                        dates[tmp2] += "vf : " + this.XmlHourToFr(hour[1]);
                    }
                    else if(voFirst == null) {
                        dates[tmp2] += lang + " : " + this.XmlHourToFr(hour[1]);
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
    //movieController.loadBehaviours();
    movieController.WeekSelector();
    movieController.loadModel();
    movieController.ShowList(0);
    //movieController.showWeek(jQuery('#week-selector').index());
});

var movieController = {

    parser: '',
    xmlDOM: '',
    ev: new Event("unclick"),

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
        this.showDateSelector();
    },
    showDateSelector: function () {
        selection = jQuery('#week-selector');
        selection.empty();

        movieController.weeks.forEach(function (week) {
            selection.append('<option value="' + week + '">' + week + '</option>');
        })

    },
    loadBehaviours: function () {

        jQuery('#week-selector').change(function () {
            movieController.showWeek(document.getElementById("week-selector").options.selectedIndex);
        });

    },
    WeekSelector: function () {

        jQuery('#week-selector').change(function () {
            movieController.ShowList(document.getElementById("week-selector").options.selectedIndex);
        });

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
        var filmPack = movieController.films[index];
        var mosaic = document.getElementById("mosaic");
        mosaic.innerHTML = "";
        var buttonRowId = 0;
        filmPack.forEach(film => {
            let entry = document.createElement("div");
            entry.classList.add("entry");
            entry.id = film.title.replaceAll(" ", "");



            let cover = document.createElement("div");
            let img = document.createElement("img");
            img.src = film.img;
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
    }
}

// Get the modal
var modal = document.getElementById("movieModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}