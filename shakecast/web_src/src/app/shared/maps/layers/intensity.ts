import * as L from 'leaflet';
import { Layer } from './layer';

function generateLayer(event, product) {

    if (!product || !product.features) {
        return null;
    }
    const latestProduct = product.features[0];

    if (!latestProduct) {
      return null;
    }

    const imageUrl = `api/shakemaps/${latestProduct.properties.shakemap_id}/overlay`;
    const imageBounds = [[latestProduct.properties.lat_min,
            latestProduct.properties.lon_min],
            [latestProduct.properties.lat_max,
            latestProduct.properties.lon_max]];

    const overlayLayer = L.imageOverlay(imageUrl,
            imageBounds,
            {opacity: .4});

    return overlayLayer;
}

const intLayer = new Layer('Intensity Map',
                            'intensity_map',
                            generateLayer);

intLayer.url = (event) => {
    return `api/shakemaps/${event.properties.event_id}`;
};

intLayer.productType = 'json';

export let intensityLayer = intLayer;
