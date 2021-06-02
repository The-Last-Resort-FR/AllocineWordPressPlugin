// let testVar = 'passed';
// let xmlContent = '';
let tableFilms = document.getElementById('filmstab');
// fetch(xmlLocation, {mode : 'no-cors'}).then((response)=> {
//     response.text().then((xml)=>{
//         xmlContent = xml;
//         console.log(xmlContent);
let parser = new DOMParser();
let xmlDOM = parser.parseFromString(acp.xmlContent, 'application/xml');
let films = xmlDOM.querySelectorAll('films');

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
        tableFilms.children[1].appendChild(row);

        td = document.createElement('td');
        td.innerText = film.getAttribute('synopsis');
        row.appendChild(td);
        tableFilms.children[1].appendChild(row);

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
        tableFilms.children[1].appendChild(row);
    });


});
        
//     });
// });

