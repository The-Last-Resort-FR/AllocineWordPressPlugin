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

class WP_Allocine_Rest_Api {

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
            register_rest_route( 'allocine', '/reservation/get', array(
                'methods' => 'GET',
                'callback' => array($this, 'getReservationList'),
                )
            );
        });

    }

    /**
     * Retourne une clé unique d'identification d'une séance pour un film donné
     *
     * @param $filmId Identifiant du film
     * @param $diffusionTmsp Timestamp de la diffusion
     * @return string Clé unique
     */
    public function getSeanceKey($filmId, $diffusionTmsp)
    {
        return $filmId . "_" . "$diffusionTmsp";
    }

    /**
     * Retourne une réservation pour un film, une date et un mail donné
     * @param $filmId
     * @param $diffusionTmsp
     * @param $email
     * @return
     * @throws Exception
     */
    public function getReservation($filmId, $diffusionTmsp, $mail) {
        try{
            global $wpdb;
            $sql = $wpdb->prepare(
                "SELECT *  FROM {$this->table_name}
              WHERE film_id = %s AND diffusion_tmsp = %s AND client_email = %s;
              ",
                [$filmId, $diffusionTmsp, $mail]

            );
            $results = $wpdb->get_row($sql);

            return $results;
        }
        catch(Exception $e)
        {
            throw new Exception();
        }
    }

    /**
     * Retourne le nombre de réservation pour une séance donnée (filmKey = concaténation filmId et dateDiffusion)
     * @param $filmId Identifiant du film
     * @param $diffusionTmsp Date de diffusion du film
     * @return int Nombre de réservations
     * @throws Exception
     */
    public function getNbReservations($filmId, $diffusionTmsp) {
        try{
            global $wpdb;
            $sql = $wpdb->prepare(
              "SELECT SUM(reserved_place) AS nbReservations FROM {$this->table_name}
              WHERE film_id = %s AND diffusion_tmsp = %s;
              ",
                [$filmId, $diffusionTmsp]

            );
            $results = $wpdb->get_row($sql);

            return intval($results->nbReservations);
        }
        catch(Exception $e)
        {
            throw new Exception();
        }
    }
    public function getReservationsList($filmId, $diffusionTmsp) {
        try{
            global $wpdb;
            $sql = $wpdb->prepare(
              "SELECT * FROM {$this->table_name}
              WHERE film_id = %s AND diffusion_tmsp = %s;
              ",
                [$filmId, $diffusionTmsp]

            );
            $results = $wpdb->get_row($sql);
            error_log($results->num_rows);
            return $results;
        }
        catch(Exception $e)
        {
            throw new Exception();
        }
    }

    /**
     * http://wordpress.local/wp-json/allocine/reservation/add
     *
     * Ajoute une réservation pour une séance donnée
     * (une séance étant définie par un filmId + un horaire)
     *
     * @param $request_data WP_Rest_Request
     * @return string
     */
    public function addReservation($request_data) {

        //TODO : Envoyer un mail de confirmation à l'admin et à l'utilisateur

        $response = [];

        // Regex servant à vérifier la validité d'une adresse mail
        $clientEmailRegX = '/(?:[a-z0-9!#$%&\'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+\/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/i';

        $filmId = $request_data->get_param('film_id');
        $diffusionTmsp = $request_data->get_param("diffusion_tmsp");
        $clientName = $request_data->get_param("client_name");
        $clientEmail = $request_data->get_param("client_email");
        $reservedPlace = $request_data->get_param("reserved_place");

        $dateDiffusionTmsp = new DateTime($diffusionTmsp);


        // Vérification des paramètres rentrés (réservation >=1, date valide, email valide, ...)
        if(
            !isset($filmId)
            || !isset($diffusionTmsp) || strtotime($diffusionTmsp) < strtotime("now")
            || !isset($clientName) || strlen($clientName) == 0
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
            $nbReservations = $this->getNbReservations($filmId, $diffusionTmsp);

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
            $existingReservation = $this->getReservation($filmId,$diffusionTmsp,$clientEmail);
            if(empty($existingReservation)) {
                $reservation = $wpdb->insert($this->table_name, array(
                    'film_id' => $filmId,
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

    public function getReservationList($request_data) {

        $response = [];

        $pwdHash = $request_data->get_param("pwd_hash");
        if(!($pwdHash == RES_PWD_HASH))
        {
            $response = [
                "code" => 401,
                "message" => __( "L'authentification a échoué", 'wp-allocine' ),
            ];
            return $response;
        }
        
        $filmId = $request_data->get_param('film_id');
        $diffusionTmsp = $request_data->get_param("diffusion_tmsp");
        $res = $this->getReservationsList($filmId, $diffusionTmsp);
        
        if ($res->num_rows > 0)
        {
            while($row = $res->fetch_assoc()) {
                error_log("Name: " . $row["client_name"]. " - email: " . $row["client_email"]. " - nb place: " . $row["reserved_place"]);
            }
        }

        try {

        }
        catch (Exception $e) {

        }
        $response = [
            "code" => 200,
            "message" => __( "failed", 'wp-allocine' ),
            "data" => $res
        ];
        return $response;
    }
}
