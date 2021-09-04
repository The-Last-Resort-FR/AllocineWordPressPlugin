<?php

/**
 * Class WP_Allocine_Repository
 * Classe servant pour gérer les accés à la base de donnée.
 */
class WP_Allocine_Repository {

    public $table_name;

    /**
     * WP_Allocine_Repository
     */
    public function __construct()
    {
        global $wpdb;
        $this->table_name =  $wpdb->prefix . 'allocine_reservations';
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


    /**
     * Retourne toutes les réservations pour un film donné
     * @param $filmId
     * @param $diffusionTmsp
     * @return int
     * @throws Exception
     */
    public function findReservationsBySeance($filmId, $diffusionTmsp) {
        try{
            global $wpdb;
            $sql = $wpdb->prepare(
                "SELECT * FROM {$this->table_name}
              WHERE film_id = %s AND diffusion_tmsp = %s;
              ",
                [$filmId, $diffusionTmsp]

            );
            $results = $wpdb->get_results($sql);

            return $results;
        }
        catch(Exception $e)
        {
            throw new Exception();
        }
    }

    /**
     * Retourne toutes les réservations futures ou en cours de validité
     * @param $filmId
     * @param $diffusionTmsp
     * @return int
     * @throws Exception
     */
    public function findReservations() {
        try{
            global $wpdb;

            $sql = $wpdb->prepare(
                "SELECT * FROM {$this->table_name}
              WHERE  diffusion_tmsp >= NOW();
              ");
            $results = $wpdb->get_results($sql);

            return $results;
        }
        catch(Exception $e)
        {
            throw new Exception();
        }
    }

     /**
     * Remove la réservation 
     * @param $filmId
     * @param $diffusionTmsp
     * @return int
     * @throws Exception
     */
    public function removeReservation($clientEmail, $filmId, $diffusionTmsp) {
        try{
            global $wpdb;
            $sql = $wpdb->prepare(
                "DELETE FROM {$this->table_name}
              WHERE film_id = %s AND diffusion_tmsp = %s AND client_email = %s;
              ",
                [$filmId, $diffusionTmsp, $clientEmail]
            );
            $results = $wpdb->query($sql);
            return $results;
        }
        catch(Exception $e)
        {
            throw new Exception();
        }
    }

}
