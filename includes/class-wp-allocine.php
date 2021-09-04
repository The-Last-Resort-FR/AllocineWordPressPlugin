<?php

class WP_Allocine {


    /**
     * The unique identifier of this plugin.
     *
     * @since    1.1.2
     * @access   protected
     * @var      string    $wp_dmt    The string used to uniquely identify this plugin.
     */
    protected $wp_allocine;

    /**
     * The current version of the plugin.
     *
     * @since    1.1.2
     * @access   protected
     * @var      string    $version    The current version of the plugin.
     */
    protected $version;

    /**
     * Define the core functionality of the plugin.
     *
     * Set the plugin name and the plugin version that can be used throughout the plugin.
     * Load the dependencies, define the locale, and set the hooks for the admin area and
     * the public-facing side of the site.
     *
     * @since    1.1.2
     */
    public function __construct() {
        if ( defined( 'WP_ALLOCINE_VERSION' ) ) {
            $this->version = WP_ALLOCINE_VERSION;
        } else {
            $this->version = '1.0.0';
        }
        $this->wp_allocine = 'wp-allocine';

        $this->load_dependencies();
        $this->define_admin_hooks();
        $this->define_rest_route();

    }

    /**
     * Load the required dependencies for this plugin.
     *
     * Include the following files that make up the plugin:
     *
     * - WP_Allocine_Rest_API. Rest API.
     *
     * Create an instance of the loader which will be used to register the hooks
     * with WordPress.
     *
     * @since    1.1.2
     * @access   public
     */
    function load_dependencies() {

        /**
         * Cette classe permet d'importer les fonctions utiles au projet
         */
        require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-wp-avtools.php';

        /**
         * Cette classe permet d'importer les méthodes de DAO
         */
        require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-wp-allocine-repository.php';


        /**
         * Cette classe permet d'importer les routes de notre API Rest
         */
        require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-wp-allocine-rest-api.php';

        /**
         * Cette classe permet dé déclarer la partie administration du plugin
         */
        require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-wp-allocine-admin.php';

    }
    /**
     * Register all of the hooks related to the admin area functionality
     * of the plugin.
     *
     * @since    1.1.2
     */
    function define_admin_hooks() {
        $plugin_admin = new WP_Allocine_Admin();

        add_action('admin_enqueue_scripts', array($plugin_admin, 'enqueue_scripts'), 10, 1);
        add_action('admin_menu', array($plugin_admin, 'settings_page'), 10, 1);
        add_action('admin_init', array($plugin_admin, 'settings_init'), 10, 1);

    }

    function define_rest_route() {
        $rest_api = new WP_Allocine_Rest_Api();
        $rest_api->register_rest_route();

    }


}
