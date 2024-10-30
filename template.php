<!doctype html>
<html <?php language_attributes(); ?>>

<head>
  <!-- Required meta tags -->
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

  <link rel="stylesheet" href="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
  <link rel="stylesheet" href="<?php echo esc_url(plugins_url('/livechat-lazucrub/css/style.min.css')) ?>">
  <!-- Emoji -->
  <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css" rel="stylesheet">
  <link href="<?php echo esc_url(plugins_url('/livechat-lazucrub/lib/css/emoji.css')) ?>" rel="stylesheet">

  <?php do_action( 'realtimewp_custom_head' ) ?>

  <title><?php esc_html_e('LiveChat LazycruB', 'real-time-chat-wordpress') ?></title>
</head>

<body>
  <div class="rtch-container">
    <div class="row">
      <ul class="actions-panel">
        <li><a href="#" id="connect"><?php esc_html_e('Connect', 'real-time-chat-wordpress') ?></a></li>
        <li><a href="#" id="createRoom" class="hidden"><?php esc_html_e('Create Room', 'real-time-chat-wordpress') ?></a></li>
        <li><a href="#" id="return" class="hidden"><?php esc_html_e('Return to my Room', 'real-time-chat-wordpress') ?></a></li>
        <li><a href="#" id="disconnect" class="hidden"><?php esc_html_e('Disconnected from All Rooms', 'real-time-chat-wordpress') ?></a></li>
      </ul>
      <div class="status"><strong><?php esc_html_e('Status', 'real-time-chat-wordpress') ?>:</strong> <span class="red" id="status"><?php esc_html_e('Disconnect', 'real-time-chat-wordpress') ?></span></div>
    </div>
    <div id="chatsWindow" class="chatsWindow"></div>
  </div>

  <script type="text/x-jquery-tmpl" id="roomItem">
    <div class="roomItem" data-room="${slug}" data-role="${role}">
      <h3 class="roomTitle">
        ${roomTitle}
        <ul class="roomAction"></ul>
      </h3>
      <div class="content">
        <div class="row">
          <div class="chatWindow">
            <h3>Chat Body</h3>
            <button class="userTrigger">&raquo;</button>
            <div class="chatBody"></div>
          </div>
          <div class="userColumn">
            <h3>Users</h3>
            <button class="chatTrigger">&laquo;</button>
            <ul class="userList"></ul>
          </div>
        </div>
        <div class="textarea">
          <textarea rows="3" data-emojiable="true"></textarea>
        </div>
      </div>
    </div>
  </script>
  <script type="text/x-jquery-tmpl" id="userItem">
    <li class="userItem" data-user="${connectionID}">
      <label>${nickname}</label>
      <p><small class="role">${role}</small></p>
      <ul class="actionBar"></ul>
    </li>
  </script>
  <script type="text/x-jquery-tmpl" id="actionItem">
    <li class="nav-item position-relative">
      <a href="#"data-action="${action}">
        <small>${action}</small>
      </a>
    </li>
  </script>
  <script type="text/x-jquery-tmpl" id="basicMessage">
    <div class="messageItem public" data-id="${index}">
      <button type="button" class="close ${display}">
        <span>&times;</span>
      </button>
      <label>${nickname}[${time}]:</label>
      <p></p>
    </div>
  </script>
  <script type="text/x-jquery-tmpl" id="privateMessage">
    <div class="messageItem private" data-id="${index}">
      <label>${nickname}[${time}][private message]:</label>
      <p></p>
    </div>
  </script>
  <script type="text/x-jquery-tmpl" id="serverMessage">
    <div class="messageItem server">
      <p class="m-0">
        <em>server[${time}]: ${text}</em>
      </p>
    </div>
  </script>
  <script src="https://code.jquery.com/jquery-3.5.1.min.js" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>
  <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js" integrity="sha256-VazP97ZCwtekAsvgPBSUwPFKdrwD3unUfSGVYrahUqU=" crossorigin="anonymous"></script>
  <script src="http://ajax.microsoft.com/ajax/jquery.templates/beta1/jquery.tmpl.js"></script>

  <script src="<?php echo esc_url(plugins_url('/livechat-lazucrub/lib/js/config.js')) ?>"></script>
  <script src="<?php echo esc_url(plugins_url('/livechat-lazucrub/lib/js/util.js')) ?>"></script>
  <script src="<?php echo esc_url(plugins_url('/livechat-lazucrub/lib/js/jquery.emojiarea.js')) ?>"></script>
  <script src="<?php echo esc_url(plugins_url('/livechat-lazucrub/lib/js/emoji-picker.js')) ?>"></script>

  <script src="<?php echo esc_url(plugins_url('/livechat-lazucrub/js/socket.js')) ?>"></script>
  <script type="text/javascript">
    jQuery(document).ready(function($) {
      'use strict';

      window.emojiPicker = new EmojiPicker({
        emojiable_selector: '[data-emojiable=true]',
        assetsPath: '<?php echo esc_url(plugins_url('/livechat-lazucrub/lib/img')) ?>',
        popupButtonClasses: 'fa fa-smile-o'
      });

      $('#chatsWindow').accordion({
        header: 'h3.roomTitle',
        heightStyle: 'content'
      });

      $(document).connectWS({
        publicKey: <?php echo get_option('real_time_chat_public_key', 0) ?>,
        privateKey: '<?php echo current_user_can( 'edit_posts' ) ? get_option('real_time_chat_private_key', 0) : 0; ?>',
        <?php if (is_user_logged_in()) { ?>
          nickname: '<?php echo wp_get_current_user()->display_name ?>',
          email: '<?php echo wp_get_current_user()->user_email ?>'
        <?php } ?>
      });
    });
  </script>
</body>

</html>
