<?php

/**
 * Class WP_Allocine_Admin
 * Classe servant à définir notre panel d'administration
 */
class WP_Allocine_Admin {

    // Enqueue styles
    public function enqueue_scripts() {
        //wp_enqueue_style( $this->wp_allocine, plugin_dir_url( __FILE__ ) . 'css/wp-allocine-admin.css', array(), $this->version, 'all' );
    }

    /**
     * Ajout de la page dans le panel Wordpress
     */
    public function settings_page() {
        if (current_user_can('administrator')) {
            add_menu_page( 'Paramètres de Allociné', 'Allociné', 'manage_options', 'allocine_settings', array(__CLASS__,'settings_display'), 'dashicons-tickets', 6  );
        }
    }


    /**
     * Function permettant d'afficher la liste des réservations dans un template séparé
     */
    public static function list_reservations_display()
    {
        $template = plugin_dir_path( dirname( __FILE__ ) ) . 'public/templates/admin/list-reservations.php';

        ob_start();
        include $template;

    }


    public static function settings_display( $active_tab = '' ) {
        ?>
        <!-- Our admin page content should all be inside .wrap -->
        <div class="wrap">
            <!-- Print the page title -->
            <h2><?php echo esc_html( get_admin_page_title() ); ?></h2>
            <?php settings_errors(); ?>

            <?php if( isset( $_GET[ 'tab' ] ) ) {
                $active_tab = $_GET[ 'tab' ];
            } else if( $active_tab == 'list_reservations' ) {
                $active_tab = 'list_reservations';
            } else {
                $active_tab = 'list_reservations';
            } // end if/else ?>

            <h2 class="nav-tab-wrapper">
                <a href="?page=allocine_settings&tab=list_reservations" class="nav-tab <?php echo $active_tab == 'list_reservations' ? 'nav-tab-active' : ''; ?>"><?php echo __( 'Réservations', 'wp-allocine' ); ?></a>
                <a href="?page=allocine_settings&tab=options" class="nav-tab <?php echo $active_tab == 'options' ? 'nav-tab-active' : ''; ?>"><?php echo __( 'Réglages', 'wp-allocine' ); ?></a>
            </h2>
            <div class="class-content">


                <form action='options.php' method='post'>
                    <?php

                    if( $active_tab == 'list_reservations' ) {

                        WP_Allocine_Admin::list_reservations_display();

                    }  else {

                        ?>
                        <div>
                            <h3>Ici mettre par exemple un champ pour l'URL de l'API d'Allociné.</h3>
                        </div>

                        <?php

                    } // end if/else

                    submit_button();

                    ?>
                </form>
            </div>
        </div>

        <?php

    }



}
