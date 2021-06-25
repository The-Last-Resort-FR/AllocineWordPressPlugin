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

    /**
     * Function servant à l'enregistrement de nos routes Rest
     */
    public function register_rest_route() {
        add_action( 'rest_api_init', function () {
            register_rest_route( 'allocine', '/reservation/add', array(
                    'methods' => 'GET',
                    'callback' => array($this, 'addReservation'),
                )
            );
        });

    }

    /**
     * @param $key
     */
    public function getReservations($key) {

    }

    /**
     * http://wordpress.local/wp-json/allocine/reservation/add
     * @param $request_data WP_Rest_Request
     * @return string
     */
    public function addReservation($request_data) {
        //TODO : On va chercher toutes les réservations pour une seance donnée.
        $response = [];

        $id = $request_data->get_param('id');
        $filmKey = $request_data->get_param('film_key');
        $filmId = $request_data->get_param('film_id');
        $diffusionDate = $request_data->get_param("diffusion_date");
        $clientName = $request_data->get_param("client_name");
        $clientEmail = $request_data->get_param("client_email");
        $reservedPlace = $request_data->get_param("reserved_place");


        try{
            global $wpdb;
            //$table_name = $wpdb->prefix . 'my_table';
            //$wpdb->insert($table_name, array('column_1' => $data_1, 'column_2' => $data_2, //other columns and data (if available) ...));
        }
        catch(Exception $e)
        {
            $response = [
                "code" => 401,
                "message" => "Impossible d'ajouter la réservation"
            ];
            return new WP_Rest_Response($response["message"], $response["code"]);

        }

    }
}
