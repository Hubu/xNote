define(['jquery', 'core'], function($, x) {

  'use strict';

  var messagesQueue = [];

  var currentMessage = null;

  function showMessageRecursive($container) {
    currentMessage = null;

    if (messagesQueue.length) {
      currentMessage = messagesQueue.pop();

      $container.append(currentMessage.tpl)
        .find('.x-notification-item:eq(0)').slideUp(function() {
          $(this).remove();
        });

      var timer = setTimeout(function() {
        clearTimeout(timer);
        showMessageRecursive($container);
      }, currentMessage.duration);
    } else {
      $container.slideUp(function() {
        $(this).find('li').remove();
      });
    }
  }
  
  function Message(msg, options) {
    var timestamp = '[' + new Date().toLocaleTimeString() + ']';
    
    this.options = $.extend({
      tpl: '<li class="x-notification-item notification-' + (options.type || 'info') + '-type">' + timestamp + ' ' + msg + '</li>',
      sticky: false,
      duration: 3000
    }, options);

    this.show = function($container) {
      messagesQueue.push(this.options);

      if (!currentMessage) {
        currentMessage = messagesQueue.pop();
        if (currentMessage) {
          $container.append(currentMessage.tpl).slideDown();
          var timer = setTimeout(function() {
            clearTimeout(timer);
            showMessageRecursive($container);
          }, currentMessage.duration);
        } else {
          $container.slideUp();
        }
      }
    };

  }

  function getMessageContainer() {
    var $el = $('body > ul.x-notification');

    if (!$el.size()) {
      $el = $('' +
          '<ul class="x-notification" style="display: none;">' +
          '<div class="x-notification-actions">' +
          '<span class="icon-asc js-x-expand"></span>' +
          '<span class="icon-close js-x-close"></span>' +
          '</div>' +
          '</ul>')
        .off('click.x').on('click.x', '.js-x-expand', function() {
          console.log('expand');
        }).on('click.x', '.js-x-close', function() {
          console.log('close');
        }).appendTo('body');
    }

    return $el;
  }

  var notify = function(msg, options) {
    return new Message(msg, options || {}).show(getMessageContainer());
  };

  return x.extend({
    notify: notify
  });
});