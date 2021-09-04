<?php

/**
 * Fired during plugin activation
 *
 * @since      1.0.0
 *
 * @package    WP_Allocine
 * @subpackage WP_Allocine/includes
 */

/**
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation.
 *
 * @since      1.0.0
 * @package    WP_Allocine
 * @subpackage WP_Allocine/includes
 * @author     Aurélien Vita aurelien.vita@solidarcom.fr
 */

class WP_Allocine_Rest_Api 
{

    public $table_name;
    /**
     * WP_Allocine_Rest_Api constructor.
     */
    public function __construct()
    {
        global $wpdb;
        $this->table_name =  $wpdb->prefix . 'allocine_reservations';
    }


    /**
     * Function servant à l'enregistrement de nos routes Rest
     */
    public function register_rest_route() {
        add_action( 'rest_api_init', function () {
            register_rest_route( 'allocine', '/reservation/add', array(
                    'methods' => 'POST',
                    'callback' => array($this, 'addReservation'),
                )
            );
            register_rest_route( 'allocine', '/reservation/list', array(
                    'methods' => 'GET',
                    'callback' => array($this, 'listReservations'),
                )
            );
            register_rest_route( 'allocine', '/reservation/remove', array(
                    'methods' => 'DELETE',
                    'callback' => array($this, 'removeReservation'),
                )
            );

        });

    }


    /**
     * http://wordpress.local/wp-json/allocine/reservation/add
     *
     * Ajoute une réservation pour une séance donnée
     * (une séance étant définie par un filmId + un horaire)
     *
     * @param $request_data WP_Rest_Request
     * @return string
     * @throws Exception
     */
    public function addReservation(WP_REST_Request $request_data) {

        //TODO : Envoyer un mail de confirmation à l'admin et à l'utilisateur

        $response = [];
        $allocineRepository = new WP_Allocine_Repository();

        // Regex servant à vérifier la validité d'une adresse mail
        $clientEmailRegX = '/(?:[a-z0-9!#$%&\'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+\/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/i';

        $filmId = $request_data->get_param('film_id');
        $filmTitle = $request_data->get_param('film_title');
        $diffusionTmsp = $request_data->get_param("diffusion_tmsp");
        $clientName = $request_data->get_param("client_name");
        $clientEmail = $request_data->get_param("client_email");
        $reservedPlace = $request_data->get_param("reserved_place");
        $dateDiffusionTmsp = new DateTime($diffusionTmsp);

        // Vérification des paramètres rentrés (réservation >=1, date valide, email valide, ...)
        if( !isset($filmId)
            || !isset($diffusionTmsp) || strtotime($diffusionTmsp) < strtotime("now")
            || !isset($clientName) || strlen($clientName) == 0
            || !isset($filmTitle) || strlen($filmTitle) == 0
            || !isset($clientEmail) || !preg_match($clientEmailRegX, $clientEmail)
            || !isset($reservedPlace) || $reservedPlace <= 0 ) {
            $response = [
                "code" => 400,
                "message" => __( "Paramètres invalides", 'wp-allocine' )
            ];
            return new WP_Rest_Response($response, $response["code"]);
        }
        try{
            global $wpdb;
            // On récupère le nombre de réservation pour une séance donnée
            $nbReservations = $allocineRepository->getNbReservations($filmId, $diffusionTmsp);

            if($nbReservations > MAX_USERS_RESERVATION)
            {
                $response = [
                    "code" => 400,
                    "message" => __( "Aucune disponibilité restante.", 'wp-allocine' )
                ];
                return new WP_Rest_Response($response, $response["code"]);
            }

            // On vérifie si une réservation existe avec l'adresse mail saisie
            // Si oui, on met à jour la réservation
            // Sinon, on ajoute la nouvelle réservation
            $existingReservation = $allocineRepository->getReservation($filmId,$diffusionTmsp,$clientEmail);
            if(empty($existingReservation)) {
                $reservation = $wpdb->insert($this->table_name, array(
                    'film_id' => $filmId,
                    'film_title' => $filmTitle,
                    'diffusion_tmsp' => $dateDiffusionTmsp->format("Y-m-d H:i:s"),
                    'client_name' => $clientName,
                    "client_email" => $clientEmail,
                    "reserved_place" => $reservedPlace
                ));
            }
            else{
                $reservation = $wpdb->update($this->table_name, array(
                    'id' => $existingReservation->id,
                    'film_id' => $filmId,
                    'film_title' => $filmTitle,
                    'diffusion_tmsp' => $dateDiffusionTmsp->format("Y-m-d H:i:s"),
                    'client_name' => $clientName,
                    "client_email" => $clientEmail,
                    "reserved_place" => $reservedPlace
                ),
                    array('id' => $existingReservation->id) );
            }

           // Si la réservation n'a pas pu être mis à jour ou ajoutée
            if($reservation === false) {
                throw new Exception();
            }
            else{
                // On retourne le nbr de réservations restantes
                $nbPlacesLeft = MAX_USERS_RESERVATION - ($nbReservations + $reservedPlace);

                return new WP_Rest_Response([
                   "code" => 200,
                   "message" => empty($existingReservation) ? "created" : "updated",
                   "data" => [
                       "id" => empty($existingReservation) ? $wpdb->insert_id : $existingReservation->id,
                       "nb_places_left" => $nbPlacesLeft
                   ]
                ]);
            }
        }
        catch(Exception $e)
        {
            $response = [
                "code" => 400,
                "message" => __( "Impossible d'ajouter la réservation.", 'wp-allocine' )
            ];
            return new WP_Rest_Response($response, $response["code"]);
        }
    }

    /**
     * Retourne la liste de toutes les réservations à venir
     * http://wordpress.local/wp-json/allocine/reservation/list
     * @param WP_REST_Request $request_data
     * @return string
     */
    public function listReservations(WP_REST_Request $request_data) {
        //TODO : https://stackoverflow.com/questions/42381521/how-to-get-current-logged-in-user-using-wordpress-rest-api

        $response = [];
        $allocineRepository = new WP_Allocine_Repository();

        try{
            $reservations = $allocineRepository->findReservations();
            return $reservations;
        }
        catch(Exception $e)
        {
            $response = [
                "code" => 400,
                "message" => __( "Impossible de récupérer les réservations.", 'wp-allocine' )
            ];
            return new WP_Rest_Response($response, $response["code"]);
        }
    }


        /**
     * Enlève une réservation qui correspond à la personne, au film_id et au diffusion_tmsp
     * http://wordpress.local/wp-json/allocine/reservation/remove
     * @param WP_REST_Request $request_data
     * @return string
     */
    public function removeReservation(WP_REST_Request $request_data) {
        //TODO : https://stackoverflow.com/questions/42381521/how-to-get-current-logged-in-user-using-wordpress-rest-api
        $res = [];
        $response = [];
        $allocineRepository = new WP_Allocine_Repository();

        $clientEmail = $request_data->get_param('client_email');
        $filmId = $request_data->get_param('film_id');
        $diffusionTmsp = $request_data->get_param("diffusion_tmsp");

        if(    !isset($clientEmail)
            || !isset($filmId)
            || !isset($diffusionTmsp)) {
                $response = [
                    "code" => 400,
                    "message" => __( "Paramètres invalides", 'wp-allocine' )
                ];
                return new WP_Rest_Response($response, $response["code"]);
        }
        $res = $allocineRepository->removeReservation($clientEmail,$filmId,$diffusionTmsp);
        return $res;
    }
}
