define(['jquery', 'core'], function($, x) {
  'use strict';

  function xNotification(element, options) {

    var it = this;
    this.element = element;
    this.$element = $(element);
    this.$messageItems = this.$element.find('.x-notification-body');


    var defaultOptions = {
      defaultMessageType: 'info',
      notificationDuration: 3000,
      enableShowAllButton: true,
      enableCloseButton: true,
      style: {
        type: 'message', // 'message'|'dialog'
        position: 'top', // 'top'|'bottom'|'topLeft'|'topRight'|'bottomLeft'|'bottomRight'
      }
    };

    this.init($.extend(true, {}, defaultOptions));
  }

  xNotification.prototype = {
    /**
     * Widgeg initialize
     * @param  {options} options
     */
    init: function(options) {
      this.options = options;

    },

    /**
     * Show message
     * @param  {String} message message content to display
     * @param  {String} type    message type
     */
    show: function(message, type, callback) {
      if ('message' === this.options.style.type) {
        this.showMessage(message, type, callback);
      } else if ('dialog' === this.options.style.type) {
        this.showDialog(message, type, callback);
      }
    },

    /**
     * [showMessage description]
     * @param  {[type]}   message  [description]
     * @param  {[type]}   type     [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    showMessage: function(message, type, callback) {
      var timestamp = '[' + new Date().toLocaleTimeString() + ']';
      var list = x.widget.xNotification.messageItemList;
      list.push('<li class="x-notification-body notification-' + (type || this.options.defaultMessageType) + '-type">' + timestamp + ' ' + message + '</li>');

      if (!this.$element.hasClass('x-showing')) {
        this.$element.addClass('x-showing');

        this.$element.append(list.pop()).slideDown();

        var interval = setInterval(function() {
          if (!list.length) {
            clearInterval(interval);
            this.$element.removeClass('x-showing').slideUp(function() {
              $('.x-notification-body').remove();
            });
          } else {
            this.$element.append(list.pop());
            $('.x-notification-body:eq(0)').slideUp(function() {
              $(this).remove();
            });
          }
        }.bind(this), this.options.notificationDuration || 3000);
      }
    },

    /**
     * [showDialog description]
     * @param  {[type]}   message  [description]
     * @param  {[type]}   type     [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    showDialog: function(message, type, callback) {}
  };

  x.extend$fn(xNotification);

  return x;
});