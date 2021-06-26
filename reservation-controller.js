jQuery('document').ready(function () {

    reservationController.init();
});

var reservationController = 
{
    
    bookingUrl: 'http://localhost:8888/sitevox/wp-json/allocine/reservation/add',
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
            formParams.clientName = jQuery('input[name="clientName"]').val();
            formParams.clientEmail = jQuery('input[name="clientEmail"]').val();
            formParams.nbPlace = parseInt(jQuery('select[name="nbPlace"]').val());
            formParams.filmId = reservationController.selectedFilmId;
            formParams.horaire = reservationController.selectedHoraire.horaireToShow;
            jQuery.ajax({
                type: 'POST',
                // link to save up the 
                url: reservationController.bookingUrl, 
                data: formParams,
                success: function(resultat, statut){
                    alert('Saved');
                    jQuery('.reservationArea').empty();
                },
                error : function(resultat, statut, erreur){
                    alert('Not saved');
                },
                complete: function ()
                {
                    
                }
            });

        })
    }
}