import * as L from 'leaflet';
import { Layer } from './layer';

function generateLayer(event, product=null) {
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

let intLayer = new Layer('Intensity Map',
                            'intensity_map',
                            generateLayer);

intLayer.url = (event) => {
    return 'api/shakemaps/' + event.event_id;
};

intLayer.productType = 'json';

export let intensityLayer = intLayer;
