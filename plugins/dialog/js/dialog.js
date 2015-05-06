define(['jquery', 'core'], function($, x) {
  function xDialog(element, options) {
    'use strict';

    var it = this;
    this.element = element;
    this.$element = $(element);

    var defaultOptions = {
      title: 'xWindow',
      events: {
        negative: function() {
          it.close();
        }
      },
      context: this
    };

    options = $.extend(defaultOptions, options);

    /**
     * Close dialog and remove the child node in dialog container div
     * @return {[type]}
     */
    this.close = function() {
      this.$element.removeClass('x-dialog-show');
      this.$element.hide();
      this.$element.removeData('xDialog');
      this.$element.empty();
    };

    /**
     * Open dialog
     * @return {[type]}
     */
    this.open = function() {
      this.$element.addClass('x-dialog-show');
      this.$element.show();
    };

    /**
     * Render dialog and its' content
     * @return {[type]}
     */
    this.render = function() {
      if (options.template && $.isPlainObject(options.template)) {
        options.template.templateID = options.template.templateID || 'x-dialog-template';
        var fragment = x.template.renderTemplate(options.template, options.context);
        this.addDialogContent.call(fragment);
        this.element.appendChild(fragment);
      }
    };

    /**
     * Render dialog content
     */
    this.addDialogContent = function() {
      if (options.content) {
        if (options.content.template && $.isPlainObject(options.content.template)) {
          var template = options.content.template;
          var renderedContent = x.template.renderTemplate(options.content.template, options.context);
          var wrapper = this.querySelector(template.container || '.x-dialog-content');
          $(wrapper).prepend(renderedContent);
          return renderedContent = wrapper;
        }
      }
    };

    this.init(options);
  }

  xDialog.prototype = {
    init: function(options) {
      this.render();

      this.addEventHandler(options);

      if (options.onOpen && 'function' === typeof options.onOpen) {
        options.onOpen.call(this);
      }
      this.open();
    },
    addEventHandler: function(options) {
      this.$element.find('.x-dialog-negative-button').on('click', function() {
        if (options.negativeEvent) {
          options.negativeEvent.call(this);
        } else {
          this.close();
        }
      }.bind(this));

      this.$element.find('.x-dialog-positive-button').on('click', function() {
        if (options.positiveEvent) {
          options.positiveEvent.call(this);
        }
      }.bind(this));
    }
  };

  x.extend$fn(xDialog);

  return x;
});