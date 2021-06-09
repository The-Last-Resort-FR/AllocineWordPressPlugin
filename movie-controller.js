var tlrUtil = {
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
    }
}

/* en plus 
CamilleTools.js
CamilleTools.convertDateToString(new Date());-> '02/06/2021'
CamilleTools.convertStringToDate('2021-06-02')-> Date


///
semaine actuelle -> 02/06/2021
semaine suivante 09/06/2021


Film1
J1 J2 -> J3 J4 J5 J6 J7
Horaire et Salle 

Film2
J1 J2 -> J3 J4 J5 J6 J7

Film3
J1 J2 -> J3 J4 J5 J6 J7


// methode initialisation
-> init: Effacer tout ce qu'il y a à l'écran

-> load: Aller chercher les données
-> loadMovies: Charger le Model ! 

Mon model:
    -> weeks[0] = new Date('02/06/2021');  // Semaines encours et à venir. 
    -> films: new Map() 
    // init
    { id: // filmId
         + tous les champs intéressants
         semaines : [
         {
            J1: 
            J2:
            J3: [ horaire1, horaire2 = '16h30']
            ....
         }
         ]
        }
    films.set(id, elementFilm)

films.get(id).weeks[0].J1 -> '16h30'
films.get(id).weeks[0].J2 -> ''
films.get(id).weeks[0].J3 -> ['16h30', 18h']


-> Affichage de mes films en liste (parameter: Date() de début de semaine)
-> Affichage en grid () pas de parameter
-> Affichage d'un film sélectionné (paramter: id) 

// methode de chargement des comportement
*/

jQuery('document').ready(function () {
    movieController.init();
    movieController.loadBehaviours();
    movieController.loadModel();
    movieController.showWeek(jQuery('#week-selector').index());
});

var movieController = {

    parser: '',
    xmlDOM: '',

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
    loadModel: function () {
        var films = this.xmlDOM.querySelectorAll('films');
        films.forEach((filmsNode, index) => {

            this.nbFilms++;
            this.films[this.nbFilms - 1] = new Map();
            filmsNode.querySelectorAll('film').forEach(film => {
                this.films[this.nbFilms - 1].set(film.getAttribute('id'), {
                    title: tlrUtil.decode_utf8(film.getAttribute('titre')),
                    img: film.getAttribute('affichette'),
                    director: tlrUtil.decode_utf8(film.getAttribute('realisateurs')),
                    actor: tlrUtil.decode_utf8(film.getAttribute('acteurs')),
                    sumup: tlrUtil.decode_utf8(film.getAttribute('synopsis')),
                    prodYear: film.getAttribute('anneeproduction'),
                    releaseDate: film.getAttribute('datesortie'),
                    duration: film.getAttribute('duree'),
                    nationality: tlrUtil.decode_utf8(film.getAttribute('nationalite')),
                    dates: film.childNodes[1].innerHTML,
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
            td.innerText = film.dates;
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
    }
}

