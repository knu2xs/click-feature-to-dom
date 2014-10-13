require(["esri/map",
        "application/bootstrapmap",
        "esri/geometry/Point",
        "esri/dijit/Scalebar",
        "esri/layers/FeatureLayer",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/Color",
        "esri/layers/ArcGISTiledMapServiceLayer",
        "esri/graphic",
        "dojo/domReady!"],
    function (Map, BootstrapMap, Point, Scalebar, FeatureLayer, SimpleMarkerSymbol, SimpleLineSymbol, Color,
              ArcGISTiledMapServiceLayer, Graphic) {

        var mapCenter = new Point(-122.88149, 47.04299);
        var initialZoom = 9;
        var defaultBasemap = 'gray';

        // create map object centered on Olympia, WA
        var map = BootstrapMap.create("mapDiv", {
            basemap: defaultBasemap,
            center: mapCenter,
            zoom: initialZoom
        });

        // add a scalebar to the map
        new Scalebar({
            attachTo: 'bottom-left',
            map: map,
            scalebarUnit: 'dual'
        });

        // add hydro overlay to map
        var hydroOverlay = new ArcGISTiledMapServiceLayer(
            'http://hydrology.esri.com/arcgis/rest/services/WorldHydroReferenceOverlay/MapServer'
        );
        map.addLayer(hydroOverlay);

        // add the putin feature layer to the map
        var whitewater = new FeatureLayer(
            'http://services.arcgis.com/SgB3dZDkkUxpEHxu/ArcGIS/rest/services/whitewaterPutin/FeatureServer/0', {
                mode: FeatureLayer.MODE_SNAPSHOT,
                outFields: ["*"]
            });
        map.addLayer(whitewater);

        // go to initial map center and reset the basemap
        $('a.navbar-brand').on('click', function(){
            map.centerAndZoom(mapCenter, initialZoom);
            map.setBasemap(defaultBasemap);
        });

        // switch basemaps
        $('a#basemapGray').on('click', function(){
            map.setBasemap('gray');
        });
        $('a#basemapImagery').on('click', function(){
            map.setBasemap('hybrid');
        });
        $('a#basemapTopo').on('click', function(){
            map.setBasemap('topo');
        });
        $('a#basemapStreets').on('click', function(){
            map.setBasemap('streets');
        });

        // add click event listener for put-ins
        whitewater.on("click", function(event){

            // clear the map graphics layer
            map.graphics.clear();

            // symbol for clicked loction
            var pointSymbol = new SimpleMarkerSymbol(
                SimpleMarkerSymbol.STYLE_CIRCLE,
                12,
                new SimpleLineSymbol(
                    SimpleLineSymbol.STYLE_NULL,
                    new Color([247, 34, 101, 0.9]),
                    1
                ),
                new Color([207, 34, 171, 0.5])
            );

            // apply symbology to graphic
            var graphic =  new Graphic(event.mapPoint, pointSymbol);
            map.graphics.add(graphic);

            // access the attributes through event.graphic.attributes.<AttributeName>
            var attr = event.graphic.attributes;

            // create section string
            if (attr.nameSectionCommon) {
                var linkName = attr.nameSection + ': ' + attr.nameSectionComon;
            } else if (!attr.nameSection) {
                var linkName = attr.nameRiver;
            } else {
                var linkName = attr.nameSection;
            }

            // create link properties
            var linkUrl = "http://www.americanwhitewater.org/content/River/detail/id/" + attr.awid;

            // populate dom with values
            $('span#riverName').text(attr.nameRiver);
            $('span#section').text(linkName);
            $('span#difficulty').text(attr.difficulty);
            $('a#linkUrl').attr('href', linkUrl);
            $('span#linkName').text(linkName);
        });

        // form processing for filter by difficulty
        $('form#filterByDifficulty').submit( function() {

            // clear any graphics left over from previous selections
            map.graphics.clear();

            var diffArray = []; // array to store difficulty levels selected
            var query = ''; // store built query string

            // rapid difficulties
            var difficultyIdArray = [
                'classI',
                'classII',
                'classIII',
                'classIV',
                'classV',
                'classVI'
            ];

            // iterate checked difficulties and populate difficultyIdArray for processing below
            for (var i in difficultyIdArray) {

                // save difficulty input element
                var element = $('input#' + difficultyIdArray[i]);

                // if the element is checked, add it to the array
                if (element.prop('checked')) diffArray.push(element.val());
            }

            // if only interested in one difficulty
            if (diffArray.length === 1) {

                // create single sql statement
                query = "difficulty_max LIKE '" + diffArray[0] + "' OR " +
                    "difficulty_max LIKE '" + diffArray[0] + "+' OR " +
                    "difficulty_max LIKE '" + diffArray[0] + "-'";

            // otherwise, if there are multiple difficulty levels checked
            } else {

                // loop through every difficulty level
                for (var i in diffArray){

                    // if not the last, create sql for difficulty level and include 'OR' on the sql string
                    if ((diffArray.length - 1) > i ) {
                        query = query +
                            "difficulty_max LIKE '" + diffArray[i] + "' OR " +
                            "difficulty_max LIKE '" + diffArray[i] + "+' OR " +
                            "difficulty_max LIKE '" + diffArray[i] + "-' OR ";

                    // if last in the array, do not add 'OR' onto the end of the string
                    } else {
                        query = query +
                            "difficulty_max LIKE '" + diffArray[i] + "' OR " +
                            "difficulty_max LIKE '" + diffArray[i] + "+' OR " +
                            "difficulty_max LIKE '" + diffArray[i] + "-'";
                    }
                }
            }

            // apply the sql statement to the feature layer
            whitewater.setDefinitionExpression(query);

            // close the dialog
            $('div#difficultyModal').modal('hide')

        });
    });