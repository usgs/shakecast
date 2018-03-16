import * as L from 'leaflet';

var epicIcon = L.icon({
    iconUrl: 'assets/epicenter.png',
    iconSize:     [32, 32], // size of the icon
    iconAnchor:   [16, 16], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
});

function createEventMarker(event: any) {
    const marker: any = L.marker([event.lat, event.lon], {icon: epicIcon});

    const popup = `<table class="my-table">    
                            <tr>
                                <th>ID:</th>
                                <td>` + event.event_id + `</td>
                            </tr>
                            <tr> 
                                <th>Magnitude:</th>
                                <td>` + event.magnitude + `</td>
                            </tr>
                            <tr>
                                <th>Depth:</th>
                                <td>` + event.depth + `</td>
                            </tr>
                            <tr>
                                <th>Latitude:</th>
                                <td>` + event.lat + `</td>
                            </tr>
                            <tr>
                                <th>Longitude:</th>
                                <td>` + event.lon + `</td>
                            </tr>
                            <tr>
                                <th>Description:</th>
                                <td>` + event.place + `</td>
                            </tr>
                        </table>`;

    marker.bindPopup(popup);

    return marker
}


export var epicenterLayer = {
    name: 'Epicenter',
    id: 'epicenter',
    url: (event) => {
        return null;
    },
    productType: null,
    legendImages: ['assets/legend-epicenter.png'],
    generateLayer: function (event, product=null) {

        return createEventMarker(event);

    }
};
