
jQuery('document').ready(function () {

    if(typeof acp !== 'undefined')
    {   
        movieController.init();
        movieController.loadModel();
        movieController.renderList();
    }
   
});

var movieController = 
{
    parser: '',
    xmlDOM: '',

    weeks: [],
    weekStartDates: [],
    selectedWeekIndex: 0,
    selectedDayIndex: 0,
    filmPackToBeAdded: new Map(),
    films: new Map(), // Film contient toutes les informations du filmId, title, description, image
    horaires: [], // on a dans cette array tous les horaires du fichier:  horaires [{filmId , Jour 0...6, date, horaire, version }]
    nbHoraires: 0,

    init: function () {
        movieController.weeks = [];
        movieController.films = new Map();
        filmPackToBeAdded = new Map();
        movieController.parser = new DOMParser();
        movieController.xmlDOM = this.parser.parseFromString(atob(acp.xmlContent), 'application/xml');
        let weekTmp = this.xmlDOM.querySelectorAll('semaine');
        weekTmp.forEach(element => {
            // we keep the start date -> text
            movieController.weeks.push(element.getAttribute('date'));
            // we keep the start date -> date
            movieController.weekStartDates.push(new Date(tlrUtil.XmlDateStringToJsDateNH(element.getAttribute('date'))));
        });
        // we remove all the weeks not in the current week
        movieController.removePastWeeks();
        // we select by default the index 0
        movieController.selectedWeekIndex = 0;
        // we defined the current day Index
        movieController.selectedDayIndex = tlrUtil.getDayNumber();//daysToInt.get(new Date().toString().substring(0,3));
    },
    removePastWeeks: function () 
    {
        let past = [];
        let currentDate = new Date().getTime();
        for (let i = 1; i < movieController.weeks.length; i++)
        {
            let weekDate = new Date(tlrUtil.XmlDateStringToJsDateNH(movieController.weeks[i])).getTime()
            if(currentDate > weekDate)
            {
                past.push(i - 1);
            }   
        }
        for (let i = 0; i < past.length; i++){
            movieController.weeks.splice(0, 1);
            movieController.weekStartDates.splice(0, 1);
        }
    },
    loadModel: function () 
    {
        var filmsRef = this.xmlDOM.querySelectorAll('films');
        filmsRef.forEach((filmsNode, index) => 
        {
            filmsNode.querySelectorAll('film').forEach(film => 
            {
                /*
                Exemple d'un bout de programmation de films, avec un childNodes[3] disponible (parfois il n'y en a pas)

                <film id="272523" titre="Des hommes" titreoriginal="" realisateurs="Lucas Belvaux" acteurs="Gérard Depardieu, Catherine Frot, Jean-Pierre Darroussin, Yoann Zimmer, Félix Kysyl" anneeproduction="2019" datesortie="02/06/2021" duree="01h41" genreprincipal="Drame, Historique" nationalite="France" synopsis="Ils ont été appelés en Algérie au moment des &quot;événements&quot; en 1960. Deux ans plus tard, Bernard, Rabut, Février et d'autres sont rentrés en France. Ils se sont tus, ils ont vécu leurs vies. Mais parfois il suffit de presque rien, d'une journée d'anniversaire, d'un cadeau qui tient dans la poche, pour que quarante ans après, le passé fasse irruption dans la vie de ceux qui ont cru pouvoir le nier." affichette="http://images.allocine.fr/pictures/20/07/15/11/39/5633138.jpg" video="19589583" visanumber="150270">
                    <horaire_web vo="1" version="France" projection="2D" soustitre="" salle="01">mer, dim: 20:30|jeu: 18:15</horaire_web>
                    <horaire vo="1" version="France" projection="2D" soustitre="" salle="01">16-06-2021 20:30:00;17-06-2021 18:15:00;20-06-2021 20:30:00</horaire>
                    <horaire_web vo="0" version="Français" projection="2D" soustitre="" salle="01">ven: 19:45</horaire_web>
                    <horaire vo="0" version="Français" projection="2D" soustitre="" salle="01">18-06-2021 19:45:00</horaire>
                </film>*/
                if(!this.films.has(film.getAttribute('id')))
                {
                    this.films.set(film.getAttribute('id'), 
                        {
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
                            video: "http://player.allocine.fr/" + film.getAttribute('video') + ".html",
                        });
                }
                let horaires1 = film.childNodes[1].innerHTML.split(';');
                let vos1 = film.childNodes[1].getAttribute('vo');
                let versions1 = tlrUtil.decode_utf8(film.childNodes[1].getAttribute('version'));
                this.addHoraires(film.getAttribute('id'),horaires1,vos1,versions1);
                if(film.childNodes[3] != null)
                {
                    let horaires2 = film.childNodes[3].innerHTML.split(';');
                    let vos2 = film.childNodes[3].getAttribute('vo');
                    let versions2 = tlrUtil.decode_utf8(film.childNodes[3].getAttribute('version'));
                    this.addHoraires(film.getAttribute('id'),horaires2,vos2,versions2);
                }
            });
        });
    },
    addHoraires: function (filmId,horaires,vo,version)
    {

        for (let i=0 ; i<horaires.length ; i++)
        {
            // we have to define the relatedWeekIndex
            let horaireTmsp = new Date(tlrUtil.XmlDateStringToJsDate(horaires[i]))
            // we filter the horaires between greater than first weekStartDate -> filter the ongoing timetable
            if(movieController.weekStartDates[0] < horaireTmsp)
            {
                let dayIndex = tlrUtil.daysToInt.get(horaireTmsp.toDateString().substring(0,3));
                let weekIndex = movieController.defineWeekIndex(horaireTmsp);
                let versionOriginale = 'VF';
                if(vo === '1')
                {
                    versionOriginale = 'VOST';
                }
                let h = { 
                            filmId : filmId,
                            dayIndex : dayIndex,
                            horaireToShow: horaires[i].substring(0,16),
                            horaireTmsp : horaireTmsp,
                            weekIndex : weekIndex,
                            vo : versionOriginale,
                            version : version
                        }
                this.nbHoraires++;
                this.horaires[this.nbHoraires-1] = h;
            }
        }
    },
    defineWeekIndex : function(date)
    {
        for(let i = 0 ; i < movieController.weekStartDates.length ; i++)
        {
            // if the parameter date can be compared to two weekStartDates
            if(i < movieController.weekStartDates.length-1 )    
            {
                // if the date is between two consecutive startDate
                if(movieController.weekStartDates[i] < date &&
                date < movieController.weekStartDates[i+1])
                {
                    return i;
                }
            } else {
                 // else -> we are at the lastweek, then we return the max index
                return i;
            }
        }
    },
    injectFilmDesc: function() {
        let tmp = document.getElementById('mosaicTable');
        tmp.innerHTML = '<div id="filmDescription"><button id="back">retour</button></div>';
    },
    injectHoursTable: function() {
        let tmp = document.getElementById('mosaicTable');
        tmp.innerHTML = '<div><label for="week-selector">Choisir une semaine : </label><select name="week" id="week-selector"></select></div><div id="mosaic"></div>';
    },
    injectDateSelector: function () {
        selection = jQuery('#week-selector');
        selection.empty();
        movieController.weeks.forEach(function (week) {
            selection.append('<option value="' + week + '">' + week + '</option>');
        })
    },
    loadBehaviourOfWeekSelector: function () {
        jQuery('#week-selector').change(function () {
            movieController.selectedWeekIndex = document.getElementById("week-selector").options.selectedIndex;
            movieController.manageSelectedDayIndex();
            movieController.showList(document.getElementById("week-selector").options.selectedIndex);
        });
    },
    renderList: function() 
    {
        movieController.injectHoursTable();
        movieController.injectDateSelector();
        movieController.loadBehaviourOfWeekSelector();
        movieController.showList();
    },
    showList: function () 
    {
        // filmPack to be added
        movieController.filmPackToBeAdded = new Map();

        // clean the place
        let mosaic = jQuery("#mosaic");
        mosaic.empty();
        let list = '';
        // we set the current date
        let currentDate = new Date();
        // we set the minWeekStartDate of the selectedWeek
        let minWeekStartDate = movieController.weekStartDates[movieController.selectedWeekIndex];
        // we set the maxWeekStartDate
        const maxWeekStartDate = new Date(Number(minWeekStartDate));
        maxWeekStartDate.setDate(maxWeekStartDate.getDate() + 7);
        // if we are pointing to a week in the future
        if(minWeekStartDate < currentDate)
        {
            // take the current date as minWeekStartDate
            minWeekStartDate = currentDate;
        }
        // all the timetables are filtered between minWeekStartDate and maxWeekStartDate 
        for(let i = 0 ; i < movieController.horaires.length ; i++)
        {
            let h = movieController.horaires[i];
            ///////////////////////// DATE CONTROL ////////////////////////////
            // ONlY THE FILM OF THE CURRENT WEEK are added to the movie list
            // we check if the film has a timetable in the future and is in the current week
            ///////////////////////////////////////////////////////////////////
            if(minWeekStartDate < h.horaireTmsp && h.horaireTmsp < maxWeekStartDate)
            {
                // we add the movie to the page once - if not included yet
                if(!movieController.filmPackToBeAdded.has(h.filmId))
                {
                    movieController.filmPackToBeAdded.set(h.filmId, h.filmId);
                    let film = movieController.films.get(h.filmId);
                    list += '<div id="'+h.filmId+'">';
                    list += '   <div class="film_infos">';
                    list += '       <div class="film_img">'
                    list += '           <a class="filmTitle-'+film.id+'  title="Voir la fiche du film '+film.title+'"><img src="'+film.img+'" alt="'+film.title+' "/></a> ';
                    list += '       </div>';
                    list += '       <div class="film_desc">';
                    list += '           <h3>';
                    list += '               <a class="filmDesc-'+film.id+'" title="Voir la fiche du film '+film.title+'">'+film.title+'</a>';
                    list += '          </h3>';
                    list += '          <div class="film_desc_text">';
                    list += '              <b>Durée:</b> '+film.duration+' ';
                    list += '              <b>Date de Sortie:</b>'+film.releaseDate+'<br> ';
                    list += '              Réalisé par <b>'+film.director +'</b><br> ';
                    list += '              Avec <b>'+film.actor +'</b><br> ';
                    list += '              Nationalité: '+film.nationality +' <br> ';
                    list += '          </div>';
                    list += '       </div>';
                    list += '   </div>';
                    list += '   <div class="film-week">';
                    list += '       <button class="film-day Wed"> Mercredi</button>';
                    list += '       <button class="film-day Thu"> Jeudi</button>';
                    list += '       <button class="film-day Fri"> Vendredi</button>';
                    list += '       <button class="film-day Sat"> Samedi</button>';
                    list += '       <button class="film-day Sun"> Dimanche</button>';
                    list += '       <button class="film-day Mon"> Lundi</button>';
                    list += '       <button class="film-day Tue"> Mardi</button>';
                    list += '   </div>';
                    list += '   <div class="film-seance">';
                    list += '       <div id="filmHoraires-'+film.id+'" class="film-horaires">';
                    /// here the reservation buttons will be added to this section
                    list += '       </div>';
                    list += '       <div class="reservationArea"></div>';
                    list += '   </div>';
                    list += '</div><br>';

                }
            }
        }
        // Add the list to the DOM
        mosaic.append(list);

        // Add the Film Horaires button
        movieController.refreshFilmHorairesButton();

        // show the right selection
        movieController.loadBehaviours();
    },
    loadBehaviours : function()
    {
        // when we clique on a day -> it highlights the right day buttons
        jQuery('.Wed').click(function () { movieController.showOneSelectedDay(0)});
        jQuery('.Thu').click(function () { movieController.showOneSelectedDay(1)});
        jQuery('.Fri').click(function () { movieController.showOneSelectedDay(2)});
        jQuery('.Sat').click(function () { movieController.showOneSelectedDay(3)});
        jQuery('.Sun').click(function () { movieController.showOneSelectedDay(4)});
        jQuery('.Mon').click(function () { movieController.showOneSelectedDay(5)});
        jQuery('.Tue').click(function () { movieController.showOneSelectedDay(6)});
        // when we press a horaire button

        jQuery('.film-horaire-btn').click(function(){
            //alert('Reservation '+jQuery(this).attr('index'));
            var selection = jQuery(this).parent().parent().find('div.reservationArea');
            reservationController.injectBookingForm(selection,jQuery(this).attr('index'));
        })
        // the image and the title are clickable
        movieController.filmPackToBeAdded.forEach( fid => {
            jQuery('.filmTitle-'+fid).add('.filmDesc-'+fid).click(function(){
                    movieController.showFilmDesc(fid);
                });
        });
    },
    showOneSelectedDay : function(dayNumber)
    {
        reservationController.deleteAllReservationArea();
        movieController.selectedDayIndex = dayNumber;
        movieController.refreshFilmHorairesButton();
        movieController.loadBehaviours();
    },
    refreshFilmHorairesButton : function()
    {
        // Empty the area
        jQuery('.film-horaires').empty();
        // then we fill the table of time tables
        for(let i = 0 ; i < movieController.horaires.length ; i++)
        {
            let h = movieController.horaires[i];
            // if this is the right day selected
            // and if this is the right week selected
            if(h.dayIndex === movieController.selectedDayIndex && 
               h.weekIndex ==  movieController.selectedWeekIndex)
            {
                //let dateAndTime = h.horaireTmsp.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
                let voText = ' ('+h.vo+')';
                if(h.vo === 'VOST')
                {
                    voText = ' ('+h.vo+' - '+h.version+')';
                } 
                // Sometimes there is no jQuery filmHoraires element found 
                // -> due to the DATE CONTROL, if the film has not been added previously into the list
                jQuery('#filmHoraires-'+h.filmId).append('<button id="horaire-'+i+'" index="'+i+' "class="film-horaire-btn" title="Réserver">'+voText+' '+h.horaireToShow+'</button>');
                
            }
        }
        // if there is no timetable for that day, then we add a message 'Sorry no movie'
        jQuery('.film-horaires:not(:has(button))').wrapInner("<div class='nodata'>... Pas séance prévue ...</div>");
        
        // Highlight
        movieController.highlightTheRightSelection();
        movieController.deactivatePastDays();

    },
    highlightTheRightSelection: function()
    {
        let day = tlrUtil.getDayIndex(movieController.selectedDayIndex);
        jQuery('.film-day').removeClass("active");
        jQuery('.film-horaire-btn').removeClass("active");
        jQuery('.'+day).addClass("active");
        jQuery('.film-horaire-btn').addClass("active");
    },
    deactivatePastDays : function() 
    {
        // only if we are pointing to the current week
        if(movieController.selectedWeekIndex === 0)
        {
            // then there are days off
            for(let i = tlrUtil.getDayNumber()-1; i >= 0; i--)
            {
                jQuery('.'+tlrUtil.getDayIndex(i)).prop('disabled', true)
            }
        }
    },
    manageSelectedDayIndex: function()
    {
        if(movieController.selectedWeekIndex === 0){
            movieController.selectedDayIndex = tlrUtil.getDayNumber();
        } else
        {
            movieController.selectedDayIndex = 0;
        }
    },
    showFilmDesc: function(filmId)
    {
        movieController.injectFilmDesc();
        let cancelButton = document.getElementById("back");
        cancelButton.style.cursor = "pointer";
        cancelButton.addEventListener("click", function () { movieController.renderList(); }, false);
        let film = movieController.films.get(filmId);
        let filmDesc = document.getElementById("filmDescription");
        let img = document.createElement("img");
        img.src = film.img;
        img.style.float = "left";
        let filmInfo = document.createElement("div");
        filmInfo.style.float = "right";
        /// le lien
        let lien = document.createElement("p");
        let a = document.createElement('a');
        a.href = film.video;
        a.innerText = "Cliquez ici pour voir la bande annonce";
        a.target = "_blank";
        lien.appendChild(a);
        // le descriptif
        let infos = document.createElement("p");
        infos.innerHTML =   "<b>Titre :</b> " + film.title + '\n' + "<br>" +
                            "<b>Réalistateur :</b> " + film.director + '\n' +"<br>" +
                            "<b>Acteurs : </b>" + film.actor + '\n' +"<br>" +
                            "<b>Synopsis : </b>" + film.sumup +'\n' +"<br>" +
                            "<b>Année de production : </b>" + film.prodYear + '\n' +"<br>" +
                            "<b>Date de sortie : </b>" + film.releaseDate + '\n' +"<br>" +
                            "<b>Durée : </b>" + film.duration + '\n' +"<br>" +
                            "<b>Nationalité : </b>" + film.nationality + '\n' + "<br>";
        filmDesc.appendChild(img);
        filmDesc.appendChild(lien);
        filmInfo.appendChild(infos);
        filmDesc.appendChild(filmInfo); 
    },
    showDay: function (index, filmId, elementId, week, buttonId) 
    {
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

    }
}