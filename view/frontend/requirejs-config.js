var config = {
    shim: {
        mapbox: {
            exports: 'mapboxgl'
        }
    },
    map: {
        '*': {
            mapbox: 'Salecto_Shipping/js/model/map-providers/mapbox'
        }
    },
    paths: {
        mapboxgl: 'Salecto_Shipping/lib/mapbox',
        Fuse: 'Salecto_Shipping/lib/fuse.min'
    },
    config: {
        mixins: {
            'Magento_Checkout/js/model/shipping-save-processor/payload-extender': {
                'Salecto_Shipping/js/mixins/model/shipping-save-processor/payload-extender-mixin': true
            },
            'Magento_Checkout/js/view/shipping': {
                'Salecto_Shipping/js/mixins/view/shipping-mixin': true
            }
        }
    }
};
