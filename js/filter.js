
var remove_my_bread_crumbs = function () {
    $("li[id=filterSelection]").remove();
    on_pakistan_click();
    layerremover();
}
var remove_my_bread_crumbs_Sector = function () {
    $("li[id=filterSelectionSector]").remove();
    on_pakistan_click();
    layerremover();
}


var load_Division_Data = function (div_code, divnm, divId) {
     divNm = divnm;
    var divisionQry = "division_name   ='" + divnm + "'";
   L.esri.query({
            url: "http://202.166.168.183:6080/arcgis/rest/services/Punjab/Punjab_pdi_satellite_data_db84_09032022/MapServer/0",
            position: 'back'
        }).where(divisionQry).run(function (error, result) {
            if (typeof glayer != 'undefined') {
                glayer.clearLayers();
                /*mymap.removeLayer(glayer);*/
            };

            glayer = L.geoJson(result, { style: myStyle });
            mymap.fitBounds(glayer.getBounds());
            mymap.addLayer(glayer);
            mymap.addLayer(streetLights);


        });

    document.getElementById("main").style.marginTop = '220px';
    $("#menu-buttons-divisions a").each(function (index, elem) {
        $(elem).removeClass("active");
    });
    $("#" + divId).addClass("active");
    var id = divId.split("_");

     global_click = "division";
    global_div_code = div_code;
    global_division = id[1];
    global_district = "";
    global_dist_code = "";
    global_tehsil_id = "";
    global_tehsil_code = "";
    $.ajax({
        type: "POST",
        url: "/PunDashboard/GetDivCount",
        data: {
            divID: id[1]
        },
        success: function (Response) {

            $('#dtlmain').show();
            $('#divDtl').show();
            $('#divCount').text(Response);
            $('#tehDtl').hide();
            $('#distDtl').hide();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            autoLoader(xhr.statusText, "error");
        }
    });

    update_bread_crumbs("division", div_code);


    loadDistricts(id[1]);
   $("#na-buttons").html("");
    $("#div_na").hide();
    $("#pp-buttons").html("");
    $("#div_pp").hide();
    $("#ucmc-buttons").html("");
    $("#div_ucmcDetail").hide();
}