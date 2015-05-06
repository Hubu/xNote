define([], function() {
  'use strict';

  var defaultKeyConfig = {
    keyPath: 'ID',
    autoIncrement: true
  };

  return {
    indexedDBConfig: {
      name: 'xNoteDB',
      version: 1,
      objectStoreConfig: {
        objectStore: [{
          name: 'user',
          keyConfig: defaultKeyConfig,
          index: {
            name: 'name',
            keyPath: 'name',
            config: {
              unique: true
            }
          }
        }, {
          name: 'category',
          keyConfig: defaultKeyConfig,
          index: {
            name: 'name',
            keyPath: 'name',
            config: {
              unique: true
            }
          }
        }, {
          name: 'note',
          keyConfig: defaultKeyConfig,
          index: ['title', 'category']
        }],
        user: {
          name: 'Mr.Note',
          password: ''
        }
      }
    },

    dialog: {
      categorySelectDialogTemplateConfig: {
        // container: '.x-dialog-content',
        // templateID: 'x-dialog-template',
        templateData: {
          title: '选择分类',
          negative: '取消',
          positive: '确定'
        }
      }
    },

    simditorConfig: {
      textarea: '#simditor',
      toolbar: ['title', 'bold', 'italic', 'underline', 'strikethrough', 'color', 'ol', 'table', 'link', 'image', 'hr', 'indent'],
      toolbarFloat: false,
      defaultImage: 'plugins/simditor/assets/images/image.png'
    },

    message: {
      logMessagePrefix: '[xNote message]',
      info: {
        dbInitDone: 'All objectStores update have done!',
        browserSupport: 'Your browser support indexedDB  well',
        osDeleteDone: 'Ojectstores delete done.',
        defaultDataImportDone: 'DB default import has done!',
        osUpdateRollbackDone: 'Update error data has rollback!'
      },
      errorMessage: {
        getObjectStore: 'Error occured while get objectStore!',
        browserNotSupport: 'Your browser does not support indexDB well',
        osUpdateParamError: 'Valid parameter, you nedd specify the objectStoreName which to update',
        osUpdateRollbackError: 'Update error, data rollback error too!',
        osUpdatePutError: 'Data update error'
      },
      successMessage: {
        deleteDB: 'Database delete successfully.'
      }
    }
  };
});