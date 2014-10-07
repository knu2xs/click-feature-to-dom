require(["esri/map",
        "application/bootstrapmap",
        "esri/layers/FeatureLayer",
        "dojo/domReady!"],
    function (Map, BootstrapMap, FeatureLayer) {
        <!-- Get a reference to the ArcGIS Map class -->
        var map = BootstrapMap.create("mapDiv", {
            basemap: "national-geographic",
            center: [-122.88149, 47.04299],
            zoom: 10
        });
        var featureLayerPutIn = new FeatureLayer(
            'http://services.arcgis.com/SgB3dZDkkUxpEHxu/ArcGIS/rest/services/whitewaterPutin/FeatureServer/0'
        );
        map.addLayer(featureLayerPutIn);
    });