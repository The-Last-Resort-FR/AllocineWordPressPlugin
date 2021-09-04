<?php

/**
 * Classe utilitaire pour les fonctions réutilisables dans le code
 *
 * A class definition that includes attributes and functions used across both the
 * public-facing side of the site and the admin area.
 *
 * @link       https://solidarcom.fr
 * @since      1.0.0
 *
 */

class AVTools
{
    // remove line breaks from a string to avoid issues with wpautop
    public static function remove_line_breaks( $string ) {
        $string = str_replace( array( "\r", "\n" ), '', $string);
        return $string;
    }


    /**
     * Fonction permettant d'accéder à un paramètre des settings de WP_Allocine
     * @param $key
     * @return bool|mixed
     */
    public static function settings( $key ) {
        $settings = get_option( 'wp_allocine_settings' );
        if( !is_array($settings) ) {
            return false;
        }
        return $settings[$key];
    }

}
