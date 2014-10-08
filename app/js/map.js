require(["esri/map",
        "application/bootstrapmap",
        "esri/geometry/Point",
        "esri/dijit/Scalebar",
        "esri/layers/FeatureLayer",
        "esri/layers/ArcGISTiledMapServiceLayer",
        "dojo/domReady!"],
    function (Map, BootstrapMap, Point, Scalebar, FeatureLayer, ArcGISTiledMapServiceLayer) {

        var mapCenter = new Point(-122.88149, 47.04299);
        var initialZoom = 8;
        var defaultBasemap = 'topo';

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

        // function to fetch remote content from AW
        var getDescription = function(awid){

            $.ajax({
                type: 'GET',
                url: "http://www.americanwhitewater.org/content/River/detail/id/" + awid,
                dataType: 'html',
                success: function(data) {

                    //cross platform xml object creation from w3schools
                    try //Internet Explorer
                    {
                        var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                        xmlDoc.async = "false";
                        xmlDoc.loadXML(data);
                    }
                    catch(e)
                    {
                        try // Firefox, Mozilla, Opera, etc.
                        {
                            var parser = new DOMParser();
                            var xmlDoc  = parser.parseFromString(data,"text/xml");
                        }
                        catch(e)
                        {
                            alert(e.message);
                            return;
                        }
                    }

                    // patch the prototype for what I need
                    xmlDoc.prototype.getKeyByValue = function( value ) {
                        for( var prop in this ) {
                            if( this.hasOwnProperty( prop ) ) {
                                if( this[ prop ] === value )
                                    return prop;
                            }
                        }
                    };

                    return(xmlDoc.getKeyByValue("River Description")[0].childNodes[0].nodeValue);
                }
            });
        };

        // add click event listener for put-ins
        whitewater.on("click", function(event){

            // access the attributes through event.graphic.attributes.<AttributeName>
            var attr = event.graphic.attributes;

            // create section string
            if (attr.nameSectionCommon) {
                var section = attr.nameSection + ': ' + attr.nameSectionComon;
            } else {
                var section = attr.nameSection;
            }

            // create link properties
            var linkUrl = "http://www.americanwhitewater.org/content/River/detail/id/" + attr.awid;
            var linkName = section;

            // populate dom with values
            $('span#riverName').text(attr.nameRiver);
            $('span#section').text(section);
            $('span#difficulty').text(attr.difficulty);
            $('a#linkUrl').attr('href', linkUrl);
            $('span#linkName').text(linkName);
            $('span#description').text(getDescription(attr.awid));
        });
    });