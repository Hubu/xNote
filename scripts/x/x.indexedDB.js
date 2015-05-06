define([
  'jquery',
  'core',
  'config/properties',
  'i18n',
  'notification'
], function($, x, properties, i18n) {
  'use strict';

  var db, indexedDB, IDBTransaction, IDBKeyRange;
  var notification = $('.x-notification').xNotification();

  /**
   * print message to browser console
   * @param  {String} message  messageBody
   * @param  {String} funcName log method name
   */
  function print(message, funcName) {
    console[funcName || 'log'](i18n.logMessagePrefix, message);
  }

  /**
   * Check if the browser support indexedDB
   * judged from the boolean value that function returned
   * @return {Boolean} [description]
   */
  function _isSupport() {
    // In the following line, you should include the prefixes of implementations you want to test.
    indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    // DON'T use "var indexedDB = ..." if you're not in a function.
    // Moreover, you may need references to some window.IDB* objects:
    IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
    IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

    if (!window.indexedDB || !window.IDBTransaction || !IDBKeyRange) return print(i18n.errorMessage.browserNotSupport, 'error'), false;
    return print(i18n.info.browserSupport), true;
  }

  /**
   * Update the objectstroe's info when the db's onupgradeneeded event triggered
   * @param  {Object} config
   * eg: {
   *      deletions: [],
   *      tables: [{
   *          name: '',
   *          keyConfig: {
   *              keyPath: '',
   *              autoIncrement: boolean
   *          },
   *          index: [{ // optional
   *              name: '',
   *              keyPath: '',
   *              config: {} // optional
   *          }]
   *      }],
   * }
   *
   */
  function _alter(config, defaultData) {
    var it = this;

    if (config.deletions) {
      var errorCounter = 0,
        counter = new x.util.Counter(config.deletions.length, function() {
          if (!errorCounter) {
            print(i18n.info.osDeleteDone);
          } else {
            notification.show(i18n.errorMessage.deleteOSError, 'error');
          }
        });

      config.deletions.forEach(function(item) {
        try {
          db.deleteObjectStore(item);
        } catch (err) {
          errorCounter++;
        } finally {
          counter();
        }
      });
    }

    if (config.objectStore) {
      config.objectStore.forEach(function(osConfig, index) {
        var os;
        /**
         * Get object store
         */
        try {
          os = db.createObjectStore(osConfig.name, osConfig.keyConfig);
        } catch (err) {
          notification.show(err, 'error');
        }

        /**
         * Add complete event handler of versionchange transaction
         * Add once is enough. only while index is 0
         */
        if (!index) {
          os.transaction.oncomplete = function(event) {
            print(i18n.info.dbInitDone);

            if (defaultData && 'array' === $.type(defaultData)) {
              var counter = new x.util.Counter(defaultData.length, function() {
                print(i18n.info.defaultDataImportDone);
              });
              $.each(defaultData, function(index, data) {
                it.import(data, function() {
                  counter();
                });
              });
            }
          };
        }

        /**
         * Create index
         */
        if (osConfig.index) {
          if ('string' === $.type(osConfig.index)) {
            os.createIndex(osConfig.index, osConfig.index);
          } else if ('array' === $.type(osConfig.index)) {
            osConfig.index.forEach(function(idxConfig) {
              if ('string' === $.type(idxConfig)) {
                os.createIndex(idxConfig, idxConfig);
              } else if ('object' === $.type(idxConfig)) {
                os.createIndex(idxConfig.name, idxConfig.keyPath, idxConfig.config);
              }
            });
          } else {
            os.createIndex(osConfig.index.name, osConfig.index.keyPath, osConfig.index.config);
          }
        }

      });
    }
  }


  function xIndexedDB(defaultOptions) {
    if (!_isSupport.call(this)) {
      this.init = undefined;
    } else {
      /**
       * Open db and dedine the interface
       * @param  {Object}   options  data init options
       * @param  {Function} callback callback called after db inited
       *
       */
      this.init = function(options, callback) {
        var it = this,
          options = $.extend(true, defaultOptions, options);

        var request = indexedDB.open(options.name, options.version);

        request.onupgradeneeded = function(event) {
          db = event.target.result;

          if (options.objectStoreConfig) {
            _alter.call(it, options.objectStoreConfig, options.defaultData);
          }
        };

        request.onsuccess = function(event) {
          db = event.target.result;
          x.util.handleCallback(callback);
        };

        request.onerror = function(event) {
          var err = event.target.error;
          if ('VersionError' === err.name) {
            if (confirm(i18n.info.dbVersionErrorConfirmation)) {
              it.init({
                version: ++options.version
              });
            }
          } else {
            notification.show(event.target.error, 'error');
          }
        };
      };

      /**
       * Delete the db and remove all stored data
       * @param {Function} callback
       * @return {[type]} [description]
       */
      this.deleteDB = function(callback) {
        var request;

        try {
          db.close();
          request = indexedDB.deleteDatabase(defaultOptions.name);
        } catch (err) {
          notification.show(i18n.errorMessage.deleteDBError, 'error');
        }

        request.onerror = function(event) {
          notification.show(event.target.error, 'error');
          x.util.handleCallback(callback, false);
        };

        request.onsuccess = function(event) {
          notification.show(i18n.successMessage.deleteDB, 'success');
          x.util.handleCallback(callback, true);
        };
      };

      /**
       * Get the db info
       * @return {[type]} [description]
       */
      this.getDBInfo = function() {
        return {
          name: db.name,
          version: db.version,
          tables: db.objectStoreNames
        };
      };

      /**
       * Get objectStore before curd operations
       * @param  {String} objectStoreName objectStore name
       * @param  {String} mode            open mode
       * @return {[type]}                 [description]
       */
      this.getObjectStore = function(objectStoreName, writeable) {
        var tx;

        try {
          tx = db.transaction(objectStoreName, writeable ? 'readwrite' : 'readonly');
        } catch (err) {
          if (8 === err.code) {
            console.error('objectStore "' + objectStoreName + '" not found!');
          } else {
            console.error(i18n.errorMessage.getObjectStore);
          }
          return false;
        }

        return tx.objectStore(objectStoreName);
      };

      /**
       * Create and add new record to specific object store
       * @param {String} objectStoreName the object where to add new data
       * @param {Object} newData    new data will be add
       */
      this.add = function(objectStoreName, newData, callback) {
        var store = this.getObjectStore(objectStoreName, true);
        if (store) {

          var req = store.add(newData);

          req.onsuccess = function(event) {
            notification.show(i18n.successMessage.dataAddSuccess, 'success');
            x.util.handleCallback(callback, event.target.result);
          };

          req.onerror = function() {
            notification.show(i18n.errorMessage.dataAddError, 'error');
            x.util.handleCallback(callback, false);
          };

        } else {
          print(i18n.errorMessage.getObjectStore, 'error');
        }
      };

      this.remove = function(objectStoreName, filter, callback) {};

      /**
       * update ObjectStore
       * @param  {Object} filter
       *         eg:{
       *             target: String, // osName
       *             key: String, // filter key
       *             value: String|Number, // filter key value
       *             isID: Boolean, // does the key is the key field of os, default is true
       *             isBatch: Boolean // doese the condition unique, default is false
       *         }
       * @param  {Object} newDataConfig
       *         eg:{
       *             data: Object, // newData
       *             update: Function // it has a default param hold the old data Object,
       *                              // must return a new object represent
       *                              // the new data object
       *         }
       * @param {Function} callback callback for update successfully
       */
      this.update = function(filter, newDataConfig, callback) {
        if (!filter.target) {
          print(i18n.errorMessage.osUpdateParamError, 'error');
          x.util.handleCallback(callback, false);
          return false;
        }

        var store = this.getObjectStore(filter.target, true);

        if (store) {
          var getReq;
          if (filter.isID) {
            getReq = store.get(filter.value);
          } else {
            var index = store.index(filter.key);
            getReq = index.get(filter.value);
          }

          getReq.onsuccess = function(event) {
            var data = event.target.result;

            if (!data) {
              notification.show(i18n.errorMessage.getUpdateDataError, 'error');
              return false;
            }

            var originalData = $.extend({}, data);

            if (newDataConfig.update && 'function' === typeof newDataConfig.update) {
              data = newDataConfig.update(data);
            } else if (newDataConfig.data) {
              delete newDataConfig.data.ID;

              for (var key in newDataConfig.data) {
                data[key] = newDataConfig.data[key];
              }
            }

            var putReq;

            try {
              putReq = store.put(data);
            } catch (error) {
              notification.show(i18n.errorMessage.osUpdatePutError, 'error');
            }

            putReq.onsuccess = function() {
              x.util.handleCallback(callback, data.ID);
            };

            putReq.onerror = function() {
              var rollbackReq = store.put(originalData);

              rollbackReq.onsuccess = function() {
                notification.show(i18n.info.osUpdateRollbackDone, 'success');
              };

              rollbackReq.onerror = function() {
                notification.show(i18n.errorMessage.osUpdateRollbackError, 'error');
              };
            };
          };

          getReq.onerror = function(error) {
            print(error, 'error');
          };
        }
      };

      /**
       * Get data by specified conditions
       * @param  {Object}   filter
       * eg:{
       *     target: String // ObjectStore name
       *     condition:{ // Object|false
       *         key: String // Filter key
       *         isID: Boolean // Is the filter key id field, default is true
       *         value: String|Number // Filter key value
       *         isBatch: Boolean // Is get multi records, default is false
       *     },
       *     parse: Function // Parse the original data from object store
       * }
       * @param  {Function} callback [description]
       * @return {[type]}            [description]
       */
      this.get = function(filter, callback) {
        var store = this.getObjectStore(filter.target);

        if (store) {
          if (!filter.condition) {
            var req = store.openCursor();
            var data = [];
            req.onsuccess = function(event) {
              var cursor = event.target.result;
              if (cursor) {
                data.push(cursor.value);
                cursor.continue();
              } else {
                x.util.handleCallback(callback, [data]);
              }
            };
          } else {

          }
        }
      };

      /**
       * import data to db
       * @param  {Object} config
       * eg: {
       *     target: String
       *     data: Array,
       *     formatter: Function
       * }
       * @param {Function} callback function invoked while import done
       *
       */
      this.import = function(config, callback) {
        var it = this;

        var counter = new x.util.Counter(config.data.length, callback);

        var store = it.getObjectStore(config.target, true);

        if (store) {
          $.each(config.data, function(index, dataItem) {
            if (config.formatter) {
              dataItem = config.formatter(dataItem);
            }

            var req = store.add(dataItem);

            req.onsuccess = function() {
              counter();
            };

            req.onerror = function() {
              counter();
            };
          });
        }
      };

      this.export = function() {};
    }
  }

  return x.extend({
    indexedDB: xIndexedDB
  });
});