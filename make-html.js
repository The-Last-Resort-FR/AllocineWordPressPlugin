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

let tableFilms = document.getElementById('filmstab');
let parser = new DOMParser();
let xmlDOM = parser.parseFromString(acp.xmlContent, 'application/xml');
let films = xmlDOM.querySelectorAll('films');
var filmArr = [];


// Make all the rows from the XML file
films.forEach(filmsNode => {
    filmsNode.querySelectorAll('film').forEach(film => {
        let row = document.createElement('tr');

        // affiche
        let td = document.createElement('td');
        img = document.createElement('img');
        img.src = film.getAttribute('affichette');
        td.appendChild(img);
        row.appendChild(td);

        //  Titre
        td = document.createElement('td');
        td.innerText = film.getAttribute('titre');
        row.appendChild(td);

        // Réalistateur
        td = document.createElement('td');
        td.innerText = film.getAttribute('realisateurs');
        row.appendChild(td);

        // Acteurs
        td = document.createElement('td');
        td.innerText = film.getAttribute('acteurs');
        row.appendChild(td);

        td = document.createElement('td');
        td.innerText = film.getAttribute('synopsis');
        row.appendChild(td);

        td = document.createElement('td');
        td.style = "min-width: 20%;";
        td.innerText = "Année de production : " + film.getAttribute('anneeproduction') + '\n' +
            "Date de sortie : " + film.getAttribute('datesortie') + '\n' +
            "Durée : " + film.getAttribute('duree') + '\n' +
            "Nationalité : " + film.getAttribute('nationalite') + '\n';
        a = document.createElement('a');
        a.href = "http://player.allocine.fr/" + film.getAttribute('video') + ".html";
        a.innerText = "Cliquez ici pour voir la bande annonce";
        a.target = "_blank";
        td.appendChild(a);
        row.appendChild(td);

        td = document.createElement('td');
        td.innerText = film.childNodes[1].innerHTML;
        td.date = td.innerText;
        row.appendChild(td);

        filmArr.push(row);
    });


});

var i;
var dates = [];
var flag;

// Checks and remove the outdated rows
for(i = 0; i < filmArr.length; i++)
{
    dates = filmArr[i].childNodes[6].innerHTML.split(";");
    var dateStr = [];
    var dateStr2 = [];
    dates.forEach( date => {
        // Compare if the current date if earlier than the diffusion one
        if(new Date().getTime() < new Date(tlrUtil.XmlDateStringToJsDate(date)).getTime())
        {
            // Set a flag to indicate that there's still diffusion into the future
            flag = true;
        }
    })
    // If all the date are already past then delete the useless row
    if(!flag)
    {
        filmArr.splice(i, 1);
    }
}

// Remove the duplicated enties and merges the dates
for(i = 0; i < filmArr.length; i++)
{
    let j;
    for(j = 0; j < filmArr.length; j++)
    {
        if(i != j)
        {
            // Compare based on the title
            if(filmArr[i].childNodes[2].innerHTML == filmArr[j].childNodes[2].innerHTML)
            {
                filmArr[i].childNodes[6].innerHTML += ";" + filmArr[j].childNodes[6].innerHTML;
                filmArr.splice(j,1);
            }
        }
    }
}

// Output the remaining rows
filmArr.forEach(film => {
    tableFilms.children[1].appendChild(film);
});