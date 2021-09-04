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
class WP_Allocine_Activator
{

    public static function activate()
    {
        // On ajoute une option de type "wp_allocine" avec le numéro de version
        // Si elle existe pas, le plugin est utilisé pour la première fois.

        if (!get_option('wp_allocine')) { // first time use
            // create a table for cache
            global $wpdb;
            $charset_collate = $wpdb->get_charset_collate();
            $table_name = $wpdb->prefix . 'allocine_reservations';

            $sql = "CREATE TABLE IF NOT EXISTS $table_name (
                    `id`            int NOT NULL AUTO_INCREMENT PRIMARY KEY,
                     `film_id`        int NOT NULL ,
                     `film_title`        varchar(100) NOT NULL ,
                     `diffusion_tmsp` timestamp NOT NULL ,
                     `client_name`    varchar(100) NOT NULL ,
                     `client_email`   varchar(45) NOT NULL ,
                     `reserved_place` int NOT NULL 
               ) $charset_collate;";

            require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
            dbDelta($sql);
        }

        // Si l'option contenant les propriétés de WP_Allocine n'existe pas, on préremplit les réglages
        // (1ère utilisation
        if( ! get_option( 'wp_allocine_settings' ) ) {
            $options = [];
            $options['wp_allocine_max_users_reservation'] = 70;
            $options['wp_allocine_api_url'] = "https://api.levox.fr/allocineseances.xml";
            add_option('wp_allocine_settings', $options);
        }


            // On ajoute une option pour stocker la version du plugin dans les options Wordpress
        $plugin_data = get_plugin_data(__FILE__);
        add_option('wp_allocine', WP_ALLOCINE_VERSION);

    }
}
