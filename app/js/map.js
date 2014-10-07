require(["esri/map",
        "application/bootstrapmap",
        "esri/dijit/Scalebar",
        "esri/layers/FeatureLayer",
        "dojo/domReady!"],
    function (Map, BootstrapMap, Scalebar, FeatureLayer) {

        // create map object centered on Olympia, WA
        var map = BootstrapMap.create("mapDiv", {
            basemap: "gray",
            center: [-122.88149, 47.04299],
            zoom: 10
        });

        // add a scalebar to the map
        new Scalebar({
            attachTo: 'bottom-left',
            map: map,
            scalebarUnit: 'dual'
        });

        // add the putin feature layer to the map
        var featureLayerPutIn = new FeatureLayer(
            'http://services.arcgis.com/SgB3dZDkkUxpEHxu/ArcGIS/rest/services/whitewaterPutin/FeatureServer/0'
        );
        map.addLayer(featureLayerPutIn);
    });