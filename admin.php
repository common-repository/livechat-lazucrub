<?php
add_action('admin_menu', 'realtimewp_settings_page');
function realtimewp_settings_page()
{
    add_options_page(__('LiveChat LazucruB', 'real-time-chat-wordpress'), __('LiveChat LazucruB', 'real-time-chat-wordpress'), 'manage_options', 'realtimewp_settings_page', 'realtimewp_settings');
}

function realtimewp_settings()
{
    ?>
<div class="wrap">
<h1><?php esc_html_e('LiveChat LazucruB', 'real-time-chat-wordpress') ?></h1>
<?php realtimewp_settings_save(); ?>
<form method="post">
  <p>
    <a href="http://13.48.132.210/my-account/"><?php esc_html_e( 'Create Account', 'real-time-chat-wordpress' ) ?></a>
  </p>
  <p>
    <label>
      <?php esc_html_e('Public Key', 'real-time-chat-wordpress') ?><br>
      <input type="number" name="real_time_chat_public_key" value="<?php echo get_option('real_time_chat_public_key') ?>">
    </label>
  </p>
  <p>
    <label>
      <?php esc_html_e('Private Key', 'real-time-chat-wordpress') ?><br>
      <input type="text" name="real_time_chat_private_key" value="<?php echo get_option('real_time_chat_private_key') ?>">
    </label>
  </p>
  <p>
    <label>
      <input type="checkbox" name="real_time_chat_access" <?php checked(get_option('real_time_chat_access'), 'on') ?>>
        <?php esc_html_e('only for register user?', 'real-time-chat-wordpress') ?>
    </label>
  </p>
  <?php wp_nonce_field('realtimewp_settings') ?>
  <?php submit_button(__('Save')) ?>
  <p>
    <a href="https://patreon.com/Bogdan1111111"><?php esc_html_e('Donate', 'real-time-chat-wordpress') ?></a>
  </p>
</form>
  <?php
}

function realtimewp_settings_save()
{
    $options = ['real_time_chat_public_key','real_time_chat_private_key','real_time_chat_access'];
    if (isset($_POST['_wpnonce']) && wp_verify_nonce($_POST['_wpnonce'], 'realtimewp_settings') && current_user_can('manage_options')) {
        foreach ($options as $key => $value) {
            if (isset($_POST[$value])) {
                update_option($value, sanitize_text_field($_POST[$value]));
            } else {
                delete_option($value);
            }
        }
        echo '<div id="setting-error-settings_updated" class="notice notice-success settings-error is-dismissible"><p><strong>'.__('Settings saved.').'</strong></p></div>';
    }
}
