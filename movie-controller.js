jQuery('document').ready(function () {
    movieController.init();
    movieController.loadBehaviours();
    movieController.loadModel();
    movieController.show();
});

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
        //console.log(this.films["02/06/2021"].get("264648")["title"]);
        movieController.films.forEach(filmpack => {
            filmpack.forEach(film => {
                console.log(film.title);
            })
        });
    }
}

