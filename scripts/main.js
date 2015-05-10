define([
  'jquery',
  'core',
  'simditor/simditor',
  'config/properties',
  'config/data',
  'note',
  'template',
  'dialog',
  'x/x.indexedDB',
  'notification'
],
function($, x, Simditor, properties, Data, note) {
  
  'use strict';
  
  $(function() {
    var db = new x.IndexedDB({
      name: 'xNoteDB',
      version: 1,
      defaultData: [{
        target: 'category',
        data: Data.categories,
        formatter: function(data) {
          data.name = data.value;
          return data;
        }
      }]
    });

    db.init(properties.indexedDBConfig, function() {
      // db.add('user', {
      //   name: 'Joe',
      //   password: 'MyPassword'
      // });
      
      note.refresh(db);

      /**
       * Edit category select
       */
      $('.x-category-selector').click(function() {

        db.get({
          target: 'category'
        }, function(categoryData) {
          $('#x-dialog').xDialog({
            /**
             * Config for render dialog
             * @type {Object}
             */
            template: properties.dialog.categorySelectDialogTemplateConfig,

            /**
             * Config for render dialog content
             * @type {Object}
             */
            content: {
              template: {
                templateID: 'x-category-template',
                templateData: {
                  // Category list render data
                  itemData: categoryData
                },
                events: [{
                  target: '.x-category-addBtn',
                  eventName: 'click',
                  // Category add button event handler
                  eventHandler: function(e) {
                    note.addCategory.call(this, db);
                  }
                }, {
                  target: 'span.edit',
                  eventName: 'click',
                  eventHandler: function() {
                    alert('Category edit function will be finished soon');
                  }
                }]
              }
            },

            /**
             * Event handler of dialog's negetive button
             * @return {[type]} [description]
             */
            negativeEvent: function() {
              this.close();
            },

            /**
             * Event handler of dialog's positive button
             * @return {[type]} [description]
             */
            positiveEvent: function() {
              var selectedCategories = $('input.x-catetory-selection-trigger:checked');
              $('.x-category-list > li:nth-child(n+2)').remove();
              if (selectedCategories.length) {
                var liStr = '';
                $.each(selectedCategories, function(index, element) {
                  var text = this.nextElementSibling.textContent;
                  liStr += '<li class="x-catagory-selected-item" value="' + this.value + '">' + text + '</li>';
                });
                $('.x-category-list').append(liStr);
              }
              this.close();
            },

            /**
             * Function will be invoked before dailog open
             * @return {[type]} [description]
             */
            onOpen: function() {
              $.each($('.x-category-list li[value]'), function(index, element) {
                $('.x-category li input[value=' + this.getAttribute('value') + ']').attr('checked', 'checked');
              });
            }
          });
        });
      });

      /**
       * Event handler to add new note button
       */
      $('.x-note-addBtn').click(function() {
        $('#x-dialog').xDialog({
          template: {
            // container: '.x-dialog-content',
            templateID: 'x-dialog-template',
            templateData: {
              title: '新建笔记',
              negative: '取消',
              positive: '新建'
            }
          },
          content: {
            template: {
              templateID: 'x-content-editor-template'
            }
          },
          onOpen: function() {
            this.simditor = new Simditor(properties.simditorConfig);

            note.initCategoryDatalist();
          },
          positiveEvent: function() {
            var it = this;
            var title = this.$element.find('.x-content-title-input').val().trim();
            var category = this.$element.find('.x-content-category-input').val().trim();
            var content = this.simditor.getValue();

            if (title && category && content) {
              note.add(db, {
                title: title,
                category: category,
                content: content
              }, function(result) {
                if (result) {
                  it.close(); 
                }
              });
            }
          }
        });
      });

      /**
       * Show all notes in board
       */
      $('.x-show-all-notes, .x-notes-board-close').click(function() {
        if (this.classList.contains('x-show-all-notes')) {
          var dom = this;
          db.get({
            target: 'note'
          }, function(data) {
            var templateData;
            if (!data.length) {
              templateData = {
                ico: 'empty.png',
                category: 'empty',
                count: 0
              };
            } else {
              templateData = note.formatCategoryData(data);
            }
            $('.x-notes-board-items-container').append(x.template.renderTemplate({
              templateID: 'x-note-board-item-template',
              templateData: templateData
            }));
          });
        } else {
          $('.x-notes-board-items-container').empty();
        }
        $('.x-all-notes-board-container').toggleClass('x-show');
      });

      $('.js-x-empty-db').on('click', function(e) {
        $(this).find('.x-menu-button-wrapper').slideUp('fast');
      });

      $('.x-confirmation-wrapper button').on('click', function(e) {
        if (this.classList.contains('positive')) {
          db.deleteDB(function() {
            $('.x-menu-button-wrapper').slideDown('fast');
          }.bind(this));
        } else {
          $('.x-menu-button-wrapper').slideDown('fast');
          e.stopPropagation();
        }
      });

      $('.content').on('click.x', '.js-x-note-delete', function(e) {
        var $target = $(e.currentTarget);

        var id = $target.data('id');

        db.remove('note', id, function(result) {
          if (result) {
            x.notify('笔记已经成功删除');
            note.refresh(db);
          }
        });
      });
    });
  });
});
