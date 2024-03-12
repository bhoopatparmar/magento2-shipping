define([
    'uiComponent',
    'ko',
    'jquery',
    'underscore',
    'Salecto_Shipping/js/model/parcel-shop/popup',
    'Salecto_Shipping/js/model/map',
    'mage/translate',
    'matchMedia'
], function(Component, ko, $, _, parcelShopPopup, map, $t) {

    return Component.extend({
        defaults: {
            mobileWidth: '648px',
            template: 'Salecto_Shipping/parcel-shop',
            modalTemplate: 'Salecto_Shipping/parcel-shop/popup',
            modalItemTemplate: 'Salecto_Shipping/parcel-shop/parcel-shop-entry',
            chosenItemTemplate: 'Salecto_Shipping/parcel-shop/chosen-item',

            provider: 'checkoutProvider',
            deps: 'checkoutProvider',
            label: $t('Find a Service Point'),

            links: {
                chosenParcelShop: '${ $.provider }:wexoShippingData.parcelShop',
                wexoShippingData: '${ $.provider }:wexoShippingData',

                shippingCountryId: '${ $.provider }:shippingAddress.country_id',
                shippingPostcode: '${ $.provider }:shippingAddress.postcode'
            },

            shippingMethod: '${ $.provider }:shipping_method',
            parcelShops: [],
            parcelShopSearcher: null,
            activeParcelShop: null,
            errorMessage: '',

            oldShippingMethodType: null
        },

        initialize: function() {
            this._super();
            this.source.on('shippingAddress.data.validate', this.validateAddress.bind(this));
            this.source.on('wexoShippingData.data.validate', this.validate.bind(this));

            this.chosenParcelShop.subscribe(function(value, oldValue) {
                oldValue && this._saveParcelShop();
                this.source.set('wexoShippingData.parcelShop', value);
                this.activeParcelShop(value);
                this.errorMessage('');
            }, this);

            this.shippingCountryId.subscribe(this.chosenParcelShop.bind(this, null));
            this.activeParcelShop.subscribe(this._onActiveParcelShop.bind(this));
            return this;
        },

        initObservable: function() {
            return this._super()
                .observe('parcelShops disableFields label chosenParcelShop postcode shippingPostcode shippingCountryId')
                .observe('wexoShippingData activeParcelShop errorMessage');
        },

        /**
         * @returns {{isValid: boolean, target: exports}}
         */
        validateAddress: function() {
            this.source.trigger('wexoShippingData.data.validate');
        },

        /**
         * @returns {{isValid: boolean, target: exports}}
         */
        validate: function() {
            var isValid = !!this.chosenParcelShop();

            if (!isValid) {
                this.source.set('params.invalid', true);
                this.errorMessage($t('You must choose a Service Point!'));
            }

            if(!isValid) {
                if($('.wexo-shipping-additional .field-error').length) {
                    $('body, html').animate({
                        scrollTop: jQuery('.wexo-shipping-additional').offset().top - (window.screen.height / 4)
                    }, 1000);
                }
            }

            return {
                isValid: isValid,
                target: this
            };
        },

        /**
         * @returns {*}
         */
        getFields: function() {
            return this.getRegion('fields');
        },

        /**
         * @private
         */
        _saveParcelShop: function() {
            var getUrl = window.location;
            var baseUrl = getUrl .protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];

            $.ajax({
                url: baseUrl+'/wexo_shipping/shipping/save',
                showLoader: true,
                data: {wexo_shipping_data: this.source.get('wexoShippingData')},
                type: "POST",
                dataType : 'json'
            });
        },

        search: function() {
            this.errorMessage('');
            if (!this.parcelShopSearcher) {
                throw 'parcelShopSearcher is null in Salecto_Shipping/js/view/parcel-shop';
            }
            let currentShippingMethod = $('#shipping-method-additional-load').data('current-shipping-method');
            let shippingAddress = currentShippingMethod && currentShippingMethod.shippingAddress ? currentShippingMethod.shippingAddress : this.source.shippingAddress;
            this.parcelShopSearcher(this.source.get('wexoShippingData'), shippingAddress.data.country_id, this)
                .done(function(result) {
                    this.parcelShops(result);

                    if (result && result.length) {
                        parcelShopPopup.open(this, this._onPopupShow.bind(this));

                        if (this.chosenParcelShop()) {
                            var foundParcelShop = _.findWhere(result, {
                                number: this.chosenParcelShop().number
                            });
                            if (foundParcelShop) {
                                this.activeParcelShop(foundParcelShop);
                                return;
                            }
                        }

                        this.activeParcelShop(result[0]);
                        this.errorMessage('');
                    }
                    else {
                        this.errorMessage($t('Sorry, we could not find any service points in your area'));
                    }
                }.bind(this));
        },

        _onPopupShow: function() {

        },

        getModalTemplate: function() {
            return this.modalTemplate;
        },

        getModalItemTemplate: function() {
            return this.modalItemTemplate;
        },

        getChosenItemTemplate: function() {
            return this.chosenItemTemplate;
        },

        setMapElement: function(element) {
            setTimeout(function() {
                map.changeElement(element);
            })
            this.activeParcelShop.valueHasMutated();
        },

        /**
         * @returns {*}
         */
        getPopupText: function() {
            return ko.pureComputed(function() {
                return $t('%1 service points').replace('%1', this.parcelShops().length);
            }, this);
        },

        /**
         * @private
         */
        _onActiveParcelShop: function(parcelShop) {
            if (parcelShopPopup.modal().options.isOpen && parcelShopPopup.component() === this) {
                
                map.clearMarkers();
                if(parcelShop.longitude && parcelShop.latitude) {
                    map.addMarker(
                        parcelShop.longitude,
                        parcelShop.latitude
                    );
                    setTimeout(function() {
                        map.moveTo(
                            parcelShop.longitude,
                            parcelShop.latitude
                        );
                    });    
                }

                if (window.matchMedia('(max-width: ' + this.mobileWidth + ')').matches) {
                    var $modalInnerWrapper = $('.ws-parcelshop-popup.modal-popup.modal-slide .modal-inner-wrap');
                    $modalInnerWrapper.animate({
                        scrollTop: $modalInnerWrapper.height()
                    }, 250);
                }
            }
        },

        /**
         * @returns {string}
         */
        formatOpeningHours: function() {
            return '';
        },

        setChoosenParcelShop: function(parcelShop) {
            this.chosenParcelShop(parcelShop);
            this._saveParcelShop();
            parcelShopPopup.close();
        },

        onModalClose: function(modal) {
        },

        showMap: function(parcelShop, element) {
            setTimeout(function() {
                map.changeElement(element);
                map.clearMarkers();
                map.addMarker(
                    parcelShop.longitude,
                    parcelShop.latitude
                );

                setTimeout(function() {
                    map.moveTo(
                        parcelShop.longitude,
                        parcelShop.latitude
                    );
                })
            });
        }
    });
});
