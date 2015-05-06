define(['jquery', 'core'], function($, x) {
  'use strict';

  var Message = function(options) {};

  var xNotification = function(el, options) {
    this.el = el;
    this.$el = $(el);
    var tpl = '<ul class="x-notification" style="display: none;">' +
      '<li class="x-notification-actions">' +
      '<span class="icon-asc"></span>' +
      '<span class="icon-close"></span>' +
      '</li>' +
      '</ul>';

    this.getElement = function() {
      var el = $('body > ul.x-notification');
      if (el.length) {
        return el;
      } else {
        return $(tpl).appendTo('body');
      }
    };
  };

  xNotification.prototype = {
    init: function(){
      this.$el = this.getElement();
    }
  };

  // x.extend$fn(xNotification);
});