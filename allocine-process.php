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
 * Plugin URI:        https://example.com/plugin-name
 * Description:       Get the data from Allocine and process it into various forms
 * Version:           1.0.0
 * Requires at least: 5.2
 * Requires PHP:      7.2
 * Author:            The Last Resort
 * Author URI:        https://github.com/The-Last-Resort-FR
 * Text Domain:       plugin-slug
 * License:           GPL v2 or later
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
*/

if (!defined('ABSPATH')) 
{
    exit;
}

define( 'ACP_PATH', dirname(__FILE__));
define( 'ACP_PATH_URL', plugins_url(__FILE__));

function acp_get_xml_info() 
{

	return apply_filters(
		'acp_xml_infos',
		array()
	);

}

function acp_make_xml_infos( $XMLI ) 
{

	$XMLI = array(
		'id'                => 'xml_url',
		'label'             => __( 'XML URL', 'allocine-process' ),
		'class'             => 'XML',
		'description'       => __( 'Enter the XML URL', 'allocine-process' ),
		'priority'          => 10,
		'type'              => 'text',
		'default'           => '',
		'sanitize_callback' => 'sanitize_text_field',
	);
	return $XMLI;

}

add_filter( 'acp_xml_infos', 'acp_make_xml_infos', 10, 1 );


function acp_xml_customizer_settings( $wp_customize ) 
{

    $xml_infos = acp_get_xml_info();

    if ( ! empty( $xml_infos ) ) {
		$wp_customize->add_section(
            'allocine_process',
            array(
                'title'          => __( 'xml location' ),
                'description'    => __( 'put the allocine xml file path here' ),
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

function acp_scripts() {
    wp_register_script("make-html", plugin_dir_url( __FILE__ ) . '/make-html.js', array(), '1.0.0', true);
    wp_enqueue_script( "make-html");
    //wp_enqueue_style("make-html");
}
add_action( 'wp_enqueue_scripts', 'acp_scripts' );

function acp_shortcode_call()
{
    wp_localize_script('make-html', 'acp', array( 
        'xmlContent'=> file_get_contents("https://api.levox.fr/allocineseances.xml"),
        ) 
    );
    // $url = 'https://api.levox.fr/allocineseances.xml';
    // $file_name = basename($url);
    // file_put_contents( 'wp-content/plugins/allocine-process/' . $file_name,file_get_contents($url));
    $XML = acp_get_xml_info();
    $content .= file_get_contents("widget.html", true);
    // $content .= "<script>\n";
    // $content .= "let xmlLocation = \"" . get_theme_mod($XML['id']) . "\";\n";
    // $content .= file_get_contents("make-html.js", true);
    // $content .= "</script>\n";
    return $content;
}

add_shortcode('acpsc', 'acp_shortcode_call');