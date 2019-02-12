export class Layer {
    // External name of layer
    name: string;

    // for internal layer tracking
    id: string;

    // Layer generation function, must return leaflet layer
    generateLayer: any;

    /* Optional */

    // Leaflet layer, ready to plot
    layer: any = null;

    // Map API key
    mapKey: string = null;

    // Images to be displayed in a legend
    legendImages: string[] = [];

    // Type of data for url request
    productType: string = ''

    // Function that generates a url to get specific data
    url: any = () => {
        return null
    }

    // Data storage for persisting layers
    data: any = {};

    constructor(name: string,
                    id: string,
                    layerGenerator: any) {
        this.name = name;
        this.id = id;
        this.generateLayer = layerGenerator;
    }
}