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




var movieController = {

    parser: '',
    xmlDOM: '',

    weeks: [],
    weekIndex: 0,
    films: new Map(),

    init: function(){
        this.parser = new DOMParser();
        this.xmlDOM = this.parser.parseFromString(acp.xmlContent, 'application/xml');
        let weekTmp = this.xmlDOM.querySelectorAll('semaine');
        weekTmp.forEach(element => {
            this.weeks.push(
                element.getAttribute('date')
            );
        });
    },
    loadBehaviours: function(){
    },
    loadModel: function(){
        var films = this.xmlDOM.querySelectorAll('films');
        films.forEach((filmsNode, index) => {
            this.films[this.weeks[index]] = new Map();
            var array = this.films[this.weeks[index]]
            filmsNode.querySelectorAll('film').forEach(film => {
                array.set(film.getAttribute('id'),{
                    title: film.getAttribute('titre'),
                    img: film.getAttribute('affichette'),
                    director: film.getAttribute('realisateurs'),
                    actor: film.getAttribute('acteurs'),
                    sumup: film.getAttribute('synopsis'),
                    prodYear: film.getAttribute('anneeproduction'),
                    releaseDate: film.getAttribute('datesortie'),
                    duration: film.getAttribute('duree'),
                    nationality: film.getAttribute('nationalite'),
                    video: "http://player.allocine.fr/" + film.getAttribute('video') + ".html",
                });
            });
        });
    },
    show: function (){
        console.log(this.films["02/06/2021"].get("264648")["title"]);
    }
}

movieController.init();
movieController.loadBehaviours();
movieController.loadModel();
movieController.show();