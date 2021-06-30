<?php
/**
 * Plugin Name
 *
 * @package           Allocine Process
 * @author            The Last Resort
 * @copyright         2021 The Last Resort
 * @license           GPL-2.0-or-later
 *
 * @wordpress-plugin
 * Plugin Name:       Allocine Process
 * Plugin URI:        https://github.com/The-Last-Resort-FR/AllocineWordPressPlugin
 * Description:       Get the data from Allocine and process it into various forms
 * Version:           1.1.2
 * Requires at least: 5.2
 * Requires PHP:      7.2
 * Author:            The Last Resort
 * Author URI:        https://github.com/The-Last-Resort-FR
 * Text Domain:       wp-allocine
 * Languages : /languages
 * License:           GPL v2 or later
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
*/

// Exit if not called by WordPress
if (!defined('ABSPATH'))
{
    exit;
}


/**
 * Version actuelle du plugin
 */
define( 'WP_ALLOCINE_VERSION', '1.1.2' );
/**
 * Nombre maximum de réservations possible au sein d'une salle du Vox
 */
define( 'MAX_USERS_RESERVATION', 50 );

/**
 * Cette fonction definit le code qui sera lancé à l'activation du plugin
 */
function activate_wp_allocine() {
    require_once plugin_dir_path( __FILE__ ) . 'includes/class-wp-allocine-activator.php';
    WP_Allocine_Activator::activate();

}

/**
 * Cette fonction definit le code qui sera lancé à la désactivation du plugin
 */
function deactivate_wp_allocine() {
    require_once plugin_dir_path( __FILE__ ) . 'includes/class-wp-allocine-deactivator.php';
    WP_Allocine_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'activate_wp_allocine' );
register_deactivation_hook( __FILE__, 'deactivate_wp_allocine' );


/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path( __FILE__ ) . 'includes/class-wp-allocine.php';

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    1.1.2
 */
function run_wp_allocine() {

    $plugin = new WP_Allocine();
}
run_wp_allocine();




function acp_get_xml_info()
{

	return apply_filters(
		'acp_xml_infos',
		array()
	);

}


// build the array
function acp_make_xml_infos( $XMLI )
{

	$XMLI = array(
		'id'                => 'xml_url',
		'label'             => __( 'XML URL', 'allocine-process' ),
		'class'             => 'XML',
		'description'       => __( 'Entrer l\'url du fichier xml ', 'allocine-process' ),
		'priority'          => 10,
		'type'              => 'text',
		'default'           => '',
		'sanitize_callback' => 'sanitize_text_field',
	);
	return $XMLI;

}

add_filter( 'acp_xml_infos', 'acp_make_xml_infos', 10, 1 );

// add the entry to the wp customize menu
function acp_xml_customizer_settings( $wp_customize )
{

    $xml_infos = acp_get_xml_info();

    if ( ! empty( $xml_infos ) ) {
		$wp_customize->add_section(
            'allocine_process',
            array(
                'title'          => __( 'URL du fichier XML Allociné' ),
                'priority'       => 160,
                'capability'     => 'edit_theme_options',
            )
		);
    }

    $wp_customize->add_setting(
        $xml_infos['id'],
        array(
            'default'           => '',
            'sanitize_callback' => $xml_infos['sanitize_callback'],
        )
    );

    $wp_customize->add_control(
        $xml_infos['id'],
        array(
            'type'        => $xml_infos['type'],
            'priority'    => $xml_infos['priority'],
            'section'     => 'allocine_process',
            'label'       => $xml_infos['label'],
            'description' => $xml_infos['description'],
        )
    );
}

add_action( 'customize_register', 'acp_xml_customizer_settings' );

// register the script for the shortcode
function acp_scripts() {
    wp_enqueue_script('jquery');
    //wp_register_script("make-html", plugin_dir_url( __FILE__ ) . '/make-html.js', array(), '1.0.0', true);
    //wp_enqueue_script( "make-html");
    wp_register_script("tlr-utilities", plugin_dir_url( __FILE__ ) . '/tlr-utilities.js', array(), '1.0.0', true);
    wp_enqueue_script( "tlr-utilities");
    wp_register_script("movie-controller", plugin_dir_url( __FILE__ ) . '/movie-controller.js', array(), '1.0.0', true);
    wp_enqueue_script( "movie-controller");
    wp_register_script("momentjs", "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js", array(), '2.29.1', true);
    wp_enqueue_script( "momentjs");
    wp_register_script("reservation-controller", plugin_dir_url( __FILE__ ) . '/reservation-controller.js', array(), '1.0.0', true);
    wp_enqueue_script( "reservation-controller");
    wp_enqueue_style("list", plugin_dir_url( __FILE__ ) . '/list.css', array(), '1.0.0', 'all');
    //wp_enqueue_style("make-html");
}
add_action( 'wp_enqueue_scripts', 'acp_scripts' );


// function called by the shortcode
function acp_shortcode_call()
{
    $XML = acp_get_xml_info();
    $data = file_get_contents(get_theme_mod($XML['id']));
    //wp_localize_script('make-html', 'acp', array(
    //    'xmlContent'=> $data,
    //    )
    //);
    wp_localize_script('movie-controller', 'acp', array(
        'xmlContent'=> base64_encode($data),
        )
    );

    return file_get_contents("list.html", true);
}

add_shortcode('acpsc', 'acp_shortcode_call');
