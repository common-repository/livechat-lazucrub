<?php
/*
Plugin Name: LiveChat LazucruB
Plugin URI: http://ec2-13-48-132-210.eu-north-1.compute.amazonaws.com/
Description: chat client for wordpress
Author: Bogdan Chirukin
Author URI: http://guten.xyz/
Version: 1.2
*/
wp_cookie_constants();
require_once ABSPATH . WPINC . '/pluggable.php';
include plugin_dir_path(__FILE__).'admin.php';
add_filter('template_include', 'realtimewp_include', 99);
function realtimewp_include($template)
{
  global $wp_query;

    if (isset($wp_query->query['chat'])) {
        $template = plugin_dir_path(__FILE__).'template.php';
    }
    return $template;
}

add_shortcode('real-time-chat', 'realtimewp_shortcode');
function realtimewp_shortcode()
{
    $output = '<iframe src="'.esc_url(site_url('/chat')).'" width="100%" height="100%"></iframe>';

    return $output;
}

add_action('init', 'realtimewp_add_chat_endpoint');
function realtimewp_add_chat_endpoint()
{
    delete_option('rewrite_rules');
    add_rewrite_endpoint('chat', EP_ALL);
}
