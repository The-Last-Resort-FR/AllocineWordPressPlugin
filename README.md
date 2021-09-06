# An Allociné WordPress plugin

Just gather data from the Allociné exorted xml and display it with a shortcode.

## Installation

1. Install MAMP

    - [Download MAMP here](https://www.mamp.info/en/downloads/) and install it.

2. Get WordPress

    - [Download WordPress here](https://wordpress.org/download/) and extract it into you MAMP's htdocs folder.

    - Make an SQL Database with PHPMyAdmin from MAMP and complete the WordPress installation, to connect to WordPress you can go to [localhost](http://localhost/) ([more help can be found here](https://wordpress.org/support/article/how-to-install-wordpress/)).

3. create a db
USE levoxfrtysdb;
DROP TABLE IF EXISTS wp_allocine_reservations;
CREATE TABLE IF NOT EXISTS wp_allocine_reservations (
                    `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
                     `film_id` int NOT NULL,
                     `diffusion_tmsp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                     `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                     `client_name` varchar(200) NOT NULL,
                     `film_title` varchar(200) NOT NULL,
                     `client_email` varchar(45) NOT NULL,
                     `reserved_place` int NOT NULL 
               );


4. Install the plugin

    - Go into the WordPress plugin's folder.
  
    For windows :
    ```bash
    cd C:\MAMP\htdocs\wp-content\plugins
    ```

    - Clone the repository in it.

    ```bash
    git clone https://github.com/The-Last-Resort-FR/AllocineWordPressPlugin
    ```

    - Go into the WordPress administration dashboard and look for the installed plugin menu.
  
    - Enable the plugin.

5. Mettre les settings à jour dans la table de l'admin Allocine
-> Jauge
-> Url vers le xml d'allociné

6. Use the plugin

    - In the WordPress personalisation menu look for the URL du fichier XML Allociné section and then enter there the url to your own Allociné exported XML.

    - On the desired page, add a shortcode block and enter the code \[acpsc\].

    - Good job you're all set up !



