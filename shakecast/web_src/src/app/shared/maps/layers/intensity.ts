import * as L from 'leaflet';
import { Layer } from './layer';

function generateLayer(event, product = null) {
    // Grab the latest map
    const latestProduct = product[0];

    if (!latestProduct) {
        return null;
    }

    const imageUrl = 'api/shakemaps/' + latestProduct.shakemap_id + '/overlay';
    const imageBounds = [[latestProduct.lat_min, latestProduct.lon_min], [latestProduct.lat_max, latestProduct.lon_max]];

    const overlayLayer = L.imageOverlay(imageUrl,
                    imageBounds,
                    {opacity: .4});

    return overlayLayer;
}

const intLayer = new Layer('Intensity Map',
                            'intensity_map',
                            generateLayer);

intLayer.url = (event) => {
    return 'api/shakemaps/' + event.event_id;
};

intLayer.productType = 'json';

export let intensityLayer = intLayer;
