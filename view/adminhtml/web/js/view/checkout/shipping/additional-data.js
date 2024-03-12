define([
    'uiComponent',
    'ko',
    'underscore',
    'jquery'
], function(Component, ko, _, $) {

    return Component.extend({
        defaults: {
            template: 'Salecto_Shipping/checkout/shipping/additional-data.html'
        },
        additionalData: null,
        initialize: function() {
            this._super();
            let currentShippingMethod = $('#shipping-method-additional-load').data('current-shipping-method');
            this.additionalData = ko.pureComputed(function() {
                if (!currentShippingMethod.shipping_method) {
                    return null;
                }
                return _.findWhere(this.elems(), {
                    index: currentShippingMethod.shipping_method.carrier_code + '-' +
                    currentShippingMethod.shipping_method.extension_attributes.wexo_shipping_method_type_handler
                });
            }, this);
            return this;
        },
        currentAdditionalData: function () {
            let currentShippingMethod = $('#shipping-method-additional-load').data('current-shipping-method');
            this.additionalData = ko.pureComputed(function() {
                if (!currentShippingMethod.shipping_method) {
                    return null;
                }
                return _.findWhere(this.elems(), {
                    index: currentShippingMethod.shipping_method.carrier_code + '-' +
                    currentShippingMethod.shipping_method.extension_attributes.wexo_shipping_method_type_handler
                });
            }, this);

            return this.additionalData;
        }
    });
});
