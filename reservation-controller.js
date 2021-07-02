jQuery('document').ready(function () {

    reservationController.init();
});

var reservationController =
{

    bookingUrl: 'http://localhost/wp-json/allocine/reservation/add',
    reservedUrl: 'http://localhost/wp-json/allocine/reservation/get',
    selectedHoraire: '',
    selectedFilmId: '',

    init: function () {

    },
    deleteAllReservationArea: function(){
        // we delete all the reservation Areas meant to be used for reservation form injection
        jQuery('.reservationArea').empty();
    },
    injectBookingForm : function(selection, horaireIndex){

        reservationController.selectedHoraire = movieController.horaires[parseInt(horaireIndex)];
        reservationController.selectedFilmId = reservationController.selectedHoraire.filmId;
        let selectedFilm= movieController.films.get(reservationController.selectedHoraire.filmId);


        this.deleteAllReservationArea();

        let form =  '<div id="bookingForm">';
         form += '   <fieldset>';
         form += '      <legend>Reserver:<b>'+selectedFilm.title+'</b> pour le '+reservationController.selectedHoraire.horaireToShow+'</legend>'
         form += '      <label for="clientName">Nom</label><br>';
         form += '      <input type="text" name="clientName"></input><br>';
         form += '      <label for="clientEmail">Email</label><br>';
         form += '      <input type="text" name="clientEmail"></input><br>';
         form += '      <label for="clientEmail">Nombre de places</label><br>';
         form += '      <select name="nbPlace">';
         form += '          <option value="1">1</option>';
         form += '          <option value="2">2</option>';
         form += '          <option value="3">3</option>';
         form += '          <option value="4">4</option>';
         form += '          <option value="5">5</option>';
         form += '          <option value="6">6</option>';
         form += '      </select>';
         form += '      <button id="sendReservation">Réserver</button>';
         form += '   </fieldset>';
         form += '</div>';

        selection.append(form);

        reservationController.loadBehaviours();
        reservationController.scrollToTheRightPlace();
    },

    scrollToTheRightPlace: function(){
        jQuery('html,body').animate({scrollTop: jQuery('#bookingForm').top},'slow');
    },
    loadBehaviours: function(){

        jQuery('#sendReservation').click(function(){

            let formParams = new Object();
            formParams.client_name = jQuery('input[name="clientName"]').val();
            formParams.client_email = jQuery('input[name="clientEmail"]').val();
            formParams.reserved_place = parseInt(jQuery('select[name="nbPlace"]').val());
            formParams.film_id = reservationController.selectedFilmId;
            formParams.diffusion_tmsp = reservationController.selectedHoraire.horaireToShow;
            let created_on = moment(new Date().toISOString(), "YYYY-MM-DDTHH:mm:ss.z");
            formParams.created_on = created_on.format("YYYY-MM-DD HH:mm:SS");
            console.log(formParams.created_on);
            // On formate la date avec MomentJS
            let diffusion_tmsp_date = moment(reservationController.selectedHoraire.horaireToShow, "DD-MM-YYYY HH:mm")
            formParams.diffusion_tmsp = diffusion_tmsp_date.format("YYYY-MM-DD HH:mm:SS");

            jQuery.ajax({
                type: 'POST',
                // link to save up the
                url: reservationController.bookingUrl,
                data: formParams,
                dataType: "JSON",
                success: function(resultat, statut){
                    alert('Saved');
                    jQuery('.reservationArea').empty();
                },
                error : function(resultat, statut, erreur){
                    alert(resultat.responseJSON.message);
                },
                complete: function ()
                {

                }
            });

        })
    },
    showBooking: function(selection, horaireIndex){
        let reqData = new Object();
        reservationController.selectedHoraire = movieController.horaires[parseInt(horaireIndex)];
        reqData.film_Id = reservationController.selectedHoraire.filmId;
        let diffusion_tmsp_date = moment(reservationController.selectedHoraire.horaireToShow, "DD-MM-YYYY HH:mm")
        reqData.diffusion_tmsp = diffusion_tmsp_date.format("YYYY-MM-DD HH:mm:SS");
        reqData.pwd_hash = movieController.pwdHash;
        let res = [];

        this.deleteAllReservationArea();

        jQuery.ajax({
            type: 'GET',
            // get the reservation
            url: reservationController.reservedUrl,
            data: reqData,
            dataType: "JSON",
            success: function(resultat, statut){
                if(resultat.code != 200)
                {
                    alert(resultat.message);
                    return;
                }

                jQuery('.reservationArea').empty();
                let div = document.createElement("div");
                div.style.border = "2px solid";
                div.innerText = "reservation : ";
                resultat.forEach(row => {
                    if (row.film_id == reqData.film_Id)
                    {
                        let display = document.createElement("p");
                        display.innerText = row.diffusion_tmsp + " | " +  row.client_name + " | " + row.client_email + " | " + row.reserved_place + "\n";
                        div.append(display);
                    }
                });
                let mosaic = document.getElementById("mosaic");
                mosaic.append(div);
            },
            error : function(resultat, statut, erreur){
                alert(resultat.message);
            },
            complete: function ()
            {

            }
        });



        //console.log(diffusion_tmsp + " " + reservationController.selectedFilmId);
        let list = document.createElement("div");
        selection.append(list);
    }
}
