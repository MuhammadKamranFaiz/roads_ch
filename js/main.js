let vector_tile_layer;
var res_geojson_vlayer;
let vector_tile_layer_extent;
let vector;
let draw; // global so we can remove it later
var coords;

var start_time_val;
var end_time_val;

var start_date_time;
var end_date_time;
var road_type_node;
var road_name_val;

var raod_name;
var road_link;
var speed_perc;

var chart = null;




/** Date input anc verification*/
// var date_input = $('input[name="date"]'); //our date input has the name "date"
// var container = $('.bootstrap-iso form').length > 0 ? $('.bootstrap-iso form').parent() : "body";

// date_input.datepicker({
//     format: 'mm-dd-yyyy',
//     container: container,
//     todayHighlight: true,
//     autoclose: true,
// });

// $(function () {
//     $('#dtpickerdemo').datetimepicker();
// });

/** Basemap Layers*/

$(document).ready(function () {



})

var baseLayers = new ol.layer.Group({
    title: 'Base Maps',
    openInLayerSwitcher: true,
    layers: [
        new ol.layer.Tile({
            title: "Google Maps",
            baseLayer: true,
            visible: true,
            source: new ol.source.XYZ({
                url: "https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}"
            })
        }),
        new ol.layer.Tile({
            title: "Google Hybrid",
            baseLayer: true,
            visible: false,
            source: new ol.source.XYZ({
                url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            })
        }),
        new ol.layer.Tile({
            title: "Toner",
            baseLayer: true,
            visible: false,
            source: new ol.source.Stamen({ layer: "toner" })
        }),
        new ol.layer.Tile({
            title: "BingRoads",
            visible: false,
            baseLayer: true,
            source: new ol.source.BingMaps({
                key: "AiP4UsVvGInuNdLUTYNlMoGZA1Hx3-CEBgWoZKtBExJvzwmNKI8De3oCxG_n7FE1",
                imagerySet: "RoadOnDemand"
            })
        }),
        new ol.layer.Tile({
            title: "BingAerialLabels",
            visible: false,
            baseLayer: true,
            source: new ol.source.BingMaps({
                key: "AiP4UsVvGInuNdLUTYNlMoGZA1Hx3-CEBgWoZKtBExJvzwmNKI8De3oCxG_n7FE1",
                imagerySet: "AerialWithLabelsOnDemand"
            })
        }),
    ],
});


/** Vector Layer*/
const source = new ol.source.Vector({ wrapX: false });

vector = new ol.layer.Vector({
    source: source,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(0, 0, 0, 0)'
        }),
        stroke: new ol.style.Stroke({
            color: 'rgba(255, 0, 0, 0.2)',
            width: 2
        })
    })
});

/** Map Object */
var map = new ol.Map({
    target: 'map',
    layers: [
        baseLayers, vector //, vector_tile_layer

    ],
    view: new ol.View({
        // center: ol.proj.fromLonLat([46.753202, 24.727579]),
        center: [46.753202, 24.727579],
        projection: 'EPSG:4326',
        zoom:11
    })
});


var init_extent = map.getView().calculateExtent();

//tooltip start
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');


// Popup

var popup = new ol.Overlay({
    element: container,
    autoPan: true,
    position: undefined,
    autoPanAnimation: {
        duration: 250
    },
});
map.addOverlay(popup);

popup.on('change:position',function(evet){
    if (chart !== null) {
        $(".highcharts-data-table").hide();
        chart.destroy();
        chart = null;
    } 

});

closer.onclick = function () {
    if (chart !== null) {
        $(".highcharts-data-table").hide();
        chart.destroy();
        chart = null;
        
    } 

    popup.setPosition(undefined);
    closer.blur();
    return false;
};

// end Popup

function addInteraction() {

    let geometryFunction = new ol.interaction.Draw.createBox();

    draw = new ol.interaction.Draw({
        source: source,
        type: 'Circle',
        geometryFunction: geometryFunction,
    });
    map.addInteraction(draw);

}







// $(".dropdown-menu li a").click(function () {

//     start_time_val = $('#startTime').val();
//     var end_time_val = $('#endTime').val();

//     start_date_time = new Date(start_time_val);
//     end_date_time = new Date(end_time_val);


//     road_type_node = $("input[name='road_type_radio']:checked")[0].id;
//     // road_name_val = $("input[name='road_name']:text").val();

//     var selText = $(this).text();

//     if (selText == 'Enter Road name') {

//         if (typeof res_geojson_vlayer != 'undefined' || res_geojson_vlayer != null) {
//             clearLayers();
//         }

//         $("#aoi_selection").css("visibility", "hidden");
//         $("#road_name_selection").css("visibility", "visible");
//     } else if (selText == 'Draw AOI') {

//         if (typeof res_geojson_vlayer != 'undefined' || res_geojson_vlayer != null) {
//             clearLayers();
//         }
//         // $("#legend").css("visibility", "hidden");
//         $("#road_name_selection").css("visibility", "hidden");
//         $("#aoi_selection").css("visibility", "visible");
//     }




// });


$('#submit_road').click(function () {

    start_time_val = $('#startTime').val();
    end_time_val = $('#endTime').val();

    start_date_time = new Date(start_time_val);
    end_date_time = new Date(end_time_val);
    road_type_node = $("input[name='road_type_radio']:checked")[0].id;

    if (typeof res_geojson_vlayer != 'undefined' || res_geojson_vlayer != null) {
        clearLayers();
    }

    var road_name_val = $("input[name='road_name']:text").val();

    if (road_name_val == "") {
        alert("Please Enter Road Name");
    } else {
        if (start_time_val == "" || end_time_val == "") {
            alert('Please select the start and End time');
        } else {

            var req_body_json = {};
            var bbox = [];


            req_body_json.BBox = bbox;
            req_body_json.roadName = road_name_val;
            req_body_json.startDateTime = start_date_time.getTime();
            req_body_json.endDateTime = end_date_time.getTime();
            req_body_json.roadType = parseInt(road_type_node);


            console.log(JSON.stringify(req_body_json));
            addVectorLayer(req_body_json);
        }

    }

    // alert(road_name_val);




});


/**Button Click Event*/
$('#getExtent').click(function () {

    if (typeof res_geojson_vlayer != 'undefined' || res_geojson_vlayer != null) {
        clearLayers();
    }

    start_time_val = $('#startTime').val();
    end_time_val = $('#endTime').val();

    start_date_time = new Date(start_time_val);
    end_date_time = new Date(end_time_val);
    road_type_node = $("input[name='road_type_radio']:checked")[0].id;

    if (start_time_val == "" || end_time_val == "") {
        alert('Please select the start and End time');
    } else {

        addInteraction();
        vector.getSource().clear();


        draw.on('drawend', function (e) {

            coords = e.feature.getGeometry().getCoordinates()[0];

            var req_body_json = {};
            var bbox = [];


            req_body_json.BBox = bbox;


            for (var i = 0; i < coords.length - 1; i++) {

                // var proj_coord = new ol.proj.transform([coords[i][0], coords[i][1]], 'EPSG:3857', 'EPSG:4326');
                var req_body_coord = {};
                req_body_coord.latitude = parseFloat(coords[i][1].toFixed(6));
                req_body_coord.longitude = parseFloat(coords[i][0].toFixed(6));


                bbox.push(req_body_coord);

            }

            req_body_json.roadName = "";
            req_body_json.startDateTime = start_date_time.getTime();
            req_body_json.endDateTime = end_date_time.getTime();
            req_body_json.roadType = parseInt(road_type_node);


            console.log(JSON.stringify(req_body_json));

            addVectorLayer(req_body_json);

            map.removeInteraction(draw);

        });


    }
});

/**Button Click Clear Data*/
function clearLayers() {
    // $('#clear_data').click(function () {
    map.removeInteraction(draw);
    $("#legend").css("visibility", "hidden");
    // map.removeInteraction(draw);
    // refreshVectorTileLayer(vector_tile_layer_extent);
    vector.getSource().clear();
    map.removeLayer(vector);
    res_geojson_vlayer.getSource().clear();
    map.removeLayer(res_geojson_vlayer);
    // map.addLayer(vector_tile_layer);
    // map.getView().fit(init_extent);

    // });
}

$('#clear_data').click(function () {

    $("#legend").css("visibility", "hidden");
    map.removeInteraction(draw);
    vector.getSource().clear();
    map.removeLayer(vector);
    res_geojson_vlayer.getSource().clear();
    map.removeLayer(res_geojson_vlayer);

});

/**Referech and clear cache of vector tile layer of filtered extent*/
// function refreshVectorTileLayer(layer) {
//     var lyr_source = layer.getSource();
//     // lyr_source.tileCache.expireCache({});
//     // lyr_source.tileCache.clear();
//     lyr_source.refresh();
// }

function addVectorLayer(req_body_json) {
    $.ajax({
        contentType: 'application/json',
        data: JSON.stringify(req_body_json),
        dataType: 'json',
        async: false,
        crossDomain: true,
        success: responseGeoJson,
        error: function () {
            console.log("Device control failed");
        },
        processData: false,
        headers: {
            "accept": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        type: 'POST',
        // url: 'https://ac47ead6-c270-4118-afb8-eec73676a142.mock.pstmn.io/roads'
        url: 'https://ahoytrafficanalytics.azurewebsites.net/api/segment/overspeed?code=BpU6y1_022H7QFc6CpUdxUdP4xqxg6Px8659Lpsux7NQAzFuLhM7bw=='
    });


    var res_geojson;
    function responseGeoJson(data) {
        console.log("device control succeeded");
        res_geojson = data;
        console.log(JSON.stringify(res_geojson));
    }

    var vectorSource = new ol.source.Vector({
        features: new ol.format.GeoJSON().readFeatures(JSON.stringify(res_geojson))
    });

    res_geojson_vlayer = new ol.layer.Vector({
        source: vectorSource,
        visible: true,
        style: function (feature, res) {

            var overspeed_val = feature.getProperties().overSpeedPercentage;
            var color_ramp_val;
            if (overspeed_val == 0.0) {
                color_ramp_val = 'rgba(56, 168, 0, 0.5)';
            } else if (overspeed_val > 0.0 && overspeed_val < 20.0) {
                color_ramp_val = 'rgba(230, 230, 0, 0.5)';
            } else if (overspeed_val > 20.0 && overspeed_val < 40.0) {
                color_ramp_val = 'rgba(255, 170, 0, 0.5)';
            } else if (overspeed_val > 40.0 && overspeed_val < 60.0) {
                color_ramp_val = 'rgba(205, 170, 102, 0.5)';
            } else if (overspeed_val > 6.0 && overspeed_val < 80.0) {
                color_ramp_val = 'rgba(197, 0, 255, 0.5)';
            } else if (overspeed_val > 80.0 && overspeed_val <= 100.0) {
                color_ramp_val = 'rgba(230, 0, 0, 0.5)';
            }

            return new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(0, 0, 0, 0)'
                }),
                stroke: new ol.style.Stroke({
                    color: color_ramp_val,
                    width: 4
                })
            })
        },
    });

    console.log(res_geojson_vlayer.getProperties());

    $("#legend").css("visibility", "visible");

    var filter_extent = vectorSource.getExtent();
    // map.getView().fit(vectorSource.getExtent());
    map.getView().fit(filter_extent);
    map.addLayer(res_geojson_vlayer);



    map.on('singleclick', function (evt) {

        var layer_filter = map.hasFeatureAtPixel(evt.pixel, function (layer) {
            return layer.get('name') === 'res_geojson_vlayer'; // boolean
        });

        if (layer_filter === true) {
            var coordinate = evt.coordinate;
            console.log(res_geojson_vlayer.getProperties());
            var features = map.getFeaturesAtPixel(evt.pixel);

            raod_name = features[0].getProperties().name;
            speed_perc = features[0].getProperties().overSpeedPercentage;
            road_link = features[0].getProperties().link;

            if (raod_name == 'undefined' || raod_name == null) {
                return;
            }
            content.innerHTML = "<p><b> Road Name:</b> " + raod_name + "</p>" + "<p> <b>Overspeed Percentage:</b> " + speed_perc + "</p>" +
                "<p> <b>Link :</b> " + road_link + "</p>" + "\n" +
                "<button type=\"button\" class=\"btn btn-primary btn-block\" data-bs-toggle=\"modal\" style=\"background:#2FA085;border-radius:0; font-size: 12px;padding: 1px;\" data-bs-target=\"#charts_modal\"> Analytics </button> ";
            // content.innerHTML = features[0].getProperties().overSpeedPercentage;
            popup.setPosition(coordinate);
            popup.setPosition(coordinate);
        } else {
            popup.setPosition(undefined);
            closer.blur();
        }

        console.log('Road Name: '+raod_name);

        req_charts_body = {};
        req_charts_body.startDateTime = start_date_time.getTime();
        req_charts_body.endDateTime = end_date_time.getTime();
        req_charts_body.link = road_link;

        // console.log(JSON.stringify(req_charts_body));



        $.ajax({
            contentType: 'application/json',
            data: JSON.stringify(req_charts_body),
            dataType: 'json',
            async: false,
            crossDomain: true,
            success: responseGeoJsonChart,
            error: function () {
                console.log("Device control failed");
            },
            processData: false,
            headers: {
                "accept": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            type: 'POST',
            // url: 'https://0d4f6e6e-31a6-4f96-be6d-48a12a3d5068.mock.pstmn.io/roadcharts'
            url: 'https://ahoytrafficanalytics.azurewebsites.net/api/segment/detail?code=hnRCH5TpGPggpgwq7rlZ7QVX35np--dQq2nkBSUHild5AzFuKfHiXw=='
        });

        var res_geojson_charts;
        function responseGeoJsonChart(data) {
            console.log("device control succeeded");
            res_geojson_charts = data;
            // console.log(JSON.stringify(res_geojson_charts));
        }

        if ( typeof res_geojson_charts !== 'undefined' ) {

            var sppeed_limit = res_geojson_charts.speedLimit;
            var speed_data = res_geojson_charts.speedData;
            var charts_cat = [];
            var charts_data = [];
            var charts_speedLimits = [];


            for (var i = speed_data.length - 1; i >= speed_data.length - 24; i--) {
                charts_cat.push(new Date(speed_data[i].scanTime).toUTCString());
                charts_data.push(speed_data[i].speed);
                charts_speedLimits.push(sppeed_limit);
            }

            console.log(charts_cat);
            console.log(charts_data);
            console.log(charts_speedLimits);

            chart = Highcharts.chart('container', {
                title: {
                    text: 'Speed Analytics of road ' + raod_name + ' and road link: ' + road_link,
                    align: 'left'
                },
                xAxis: {
                    // categories: ['Mar 16 2022 19:25:59', 'Mar 16 2022 19:30:59', 'Mar 16 2022 19:25:59', 'Mar 16 2022 19:35:59', 'Mar 16 2022 19:40:59','Mar 16 2022 19:45:59', 'Mar 16 2022 19:50:59', 'Mar 16 2022 20:00:59', 'Mar 16 2022 20:05:59', 'Mar 16 2022 20:10:59','Mar 16 2022 20:15:59', 'Mar 16 2022 20:20:59', 'Mar 16 2022 20:25:59', 'Mar 16 2022 20:30:59', 'Mar 16 2022 20:35:59']
                    categories: charts_cat
                },
                yAxis: {
                    title: {
                        text: 'km/h'
                    }
                },
                credits: {
                    enabled: false
                },
                style: {
                    fontFamily: 'Comfortaa'
                },
                labels: {
                    items: [{
                        html: 'Speed Scan Time',
                        style: {
                            left: '50px',
                            top: '18px',
                            color: ( // theme
                                Highcharts.defaultOptions.title.style &&
                                Highcharts.defaultOptions.title.style.color
                            ) || 'black'
                        }
                    }]
                },
                series: [{
                    type: 'column',
                    name: 'Speed Scan Time',
                    // data: [49, 65, 78, 81, 102, 68, 76, 72, 63, 88, 95, 73, 62, 92, 71]
                    data: charts_data
                }, {
                    type: 'spline',
                    name: 'Speed Limit',
                    // data: [70, 70, 70, 70, 70,70, 70, 70, 70, 70,70, 70, 70, 70, 70],
                    data: charts_speedLimits,
                    marker: {
                        lineWidth: 2,
                        lineColor: Highcharts.getOptions().colors[3],
                        fillColor: 'white'
                    }
                }]
            });
        }

    });


}
// to destroy old chart 
$('#charts_modal').on('hidden.bs.modal', function () {

    // if (chart !== null) {
    //     chart.destroy();
    //     chart = null;
    // } 



});



