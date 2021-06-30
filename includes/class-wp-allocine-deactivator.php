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
 * Fired during plugin deactivation.
 *
 * This class defines all code necessary to run during the plugin's deactivation.
 *
 * @since      1.0.0
 * @package    WP_Allocine
 * @subpackage WP_Allocine/includes
 * @author     Aurélien Vita aurelien.vita@solidarcom.fr
 */

class WP_Allocine_Deactivator {

    public static function deactivate() {
        //TODO : Supprimer les tables ajoutées au plugin ?
    }
}
