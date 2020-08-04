import * as L from 'leaflet';
import { Layer } from './layer';

const epicIcon = L.icon({
    iconUrl: 'assets/epicenter.png',
    iconSize:     [40, 40], // size of the icon
    iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
});

function createEventMarker(event: any) {
    const props = event.properties;
    const marker: any = L.marker([props.lat, props.lon], {icon: epicIcon});

    const popup = `<table class="my-table">
                            <tr>
                                <th>ID:</th>
                                <td>` + props.event_id + `</td>
                            </tr>
                            <tr> 
                                <th>Magnitude:</th>
                                <td>` + props.magnitude + `</td>
                            </tr>
                            <tr>
                                <th>Depth:</th>
                                <td>` + props.depth + `</td>
                            </tr>
                            <tr>
                                <th>Latitude:</th>
                                <td>` + props.lat + `</td>
                            </tr>
                            <tr>
                                <th>Longitude:</th>
                                <td>` + props.lon + `</td>
                            </tr>
                            <tr>
                                <th>Description:</th>
                                <td>` + props.place + `</td>
                            </tr>
                        </table>`;

    marker.bindPopup(popup);

    return marker;
}

function layerGenerator(event, product = null) {
        return createEventMarker(event);
}

const epiLayer = new Layer('Epicenter',
                            'epicenter',
                            layerGenerator);

epiLayer.legendImages = ['assets/legend-epicenter.png'];

export const epicenterLayer = epiLayer;
