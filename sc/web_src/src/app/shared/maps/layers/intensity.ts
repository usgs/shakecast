import * as L from 'leaflet';

export var intensityLayer = {
    name: 'ShakeMap',
    id: 'intensity_map',
    url: (event) => {
        return 'api/shakemaps/' + event.event_id;
    },
    productType: 'json',
    legendImages: [],
    generateLayer: function (event, product=null) {
        if (product == null) {
            return null;
        }

        // Grab the latest map
        product = product[0];
        var imageUrl = 'api/shakemaps/' + product.shakemap_id + '/overlay';
        var imageBounds = [[product.lat_min, product.lon_min], [product.lat_max, product.lon_max]];

        const overlayLayer = L.imageOverlay(imageUrl, 
                        imageBounds, 
                        {opacity: .4})

        return overlayLayer;

    }
};
