define([
    'uiComponent',
    'Magento_Checkout/js/model/payment/additional-validators',
    'Salecto_Shipping/js/model/shipping-validator'
], function(
    Component,
    additionalValidators,
    shippingRatesValidator
) {
    'use strict';
    additionalValidators.registerValidator(shippingRatesValidator);
    return Component;
});
