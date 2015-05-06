define(['jquery'], function($) {
	'use strict';

	function X() {
		this.version = "1.0.0";
		this.extend = function(obj) {
			return $.extend.apply(this, arguments);
		};
	}

	X.prototype = {
		/**
		 * Extend jQuery plugin
		 * @param  {Function} Constructor new plugin Constructor
		 */
		extend$fn: function(Constructor) {
			if (!Constructor || "function" != typeof Constructor) {
				console.error("Extend $.fn failed, cuz there is no valid plugin Constructor passed in!");
				return false;
			}

			var pluginName = Constructor.name;
			if ("function" == typeof $.fn[pluginName]) {
				console.error(pluginName, "plugin has already here or 'name' conflict!");
				return false;
			}

			function make(target, pluginName, Constructor, options) {
				var instance = $.data(target, pluginName);
				if (instance) return instance;
				return $.data(target, pluginName, new Constructor(target, options));
			}

			$.fn[pluginName] = function(options) {
				return this.each(function() {
					make(this, pluginName, Constructor, options);
				}).data(pluginName);
			};
		}
	};

	var x = new X();

	x.extend({
		util: {
			/**
			 * UUID generator
			 * @return {String} uuid
			 */
			uuid: function() {
				function s4() {
					return Math.floor((1 + Math.random()) * 0x10000)
						.toString(16)
						.substring(1);
				}
				return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
					s4() + '-' + s4() + s4() + s4();
			},

			/**
			 * Get element bounding info
			 * @param  {Object|String} target target will be test
			 * @return {Object}        bounding infomation
			 */
			getBounds: function(target) {
				if ("object" == typeof target && target.jquery) target = target[0];
				else if ("string" == typeof target) target = $(target)[0];

				if (target.nodeName) return target.getBoundingClientRect();
				return new Error("Can't get target bounds info!");
			},

			/**
			 * Random number generator
			 * @param  {Nubmer} min low boundary of the number
			 * @param  {Nubmer} max high boundary of the number
			 * @return {Number}     random number
			 */
			random: function(min, max) {
				return Math.random() * (max - min) + min;
			},

			/**
			 * Random int nubmer generator
			 * @param  {Number} min low boundary of int number
			 * @param  {Number} max high boundary of int number
			 * @return {Number}     random int number
			 */
			randomInt: function(min, max) {
				return Math.floor(Math.random() * (max - min + 1) + min);
			},

			/**
			 * Counter generator
			 * @param  {Number}   sum      times to count
			 * @param  {Function} callback function to call while count finished
			 * @return {Function}          count function
			 */
			Counter: function(sum, callback) {
				var counter = 0;
				return function() {
					if (++counter === sum) {
						if (callback && 'function' === typeof callback) {
							callback();
						}
					}
				};
			},

			/**
			 * Callback handler
			 * @param  {Function} callback callback function will be handled
			 * @param  {Arguments}   args  
			 *         args will be applied to callback call.
			 *         if there is only one arg you can omit 
			 *         the bracket except the Array type param. 
			 *         that is to say if there is an Array type parameter
			 *         you must pass it as following style
			 *         		eg: [param]		param is equal [1, 2, 3]
			 * @param  {Object}   context  callback contaxt
			 */
			handleCallback: function(callback, args, context) {
				if('array' != $.type(args)){
					args = [args];
				}

				if (callback && 'function' === typeof callback) {
					callback.apply(context || window, args);
				}
			}
		},
		fx: {},
		widget: {
			xAffix: {
				affixedInstances: [],
				hasPrev: function() {
					return this.affixedInstances.length;
				},
				prev: function() {
					return this.affixedInstances.slice(-1)[0];
				},
				push: function(data) {
					this.affixedInstances.push(data);
				},
				pop: function() {
					this.affixedInstances.pop();
				}
			},
			xNotification: {
				messageItemList: []
			}
		},
		algorithm: {
			/**
			 * BinarySearch algorithm
			 * @param  {Array}   arr        the target array will be search
			 * @param  {Number}   startIndex where the search poniter start
			 * @param  {Number}   stopIndex  where the search pointer stop
			 * @param  {Function} callback   function to determine how to while serarch pointer in the middle of the array
			 * @return {Number}              matched number index
			 */
			binarySearch: function(arr, startIndex, stopIndex, callback) {
				var arr_length = arr.length,
					args_length = arguments.length;

				if (args_length < 2) throw new RangeError('Method need 2 args at least but now has ' + args_length);

				if (1 === arr_length) return 0;

				callback = arguments[args_length - 1];

				if ('function' !== typeof callback) throw new TypeError('Last arg expect a function');

				if (2 === args_length) {
					stopIndex = arr_length ? arr_length - 1 : 0;
					startIndex = 0;
				} else if (3 === args_length) {
					stopIndex = arguments[1];
					startIndex = 0;
				}

				function doSearch(arr, startIndex, stopIndex, callback) {
					if (1 === stopIndex - startIndex) {
						return (0 >= callback(arr[startIndex], startIndex, arr) ? startIndex : stopIndex);
					}

					var pivotIndex = stopIndex >> 1;

					var pivot = callback(arr[pivotIndex], pivotIndex, arr);

					if (0 === pivot) return pivotIndex;
					else if (pivot < 0) return doSearch(arr, startIndex, pivotIndex, callback);
					else return doSearch(arr, pivotIndex + 1, arr_length - 1, callback);
				}

				return doSearch(arr, startIndex, stopIndex, callback);
			},

			/**
			 * Find the closest number to target
			 * @return {Number} the closest one
			 */
			minAfterReduce: function() {
				var args = Array.prototype.slice.call(arguments),
					calibration = args.shift(),
					d_value = calibration,
					min;

				args.forEach(function(value) {
					var new_d_value = Math.abs(value - calibration);
					if (new_d_value < d_value) {
						d_value = new_d_value;
						min = value;
					}
				});

				return min;
			}
		}
	});

	return x;
});