(function($) {

  'use strict';

  let ws,
    list,
    action,
    roomTitle, selector,
    slug, userID, role,
    connectionID = 0;

  jQuery.fn.connectWS = function(options) {

    $('#connect').click(function(event) {
      event.preventDefault();
      closeSocket();
      startSocket(options);
    });

    $('#disconnect').click(function(event) {
      event.preventDefault();
      let check = confirm('Disconnected from Chat Server?');
      if (
        check) {
        closeSocket();
      }

    });

    $('#createRoom').click(function(event) {

      let roomTitle = prompt('Enter roomTitle(5 - 15 characters)');
      if (roomTitle.length < 5 || roomTitle.length > 15) {
        alert('Try again!');
        return;
      } else if (ws) {
        ws.send(JSON.stringify({
          action: 'createRoom',
          roomTitle: roomTitle
        }));
        $(this).addClass('hidden');
      }
    });

    $('#chatsWindow').on('click', 'a', function(event) {
      event.preventDefault();

      action = $(this).attr('data-action');
      slug = $(this).closest('.roomItem').attr('data-room');
      userID = $(this).closest('.userItem').attr('data-user');

      ws.send(JSON.stringify({
        action: action,
        slug: slug,
        connectionID: userID,
        message: $(this).closest('.roomItem').find('textarea').val()
      }));

      $(this).closest('.roomItem').find('textarea').val('');
    });

    $('#chatsWindow').on('click', 'button.close', function(event) {
      ws.send(JSON.stringify({
        action: 'removeMessage',
        index: $(this).closest('.messageItem').attr('data-id')
      }));
    });

    $('#chatsWindow').on('click', 'button.userTrigger', function() {
      $(this).closest('.roomItem').addClass('showUsers');
    });

    $('#chatsWindow').on('click', 'button.chatTrigger', function(event) {
      $(this).closest('.roomItem').removeClass('showUsers');
    });

    $('#return').click(function(event) {
      event.preventDefault();

      ws.send(JSON.stringify({
        action: 'return'
      }));
    });

    $('#chatsWindow').on('keypress', '.textarea', function(event) {
      if (event.which == 13 && $(this).find('.emoji-wysiwyg-editor').html().length) {
        ws.send(JSON.stringify({
          action: 'addMessage',
          slug: $(this).closest('.roomItem').attr('data-room'),
          message: $(this).find('.emoji-wysiwyg-editor').html()
        }));

        $(this).find('.emoji-wysiwyg-editor').html('');
      }
    });

    function startSocket(data) {
      let queryGet = '?';

      for (var key in data) {
        queryGet += key + '=' + data[key] + '&';
      }

      ws = new WebSocket('ws://ec2-13-48-132-210.eu-north-1.compute.amazonaws.com:8080' + queryGet);
      //ws = new WebSocket('ws://localhost:8080' + queryGet);

      $('#status').removeClass();
      $('#status').addClass('orange').html('Connecting...');
      ws.onopen = onOpen;
      ws.onclose = onClose;
      ws.onmessage = onMessage;
      //ws.onerror = onError;
    }

    var onOpen = function(data) {
      $('#status').removeClass();
      $('#status').addClass('green').html('Connect');
      $('#connect').addClass('hidden');
      $('#disconnect').removeClass('hidden');
      $('#createRoom').removeClass('hidden');
    };

    var onClose = function() {
      $('#chatsWindow').html('');
      $('#status').removeClass();
      $('#status').addClass('red').html('Disconnect');
      $('#connect').removeClass('hidden');
      $('#disconnect').addClass('hidden');
      $('#createRoom').addClass('hidden');
      $('#return').addClass('hidden');
      $('#chatsWindow').accordion('destroy');
    };

    var onMessage = function(event) {
      event.preventDefault();

      var data = $.parseJSON(event.data);
      switch (data.action) {
        case 'newRoom':

          newRoom(data);
          if ($('#chatsWindow').accordion('instance')) {
            $('#chatsWindow').accordion('refresh');
          } else {
            $('#chatsWindow').accordion({
              header: 'h3.roomTitle',
              heightStyle: 'content'
            });
          }

          insertRoomActions(data.roomActions, data.slug);
          $(data.users).each(function(i, user) {
            newUser(user, data.slug);
            insertUserActions(user.actions, data.slug, user.connectionID);
          });
          window.emojiPicker.discover();
          break;
        case 'addUser':
          newUser(data.user, data.slug);
          insertUserActions(data.actions, data.slug, data.user.connectionID);
          break;
        case 'insertUser':
          $('#chatsWindow div[data-role="moderator"]').each(function(i, el) {
            if ($(el).attr('data-room') != data.slug) {
              newUser(data.user, $(el).attr('data-room'));
              insertUserActions(data.actions, $(el).attr('data-room'), data.user.connectionID);
            }
          });
          break;
        case 'insertUsers':
          removeRoomActions(data.slug);
          insertRoomActions(data.roomActions, data.slug);
          $(data.users).each(function(i, user) {
            newUser(user, data.slug);
            insertUserActions(user.actions, data.slug, user.connectionID);
          });
          updateRole(data);
          break;
        case 'removeUser':
          if (!data.hasOwnProperty('slug')) {
            $('#chatsWindow li[data-user="' + data.connectionID + '"]').each(function(i, el) {
              $(el).remove();
            });
          } else {
            removeUser(data.slug, data);
          }
          break;
        case 'updateRoom':
          removeRoomActions(data.slug);
          insertRoomActions(data.roomActions, data.slug);
          updateUserRole(data);
          break;
        case 'updateUser':
          removeUserActions(data);
          insertUserActions(data.actions, data.slug, data.connectionID);
          updateUserRole(data);
          break;
        case 'removeRoom':
          removeRoom(data.slug);
          if (data.slug == 'room' + connectionID) {
            $('#return').removeClass('hidden');
          }
          break;
        case 'updateRole':
          updateRole(data);
          break;
        case 'buttonReturn':
        
          data.show ?
            $('#return').removeClass('hidden') :
            $('#return').addClass('hidden');
          break;
        case 'message':
          data.time = new Date(parseInt(data.unix) * 1000).toLocaleString();
          data.display = data.display ? '' : 'hidden';
          $('#basicMessage').tmpl(data).appendTo('#chatsWindow div[data-room="' + data.slug + '"] .chatBody');
          $('[data-id="'+data.index+'"] p').html(data.text);
          break;
        case 'private':
          data.time = new Date(data.unix * 1000).toLocaleString();

          $('#privateMessage').tmpl(data).appendTo('#chatsWindow div[data-room="' + data.slug + '"] .chatBody');
          $('[data-id="'+data.index+'"] p').html(data.text);
          break;
        case 'server':
          data.time = new Date().toLocaleString();
          if (data.hasOwnProperty('slugs')) {
            $(data.slugs).each(function(i, slug) {
              $('#serverMessage').tmpl(data).appendTo('#chatsWindow div[data-room="' + slug + '"] .chatBody');
            });
          } else {
            $('#serverMessage').tmpl(data).appendTo('#chatsWindow div[data-room="' + data.slug + '"] .chatBody');
          }
          break;
        case 'replaceMessage':
          $('#chatsWindow div[data-id="' + data.index + '"] button').hide();
          $('#chatsWindow div[data-id="' + data.index + '"] p').text(data.text);
          break;
        default:
      }
    };

    function newRoom(data) {
      $('#roomItem').tmpl(data).appendTo('#chatsWindow');
    }

    function removeRoom(slug) {
      $('#chatsWindow div[data-room="' + slug + '"]').remove();
    }

    function newUser(data, slug) {
      if (data.connectionID != connectionID) {
        $('#chatsWindow div[data-room="' + slug + '"] li[data-user="' + data.connectionID + '"]').remove();
        $('#userItem').tmpl(data).appendTo('#chatsWindow div[data-room="' + slug + '"] .userList');
        if (data.role === 'notin') {
          $('#chatsWindow div[data-room="' + slug + '"] li[data-user="' + data.connectionID + '"] p').hide();
        }
      }
    }

    function removeUser(slug, data) {
      $('#chatsWindow div[data-room="' + slug + '"] li[data-user="' + data.connectionID + '"]').remove();
    }

    function insertUserActions(actions, slug, connectionID) {
      $(actions).each(function(i, action) {
        $('#actionItem').tmpl({
          action: action
        }).appendTo('#chatsWindow div[data-room="' + slug + '"] li[data-user="' + connectionID + '"] .actionBar');
      });
    }

    function removeUserActions(data) {
      $('#chatsWindow div[data-room="' + data.slug + '"] li[data-user="' + data.connectionID + '"] .actionBar').html('');
    }

    function updateRole(data) {
      $('#chatsWindow div[data-room="' + data.slug + '"]').attr('data-role', data.role);
    }

    function updateUserRole(data) {
      $('#chatsWindow div[data-room="' + data.slug + '"] li[data-user="' + data.connectionID + '"] p small').text(data.role);
      if (data.role === 'notin') {
        $('#chatsWindow div[data-room="' + data.slug + '"] li[data-user="' + data.connectionID + '"] p').hide();
      } else {
        $('#chatsWindow div[data-room="' + data.slug + '"] li[data-user="' + data.connectionID + '"] p').show();
      }
    }

    function insertRoomActions(actions, slug) {
      $(actions).each(function(i, action) {
        $('#actionItem').tmpl({
          action: action
        }).appendTo('#chatsWindow div[data-room="' + slug + '"] .roomAction');
      });
    }

    function removeRoomActions(slug) {
      $('#chatsWindow div[data-room="' + slug + '"] .roomAction').html('');
    }

    function closeSocket() {
      if (ws) {
        ws.close();
      }
      $('#status').removeClass();
      $('#status').addClass('text-warning').html('Disonnecting...');
    }
  };
})(jQuery);
