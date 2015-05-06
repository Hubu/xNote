;
! function($, undefined) {
	'use strict';
	
	function xValidator(element, options) {
		var it = this;
		this.$Elt = element;
		this.domElt = element.get(0);
		this.validatElts = this.$Elt.find('[xvalidate]');
		this.validateSate = true;
		var defaultOptons = {
			triggerEvent: 'blur',
			validators: {
				email: {
					pattern: /^{[^}+]}$/,
					requireMessage: 'required',
					errorMessage: 'error occured'
					// callback: function() {}
				}
			}
		};
		options = $.extend(true, defaultOptons, options);

		this.showMessage = function(message){
			alert(message);
		}

		this.validate = function() {
			$.each(this.validatElts, function(){
				$(this).trigger(options.triggerEvent);
			});

			return this.validateSate;
		};

		this.addEventHandlerToValidateElts = function() {
			var it = this;
			$.each(this.validatElts, function() {
				$(this).on(options.triggerEvent, function() {
					var validator = options.validators[this.name];
					if (validator.callback) {
						callback.call(this, this.value);
						return;
					}

					if (!this.value) {
						it.showMessage(validator.requireMessage);
						return it.validateSate = false;
					}

					if (!validator.pattern.test(this.value)) {
						it.showMessage(validator.errorMessage);
						return it.validateSate = false;
					}

					return it.validateSate = true;
				});
			});
		}

		this.init(options);
	}

	xValidator.prototype = {
		init: function() {
			this.addEventHandlerToValidateElts();
			return this;
		}
	};

	$.fn.xValidator = function(options) {
		return new xValidator(this, options);
	}
}(jQuery);