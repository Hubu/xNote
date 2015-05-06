define([], function() {
  'use strict';

  var message = {
    'zh-cn': {
      logMessagePrefix: '[笔记输出信息]',
      info: {
        dbInitDone: '存储对象更新完成',
        browserSupport: '你的浏览器对indexedDB支持良好',
        osDeleteDone: '存储对象已经删除',
        defaultDataImportDone: '缺省数据导入完毕',
        osUpdateRollbackDone: '更新失败，已回滚',
        dbVersionErrorConfirmation: '数据库版本错误，是否尝试打开更高版本的数据库？'
      },
      errorMessage: {
        getObjectStore: '获取存储对象错误！',
        browserNotSupport: '你的浏览器不支持indexedDB！',
        osUpdateParamError: '参数错误，没有指明需要更新的存储对象名称！',
        osUpdateRollbackError: '更新失败，回滚失败！',
        osUpdatePutError: '数据更新错误！',
        dataAddError: '数据插入失败！',
        getUpdateDataError: '获取更新数据失败！',
        deleteOSError: '删除存储对象时出现错误！',
        deleteDBError: '删除数据库错误！'
      },
      successMessage: {
        deleteDB: '数据库已删除',
        dataAddSuccess: '数据插入成功'
      }
    },
    'en-us': {
      logMessagePrefix: '[xNote message]',
      info: {
        dbInitDone: 'All objectStores update have done!',
        browserSupport: 'Your browser support indexedDB  well',
        osDeleteDone: 'Ojectstores delete done.',
        defaultDataImportDone: 'DB default import has done!',
        osUpdateRollbackDone: 'Update error data has rollback!',
        dbVersionErrorConfirmation: 'Database version error \nDo you want to try open a heigher version?'
      },
      errorMessage: {
        getObjectStore: 'Error occured while get objectStore!',
        browserNotSupport: 'Your browser does not support indexDB well!',
        osUpdateParamError: 'Valid parameter, you nedd specify the objectStoreName which to update!',
        osUpdateRollbackError: 'Update error, data rollback error too!',
        osUpdatePutError: 'Data update error!',
        dataAddError: 'Data add error!',
        getUpdateDataError: 'Get update data error',
        deleteOSError: 'Error occured while try to delete objectStore!',
        deleteDBError: 'Error occured whild try to delete db!'
      },
      successMessage: {
        deleteDB: 'Database delete successfully.',
        dataAddSuccess: 'Data add successfully.'
      }
    }
  };

  return message[navigator.language.toLowerCase()];
});