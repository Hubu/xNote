define(['jquery', 'core'], function($, x) {
	'use strict';

	var varHolderRegExp = /{([^}]+)}/;

	var nodeType = {
		TEXT: 3,
		FRAGMENT: 11
	};

	var attributes = {
		TEMPLATE: 'template',
		DATA_SOURCE: 'source'
	};

	return x.extend({
		template: {
			/**
			 * Parse the variables hold by TextNode
			 *
			 * @method _renderTextNode
			 * @param {DOM} DOMElement
			 * @param {Object} data
			 */
			_renderTextNode: function(DOMElement, data) {
				var needRender = false;
				DOMElement.nodeValue = DOMElement.nodeValue.trim().replace(varHolderRegExp, function(match, p1) {
					needRender = true;
					return 'undefined' === typeof data[p1] ? '' : data[p1];
				});

				if (needRender) {
					if (DOMElement.previousElementSibling) {
						DOMElement.previousElementSibling.insertAdjacentHTML('afterEnd', DOMElement.nodeValue);
					} else {
						if (nodeType.FRAGMENT === DOMElement.parentNode) {
							DOMElement.parentNode.children[0].insertAdjacentHTML('beforeBegin', DOMElement.nodeValue);
						} else {
							DOMElement.parentNode.insertAdjacentHTML('afterBegin', DOMElement.nodeValue);
						}
					}
					DOMElement.remove();
				}
			},

			/**
			 * Get the render data path hold by the element's attribute
			 *
			 * @mthod _getSubItemRenderData
			 *
			 * @param {DOM} DOMElement
			 *
			 * @return {String} key
			 */
			_getSubItemRenderData: function(DOMElement) {
				return DOMElement.getAttribute(attributes.DATA_SOURCE) || {};
			},

			/**
			 * Parse the variable hold by element attributes
			 *
			 * @method _renderAttributes
			 * @param {DOM} DOMElement
			 * @param {Object} data
			 */
			_renderAttributes: function(DOMElement, data, context) {
				var it = this;
				$.each(DOMElement.attributes, function(index, attribute) {
					attribute.value = attribute.value.trim().replace(varHolderRegExp, function(match, p1) {
						return data[p1];
					});

					if (attributes.TEMPLATE === attribute.name) {
						var key = it._getSubItemRenderData(DOMElement);
						var itemContent = it.renderTemplate({
							templateID: attribute.value,
							templateData: data[key]
						}, context);
						$(DOMElement).prepend(itemContent);
					}
				}.bind(this));
			},

			/**
			 * Render both variable hold by nodes and atrributes of child elements
			 *
			 * @method _render
			 * @param {DOM} DOMElement
			 * @param {Object} data
			 *
			 * @return {DOM} element
			 */
			_render: function(DOMElement, data, context) {
				var it = this;

				$.each(DOMElement.childNodes, function() {
					if (nodeType.TEXT === this.nodeType && this.nodeValue.trim()) {
						it._renderTextNode(this, data);
					}
					if (this.attributes) {
						it._renderAttributes(this, data, context);
					}
					if (this.childNodes.length) {
						it._render(this, data, context);
					}
				});

				return DOMElement;
			},

			/**
			 * Render fragment with data passed
			 *
			 * @method renderTemplate
			 * @param {String} templateID
			 * @param {Object} datas
			 *
			 * return {DOM} fragmentElement
			 */
			renderTemplate: function(config, context) {
				if (!config) return false;

				config = config || {};

				var template = document.getElementById(config.templateID);

				if (!template)
					return false;

				var fragment = document.createDocumentFragment();

				var datas = config.templateData;
				if (!datas) {
					fragment = template.content.cloneNode(true);
				} else {
					if ($.type(datas) != 'array')
						datas = [datas];

					datas.forEach(function(data) {
						fragment.appendChild(this._render(template.content.cloneNode(true), data, context));
					}.bind(this));
				}

				if (config.events) {
					$.each(config.events, function(idx, event) {
						fragment.querySelector(event.target).addEventListener(event.eventName, function(e) {
							event.eventHandler.call(context, e);
						});
					});
				}

				return fragment;
			}
		}
	});
});