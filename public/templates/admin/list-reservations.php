
<div>
    <h3>Liste des réservations établies à partir du site</h3>
    <label for="seances">Sélectionnez la scéance pour laquelle des reservations ont été enregistrées</label>
    <br>
	<select name="seances" id="seance-selection">
	</select>
	<ul>
	</ul>
	<table class="reservation-table">
	    <thead>
	        <tr>
	            <th colspan="4">RÉSERVATIONS</th>
	        </tr>
	    </thead>
	    <tbody>
	        <tr id="film-tr">
	        </tr>
	    </tbody>
	</table>
	<h3 id="total"></h3>
</div>

<script>
jQuery('document').ready(function () {
    reservationAdminController.init();
});

var reservationAdminController = {

	listUrl: document.location.origin + '/wp-json/allocine/reservation/list',
	removeUrl: document.location.origin + '/wp-json/allocine/reservation/remove',
    films : new Map(),
    selectedSeance: '',
    nbReservations: 0,
    init : () => {

    	this.films = new Map();
    	this.selectedSeance = '---';
    	this.nbReservations = 0;
		reservationAdminController.loadData();
		reservationAdminController.loadBehaviours();

	},
	loadData: () => {
		reservationAdminController.films = new Map();
    	reservationAdminController.nbReservations = 0;
		jQuery.ajax({
                type: 'GET',
                // link to save up the
                url: reservationAdminController.listUrl,
                success: function(resultat, statut){
                    reservationAdminController.loadReservationList(resultat);
                },
                error : function(resultat, statut, erreur){
                    alert('Le système ne peut pas retrouver les reservations');
                },
                complete: function ()
                {
                	reservationAdminController.showReservationOptions();
                	reservationAdminController.showReservationList();
                }
            });
	},
	loadBehaviours: function () {
		jQuery("#seance-selection").change( function(sel) {
			reservationAdminController.selectedSeance = sel.target.value;
			reservationAdminController.showReservationList();
		})
	},
	loadReservationList: function (resultat) {

		resultat.forEach( function (res) {
			let key = res.diffusion_tmsp +'*'+res.film_id+'*'+res.film_title;
			if(!reservationAdminController.films.has(key)){
				reservationAdminController.films.set(key, [res]);
			} else {
				let otherRes = reservationAdminController.films.get(key);
				reservationAdminController.films.set(key, otherRes.concat(res));
			}
		});
	},
	showReservationOptions: function () {
		jQuery("#seance-selection").empty();
		reservationAdminController.films.forEach((seance, key) => {
			let parts = key.split('*');
			jQuery("#seance-selection").append('<option value="'+key+'">'+parts[0]+' -> '+parts[2]+'</option>');
		});
		reservationAdminController.selectedSeance = jQuery("#seance-selection option:selected").val();
	},
	showReservationList:  function() {

		jQuery("#film-tr").empty();
		ajout = "";
		index = 0;
		reservationAdminController.nbReservations = 0;
		reservationAdminController.films.forEach((seance, key) => {

			if(key === reservationAdminController.selectedSeance)
			{
				seance.forEach((resa) => {
					index++;
					id = 'btn'+index;
					ajout = '<tr><td>'+resa.client_name+'<td>';
					ajout += '<td>'+resa.client_email+'<td>';
					ajout += '<td>'+resa.reserved_place+'<td>';
					ajout += '<td><a id="'+id+'" email="'+resa.client_email+'">Supprimer</a><td></tr>';
					reservationAdminController.nbReservations = reservationAdminController.nbReservations +parseInt(resa.reserved_place);
					jQuery("#film-tr").append(ajout);
					jQuery('#'+id).click( function() {
						reservationAdminController.removeReservation(jQuery(this).attr('email'));
					});
				});
			}
		});

		jQuery("#total").text('Total des places réservées pour cette séance: '+reservationAdminController.nbReservations);
	},
	removeReservation: function (client_email){

		let parts = reservationAdminController.selectedSeance.split("*");
		let formParams = new Object();
            formParams.client_email = client_email;
            formParams.film_id = parts[1];
            formParams.diffusion_tmsp = parts[0];

		jQuery.ajax({
                type: 'DELETE',
                // link to save up the
                url: reservationAdminController.removeUrl,
                data: formParams,
                success: function(resultat, statut){
                    //alert('Removed');
                },
                error : function(resultat, statut, erreur){
                    //alert('Not removed');
                },
                complete: function ()
                {
                	reservationAdminController.loadData();
                }
            });

	}


}
 </script>
