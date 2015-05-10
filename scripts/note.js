define(['jquery', 'core', 'config/data'], function($, x, Data) {
  'use strict';

  return {
    /**
     * Generate datalist options for note category selector
     * @param  {Ojbect} data
     * eg: {
     *     name: 'value',
     *     ...
     * }
     * @return {String}      datalist options string
     */
    initCategoryDatalist: function(data) {
      var categories = Data.categories;
      var options = '';
      $.each(categories, function(index, category) {
        // category.value = category.value.charAt(0).toUpperCase() + category.value.slice(1);
        options += '<option value="' + category.value + '">' + category.text + '</option>';
      });
      var categoryDataListStr = '<datalist id="' + Data.categoryListID + '">' + options + '</datalist>';
      $('.x-content-category-input').attr('list', Data.categoryListID).after(categoryDataListStr);
    },

    /**
     * Add new note data
     * @param {Object} db   database  instance
     * @param {Object} data new note data will be add
     */
    add: function(db, data, callback) {
      var it = this;
      var date = new Date().toLocaleDateString();

      db.add('note', {
        title: data.title,
        category: data.category,
        content: data.content,
        date: date
      }, function(id) {
        if (id) {
          db.update({
            target: 'category',
            key: 'name',
            value: data.category,
            isID: false
          }, {
            update: function(data) {
              if (data.noteIDs) {
                data.noteIDs += ',' + id;
              } else {
                data.noteIDs = id.toString();
              }

              return data;
            }
          }, function(id) {
            if (id) {
              $('li.null-content:not(.hide)').addClass('hide');
              $('.content ul').append(x.template.renderTemplate({
                templateID: 'x-note-item-template',
                templateData: {
                  title: data.title,
                  content: data.content,
                  date: date,
                  category: data.category,
                  ico: it.getCategoryIcon(data.category)
                }
              }));
              x.util.handleCallback(callback, true);
            } else {
              x.util.handleCallback(callback, false);
            }
          });
        }
      });
    },

    getCategoryIcon: function(category) {
      return Data.categories.filter(function(el) {
        return el.value === category;
      })[0].ico;
    },

    /**
     * Add new note category
     * @param {Object} db database  instance
     */
    addCategory: function(db) {
      if ($('form.x-category-add-region').length) {
        $('form.x-category-add-region').show('fast');
        this.element.querySelector('form').reset();
      } else {
        $('.x-category').append(x.template.renderTemplate({
          templateID: 'x-category-add-form-template',
          events: [{
            target: 'button[type=cancel]',
            eventName: 'click',
            eventHandler: function(e) {
              e.preventDefault();
              $(e.target).closest('form').hide('fast');
            }
          }, {
            target: 'button[type=submit]',
            eventName: 'click',
            eventHandler: function(e) {
              e.preventDefault();
              var form = $(e.target).closest('form').get(0);
              var categoryNameElt = form.querySelector('input[name=value]');
              if (categoryNameElt.checkValidity()) {
                var data = {
                  templateID: 'x-category-item-template',
                  templateData: {
                    ID: x.util.uuid(),
                    value: x.util.uuid(),
                    text: form.elements.text.value,
                    color: form.elements.color.value
                  }
                };
                var newCategory = x.template.renderTemplate(data, this);
                this.$element.find('li.x-category-addBtn').before(newCategory);
                $(form).hide('fast');
              } else {
                categoryNameElt.focus();
              }
            }
          }]
        }, this)).find('form').hide().show('fast');
      }
    },

    refresh: function(db) {
      var it = this;
      $('li.x-content-item').remove();

      db.get({
        target: 'note'
      }, function(data) {
        if (data.length) {
          $('li.null-content').addClass('hide');
          data.forEach(function(item) {
            item.ico = it.getCategoryIcon(item.category);
            
            $('.content ul').append(x.template.renderTemplate({
              templateID: 'x-note-item-template',
              templateData: item
            }));
          });
        } else {
          $('li.null-content').removeClass('hide');
        }
      });
    },

    formatCategoryData: function(data) {
      var it = this;

      var categories = {};

      data.forEach(function(item) {
        categories[item.category] = categories[item.category] || {
          ico: it.getCategoryIcon(item.category),
          count: 0,
          category: item.category
        };

        categories[item.category].count++;
      });

      var d = [];
      for(var key in categories){
        d.push(categories[key]);
      }
      return d;
    }
  };
});
