/*global */
/*jslint browser:true,sloppy:true,nomen:true,unparam:true,plusplus:true */
/*
 | Copyright 2012 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */
var imgArray = []; //array defined for images
var defaultFeature;
var activityQueryString = "";
var searchFlag = false;
var addressFlag = true;

//Get candidate results for searched address

function LocateAddress() {
    searchFlag = true;

    var thisSearchTime = lastSearchTime = (new Date()).getTime();
    activityQueryString = "";

    var address = [];
    var txtAddressValue;
    if (!searchAddressViaPod) {
        isFeatureSearched = false;
        RemoveChildren(dojo.byId("tblAddressResults"));
        RemoveScrollBar(dojo.byId("divAddressScrollContainer"));
        if (dojo.byId("txtAddress").value.trim() === "") {
            dojo.byId("txtAddress").focus();
            return;
        }
        dojo.byId("txtPodAddress").blur();
        address[locatorSettings.Locators[0].LocatorParameters] = dojo.byId("txtAddress").value;
        txtAddressValue = dojo.byId('txtAddress').value;
    } else {
        RemoveChildren(dojo.byId("tblPodAddressResults"));
        RemoveScrollBar(dojo.byId("divPodAddressScrollContainer"));
        if (dojo.byId("txtPodAddress").value.trim() === "") {
            dojo.byId("txtPodAddress").focus();
            return;
        }
        address[locatorSettings.Locators[0].LocatorParameters] = dojo.byId("txtPodAddress").value;
        txtAddressValue = dojo.byId('txtPodAddress').value;
    }
    var locator = new esri.tasks.Locator(locatorSettings.Locators[0].LocatorURL);
    locator.outSpatialReference = map.spatialReference;

    if (!searchAddressViaPod) {
        dojo.byId("imgSearchLoader").style.display = "block";
    } else {
        dojo.byId("imgPodSearchLoader").style.display = "block";
    }

    var params = {};
    for (var bMap = 0; bMap < baseMapLayers.length; bMap++) {
        if (baseMapLayers[bMap].MapURL) {
            if (map.getLayer(baseMapLayers[bMap].Key).visible) {
                var baseMapExtent = map.getLayer(baseMapLayers[bMap].Key).fullExtent;
            }
        }
    }
    var searchFieldName = locatorSettings.Locators[0].LocatorParameters.SearchField;
    var addressField = {};
    addressField[searchFieldName] = txtAddressValue;

    var options = {};
    options["address"] = addressField;
    options["outFields"] = locatorSettings.Locators[0].LocatorOutFields;
    options[locatorSettings.Locators[0].LocatorParameters.SearchBoundaryField] = baseMapExtent;
    locator.outSpatialReference = map.spatialReference;
    locator.addressToLocations(options);
    locator.on("address-to-locations-complete", function (candidates) {
        // Discard searches made obsolete by new typing from user
        if (thisSearchTime < lastSearchTime) {
            return;
        }
        ShowLocatedAddress(candidates.addresses, null);
        if (!searchAddressViaPod) {
            dojo.byId("imgSearchLoader").style.display = "none";
        } else {
            dojo.byId("imgPodSearchLoader").style.display = "none";
        }
    }, function (err) {
        HideProgressIndicator();
        if (!searchAddressViaPod) {
            dojo.byId("imgSearchLoader").style.display = "none";
        } else {
            dojo.byId("imgPodSearchLoader").style.display = "none";
        }

        ShowLocatedAddress(err.details, err.message)
    });
}

//Populate candidate address list in address container

function ShowLocatedAddress(candidates, error) {
    if (!searchAddressViaPod) {
        RemoveChildren(dojo.byId("tblAddressResults"));
        RemoveScrollBar(dojo.byId("divAddressScrollContainer"));
        if (dojo.byId("txtAddress").value.trim() === "") {
            dojo.byId("txtAddress").focus();
            RemoveChildren(dojo.byId("tblAddressResults"));
            RemoveScrollBar(dojo.byId("divAddressScrollContainer"));
            dojo.byId("imgSearchLoader").style.display = "none";
            return;
        }
    } else {
        RemoveChildren(dojo.byId("tblPodAddressResults"));
        RemoveScrollBar(dojo.byId("divPodAddressScrollContainer"));
        if (dojo.byId("txtPodAddress").value.trim() === "") {
            dojo.byId("txtPodAddress").focus();
            RemoveChildren(dojo.byId("tblPodAddressResults"));
            RemoveScrollBar(dojo.byId("divPodAddressScrollContainer"));
            dojo.byId("imgPodSearchLoader").style.display = "none";
            return;
        }
    }

    if (candidates.length > 0) {
        if (!searchAddressViaPod) {
            var tableResults = dojo.byId("tblAddressResults");
        } else {
            var tableResults = dojo.byId("tblPodAddressResults");
        }
        var tBodyResults = document.createElement("tbody");
        tableResults.appendChild(tBodyResults);
        tableResults.cellSpacing = 0;
        tableResults.cellPadding = 0;

        var hasValidRecords = false;
        var validResult = true;
        var searchFields = [];
        var addressFieldName = locatorSettings.Locators[0].AddressSearch.FilterFieldName;
        var addressFieldValues = locatorSettings.Locators[0].AddressSearch.FilterFieldValues;
        var placeFieldName = locatorSettings.Locators[0].PlaceNameSearch.FilterFieldName;
        var placeFieldValues = locatorSettings.Locators[0].PlaceNameSearch.FilterFieldValues;
        for (var s in addressFieldValues) {
            searchFields.push(addressFieldValues[s]);
        }
        if (locatorSettings.Locators[0].PlaceNameSearch.Enabled) {
            if (!searchAddressViaPod) {
                searchFields.push(locatorSettings.Locators[0].PlaceNameSearch.LocatorFieldValue);
            }
        }
        for (var i in candidates) {
            if (candidates[i].attributes[locatorSettings.Locators[0].AddressMatchScore.Field] > locatorSettings.Locators[0].AddressMatchScore.Value) {
                var locatePoint = new esri.geometry.Point(Number(candidates[i].location.x), Number(candidates[i].location.y), map.spatialReference);
                for (j in searchFields) {
                    if (candidates[i].attributes[addressFieldName].toUpperCase() == searchFields[j].toUpperCase()) {
                        if (candidates[i].attributes[addressFieldName].toUpperCase() == locatorSettings.Locators[0].PlaceNameSearch.LocatorFieldValue.toUpperCase()) {
                            for (var placeField in placeFieldValues) {
                                if (candidates[i].attributes[placeFieldName].toUpperCase() != placeFieldValues[placeField].toUpperCase()) {
                                    validResult = false;
                                } else {
                                    validResult = true;
                                    break;
                                }
                            }
                        } else {
                            validResult = true;
                        }
                        if (validResult) {
                            var candidate = candidates[i];
                            var trResults = document.createElement("tr");
                            tBodyResults.appendChild(trResults);
                            var tdData = document.createElement("td");
                            try {
                                tdData.innerHTML = dojo.string.substitute(locatorSettings.Locators[0].DisplayField, candidate.attributes);

                                tdData.align = "left";
                                tdData.className = "bottomborder";
                                tdData.style.cursor = "pointer";
                                tdData.height = 20;

                                if (candidate.attributes[addressFieldName] == locatorSettings.Locators[0].PlaceNameSearch.LocatorFieldValue) {
                                    for (var field in locatorSettings.Locators[0].PlaceNameSearch.FilterFieldValues) {
                                        if (candidate.attributes[placeFieldName] == placeFieldValues[field]) {
                                            var ext = { xmin: candidate.attributes.xmin, ymin: candidate.attributes.ymin, xmax: candidate.attributes.xmax, ymax: candidate.attributes.ymax };
                                            tdData.setAttribute("county", dojo.toJson(ext));
                                            break;
                                        }
                                        else {
                                            tdData.setAttribute("county", "");
                                        }
                                    }
                                }
                                else {
                                    tdData.setAttribute("county", "");
                                }

                                tdData.setAttribute("x", candidate.location.x);
                                tdData.setAttribute("y", candidate.location.y);
                                tdData.setAttribute("address", dojo.string.substitute(locatorSettings.Locators[0].DisplayField, candidate.attributes));
                            } catch (err) {
                                alert(messages.getElementsByTagName("falseConfigParams")[0].childNodes[0].nodeValue);
                            }
                            if (searchAddressViaPod) {
                                tdData.onclick = function () {

                                    countySearch = false;

                                    if (!isMobileDevice) {
                                        map.infoWindow.hide();
                                        selectedGraphic = null;
                                    }
                                    mapPoint = new esri.geometry.Point(Number(this.getAttribute("x")), Number(this.getAttribute("y")), map.spatialReference);
                                    addressFlag = false;
                                    setTimeout(function () {
                                        ShowProgressIndicator();
                                    }, 200);
                                    dojo.byId("txtPodAddress").value = this.innerHTML;
                                    lastPodSearchString = dojo.byId("txtPodAddress").value;
                                    dojo.byId("txtPodAddress").setAttribute("defaultAddress", this.innerHTML);
                                    dojo.byId("txtPodAddress").setAttribute("defaultAddressPodTitle", "");
                                    dojo.addClass(dojo.byId("txtAddress"), "colorChange");
                                    map.getLayer(tempGraphicsLayerId).clear();
                                    var symbol = new esri.symbol.PictureMarkerSymbol(locatorSettings.DefaultLocatorSymbol, locatorSettings.MarkupSymbolSize.width, locatorSettings.MarkupSymbolSize.height);
                                    var attr = {
                                        Address: dojo.byId("txtPodAddress").value
                                    };
                                    var graphic = new esri.Graphic(mapPoint, symbol, attr, null);
                                    map.getLayer(tempGraphicsLayerId).add(graphic);
                                    ConfigureRoute(mapPoint, map.getLayer(highlightLayerId).graphics[0].geometry);

                                    HideInfoContainer();
                                }
                            }
                            else {
                                tdData.onclick = function () {
                                    var countyExtent;
                                    if (this.getAttribute("county")) {
                                        countySearch = true;
                                        var countyExtent = CreateExtentForCounty(dojo.fromJson(this.getAttribute("county")));
                                        var pThis = this;
                                        geometryService.project([countyExtent], map.spatialReference, function (results) {
                                            if (results.length) {
                                                countyExtent = new esri.geometry.Extent(parseFloat(results[0].xmin), parseFloat(results[0].ymin), parseFloat(results[0].xmax), parseFloat(results[0].ymax), map.spatialReference);
                                                map.setExtent(countyExtent);
                                                AddressResultsClick(countyExtent, pThis);
                                            }
                                        });
                                    } else {
                                        countySearch = false;
                                        AddressResultsClick(countyExtent, this);
                                    }

                                };
                            }
                            trResults.appendChild(tdData);
                            hasValidRecords = true;
                        }
                    }
                }
            }
        }
        if (!hasValidRecords) {
            var trNoResults = document.createElement("tr");
            tBodyResults.appendChild(trNoResults);
            var tdNoResults = document.createElement("td");
            tdNoResults.align = "left";
            tdNoResults.className = "bottomborder";
            tdNoResults.height = 20;
            tdNoResults.innerHTML = messages.getElementsByTagName("invalidSearch")[0].childNodes[0].nodeValue;
            trNoResults.appendChild(tdNoResults);
        }
        SetHeightAddressResults();
        SetHeightViewDirections();
    } else {
        mapPoint = null;
        if (!searchAddressViaPod) {
            dojo.byId("imgSearchLoader").style.display = "none";
            var tableResults = dojo.byId("tblAddressResults");
        } else {
            var tableResults = dojo.byId("tblPodAddressResults");
            dojo.byId("imgPodSearchLoader").style.display = "none";

        }
        var tBodyResults = document.createElement("tbody");
        tableResults.appendChild(tBodyResults);
        tableResults.cellSpacing = 0;
        tableResults.cellPadding = 0;
        var trResults = document.createElement("tr");
        tBodyResults.appendChild(trResults);
        var tdNoResults = document.createElement("td");
        if (!error) {
            tdNoResults.innerHTML = messages.getElementsByTagName("invalidSearch")[0].childNodes[0].nodeValue;
        } else {
            tdNoResults.innerHTML = error;
        }
        tdNoResults.align = "left";
        tdNoResults.className = "bottomborder";
        dojo.addClass(tdNoResults, "cursorDefault");
        tdNoResults.height = 20;
        trResults.appendChild(tdNoResults);
    }
}

//function for getting the values of a particular address

function AddressResultsClick(countyExtent, evt) {
    if (!isMobileDevice) {
        map.infoWindow.hide();
        selectedGraphic = null;
    }
    mapPoint = new esri.geometry.Point(Number(evt.getAttribute("x")), Number(evt.getAttribute("y")), map.spatialReference);
    addressFlag = true;
    dojo.byId("txtAddress").setAttribute("defaultAddress", evt.innerHTML);
    dojo.byId("txtAddress").setAttribute("defaultAddressTitle", "");
    dojo.addClass(dojo.byId("txtAddress"), "colorChange");
    dojo.byId("txtAddress").value = evt.innerHTML;
    lastSearchString = dojo.byId("txtAddress").value.trim();
    LocateAddressOnMap(countySearch, countyExtent);
    dojo.byId("spanFeatureListContainer").innerHTML = "";
}

//function to get the extent of county

function CreateExtentForCounty(ext) {
    var projExtent;
    projExtent = new esri.geometry.Extent({
        "xmin": parseFloat(ext.xmin),
        "ymin": parseFloat(ext.ymin),
        "xmax": parseFloat(ext.xmax),
        "ymax": parseFloat(ext.ymax),
        "spatialReference": {
            "wkid": 4326
        }
    });
    return projExtent;
}
//Locate searched address on map with pushpin graphic

function LocateAddressOnMap(countySearch, countyExtent, currentAddress) {
    map.infoWindow.hide();
    map.getLayer(tempGraphicsLayerId).clear();
    for (var bMap = 0; bMap < baseMapLayers.length; bMap++) {
        if (baseMapLayers[bMap].MapURL) {
            if (map.getLayer(baseMapLayers[bMap].Key).visible) {
                var bmap = baseMapLayers[bMap].Key;
            }
        }
    }

    if (!isFeatureSearched) {
        if (!map.getLayer(bmap).fullExtent.contains(mapPoint)) {
            mapPoint = null;
            HideAddressContainer();
            map.getLayer(tempBufferLayer).clear();
            map.getLayer(highlightLayerId).clear();
            map.getLayer(routeLayerId).clear();
            WipeOutResults();
            dojo.byId("imgToggleResults").setAttribute("disable", true);
            alert(messages.getElementsByTagName("geoLocation")[0].childNodes[0].nodeValue);
            HideProgressIndicator();
            return;
        }
    }
    fromInfoWindow = false;
    if (!countySearch) {
        DoBuffer(bufferDistance, mapPoint);
        var symbol = new esri.symbol.PictureMarkerSymbol(locatorSettings.DefaultLocatorSymbol, locatorSettings.MarkupSymbolSize.width, locatorSettings.MarkupSymbolSize.height);
    } else {
        if (isMobileDevice) {
            mapPoint = null;
        }
        QueryLayer(countyExtent, null, isFeatureSearched);

    }


    if (!searchAddressViaPod) {
        var attr = {
            Address: dojo.byId("txtAddress").value
        };
    } else {
        var attr = {
            Address: dojo.byId("txtPodAddress").value
        };
    }

    var attr = {
        Address: currentAddress ? currentAddress: dojo.byId("txtAddress").value
    };
    var graphic = new esri.Graphic(mapPoint, symbol, attr, null);
    map.getLayer(tempGraphicsLayerId).add(graphic);

    if (!isMobileDevice) {

        dojo.byId("divImageBackground").style.display = "block";
    }
    HideAddressContainer();
}

//Draw the buffer

function DoBuffer(bufferDistance, mapPoint) {
    if (mapPoint && bufferDistance) {
        var params = new esri.tasks.BufferParameters();
        params.distances = [bufferDistance];
        params.unit = esri.tasks.GeometryService.UNIT_STATUTE_MILE;
        params.bufferSpatialReference = map.spatialReference;
        params.outSpatialReference = map.spatialReference;
        params.geometries = [mapPoint];
        geometryService.buffer(params, ShowBuffer);
        features = [];
    }
}

function GetStylesSheet(type) {
    var color;
    for (var i = 0; i < themeCSS.length; i++) {
        if (themeCSS[i].selectorText == type) {
            color = themeCSS[i].style.backgroundColor;
            break;
        }
    }
    return color;
}

//Display the buffer

function ShowBuffer(geometries) {
    ClearBuffer();
    imgArray = [];
    var bufferColor = GetStylesSheet(".BufferColor");
    var lineColor = new dojo.colorFromRgb(bufferColor);
    var fillColor = new dojo.colorFromRgb(bufferColor);
    fillColor.a = 0.45;
    var bufferSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
        new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
            lineColor, 2),
        fillColor);
    AddGraphic(map.getLayer(tempBufferLayer), bufferSymbol, geometries[0]);
    map.setExtent(geometries[0].getExtent().expand(1.6));
    setTimeout(function () {
        QueryLayer(geometries[0], mapPoint);
    }, 500);
}

//Getting the features and their length with in the buffer region

function QueryLayer(geometry, mapPoint, isFeatureSearched) {
    map.getLayer(routeLayerId).clear();
    newLeft = 0;
    if (!isMobileDevice) {
        dojo.byId("divCarouselDataContent").style.left = "0px";
        ResetSlideControls();
    }
    RemoveChildren(dojo.byId("divFeatureList"));
    RemoveChildren(dojo.byId("divResultDataContent"));
    if (activityQueryString !== "") {
        var queryTask = new esri.tasks.QueryTask(devPlanLayerURL);
        var query = new esri.tasks.Query();
        query.outFields = ["*"];
        query.returnGeometry = true;
        query.where = activityQueryString;
        queryTask.execute(query, function (relatedRecords) {
            activityQueryString = "";
            var featureSet = new esri.tasks.FeatureSet();
            var features = [];
            if (relatedRecords.features.length > 0) {

                for (var i in relatedRecords.features) {
                    features.push(relatedRecords.features[i]);
                }
                featureSet.features = features;
                ExecuteQueryForFeatures(featureSet, geometry, mapPoint, isFeatureSearched);
            } else {
                HideProgressIndicator();
                selectedFeatureID = null;
                WipeOutResults();
                dojo.byId("imgToggleResults").setAttribute("disable", true);
            }
        });
    } else {
        var qTask = new esri.tasks.QueryTask(devPlanLayerURL);
        var query = new esri.tasks.Query();

        if (geometry) {
            query.geometry = geometry;
            query.spatialRelationship = esri.tasks.Query.SPATIAL_REL_CONTAINS;
            query.where = "1=1";
        } else {
            if (searchedFeature.match("'")) {
                searchedFeature = searchedFeature.split("'");
                searchedFeature = searchedFeature[0] + "''" + searchedFeature[1];
            }
            query.where = nameAttribute + " ='" + searchedFeature.trim() + "'";
        }
        query.outFields = ["*"];
        query.returnGeometry = true;
        ShowProgressIndicator();
        qTask.execute(query, function (featureset) {
            if (featureset.features.length > 0) {
                dojo.byId("imgToggleResults").setAttribute("disable", false);
                ExecuteQueryForFeatures(featureset, geometry, mapPoint, isFeatureSearched);
            } else {
                HideProgressIndicator();
                alert(messages.getElementsByTagName("noFeaturesFound")[0].childNodes[0].nodeValue);
                selectedFeatureID = null;
                WipeOutResults();
                dojo.byId("imgToggleResults").setAttribute("disable", true);
            }
        }, function (err) {
            HideProgressIndicator();
            alert(messages.getElementsByTagName("serviceError")[0].childNodes[0].nodeValue);
            selectedFeatureID = null;
            WipeOutResults();
            dojo.byId("imgToggleResults").setAttribute("disable", true);
        });
    }
}

function ExecuteQueryForFeatures(featureset, geometry, mapPoint, isFeatureSearched) {
    if (!isMobileDevice) {
        dojo.byId("imgToggleResults").setAttribute("disable", false);
        WipeInResults();
    }
    var featureSet = [];
    for (var i = 0; i < featureset.features.length; i++) {
        for (var j in featureset.features[i].attributes) {
            if (!featureset.features[i].attributes[j]) {
                featureset.features[i].attributes[j] = showNullValueAs;
            }
        }
        var directions = [];
        var dist;
        if (mapPoint) {
            dist = GetDistance(mapPoint, featureset.features[i].geometry);
        }
        try {
            featureSet.push({
                facilityID: dojo.string.substitute(facilityId, featureset.features[i].attributes),
                name: dojo.string.substitute(featureName, featureset.features[i].attributes),
                address: dojo.string.substitute(infoWindowContent[0].FieldName, featureset.features[i].attributes),
                distance: dist,
                geometry: featureset.features[i].geometry,
                attributes: featureset.features[i].attributes
            });
        } catch (err) {
            alert(messages.getElementsByTagName("falseConfigParams")[0].childNodes[0].nodeValue);
        }
    }
    if (dist) {
        featureSet.sort(function (a, b) {
            return parseFloat(a.distance) - parseFloat(b.distance);
        });
    }
    if (!isMobileDevice) {
        if (dojo.byId("spanFeatureActivityContainer")) {
            dojo.byId("spanFeatureActivityContainer").style.display = "none";
        }
        try {
            if (!isFeatureSearched) {
                if (!countySearch) {
                    dojo.byId("spanFeatureListContainer").innerHTML = dojo.string.substitute(messages.getElementsByTagName("numberOfFeaturesFoundNearAddress")[0].childNodes[0].nodeValue, [featureset.features.length]);
                } else {
                    dojo.byId("spanFeatureListContainer").innerHTML = dojo.string.substitute(messages.getElementsByTagName("numberOfFeaturesFoundNearCounty")[0].childNodes[0].nodeValue, [featureset.features.length]);
                }
            } else {
                dojo.byId("spanFeatureListContainer").innerHTML = dojo.string.substitute(messages.getElementsByTagName("numberOfFeaturesFoundBySearch")[0].childNodes[0].nodeValue, [featureset.features.length]);
            }
        } catch (err) {
            alert(messages.getElementsByTagName("falseConfigParams")[0].childNodes[0].nodeValue);
        }
        var tableFeatureList = dojo.create("table", {
            "className": "tblFeatureList",
            "cellspacing": "0"
        }, dojo.byId("divFeatureList"));

    } else {
        var tableFeatureList = dojo.create("table", {
            "className": "tblFeatureList",
            "cellspacing": "0"
        }, dojo.byId("divResultDataContent"));
    }
    var tbodyFeatureList = dojo.create("tbody", {}, tableFeatureList);

    for (var i = 0; i < featureSet.length; i++) {
        var trFeatureList = dojo.create("tr", {}, tbodyFeatureList);
        var tdFeatureList = dojo.create("td", {}, trFeatureList);

        tdFeatureList.setAttribute("count", i);
        tdFeatureList.setAttribute("address", featureSet[i].address);
        tdFeatureList.setAttribute("fName", featureSet[i].facilityID);

        tdFeatureList.className = "selectedFeature";
        if (featureSet[i].distance) {
            if (approximateValue) {
                tdFeatureList.innerHTML = featureSet[i].name + " (" + dojo.number.format(featureSet[i].distance.toFixed(2)) + " miles " + approximateValue + ")";
            } else {
                tdFeatureList.innerHTML = featureSet[i].name + " (" + dojo.number.format(featureSet[i].distance.toFixed(2)) + " miles)";
            }
        } else {
            tdFeatureList.innerHTML = featureSet[i].name;
        }
        tdFeatureList.onclick = function () {
            searchFlag = true;
            ShowProgressIndicator();
            imgArray = [];
            for (var i = 0; i < handlersPod.length; i++) {
                dojo.disconnect(handlersPod[i]);
            }
            handlersPod = [];
            map.infoWindow.hide();
            selectedGraphic = null;
            selectedFeature = null;
            dojo.byId("tdTotalDistance").innerHTML = "";
            dojo.byId("tdTotalTime").innerHTML = "";
            RemoveChildren(dojo.byId("divDirection"));
            var point = this.getAttribute("count");
            var featureID = featureSet[point].attributes[map.getLayer(devPlanLayerID).objectIdField];
            dojo.byId("spanDirectionHeader").setAttribute("featureName", featureSet[point].name);
            defaultFeature = featureSet[point];
            map.getLayer(highlightLayerId).clear();
            var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, locatorRippleSize, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.colorFromRgb(GetStylesSheet(".RippleColor")), 4), new dojo.Color([0, 0, 0, 0]));
            AddGraphic(map.getLayer(highlightLayerId), symbol, featureSet[point].geometry);
            dojo.query(".nodeBackgroundColor", tableFeatureList).forEach(dojo.hitch(this, function (node) {
                dojo.removeClass(node, "nodeBackgroundColor");
            }));
            dojo.addClass(this, "nodeBackgroundColor");
            if (!isMobileDevice) {
                fromInfoWindow = false;
                selectedFeature = featureSet[this.getAttribute("count")].geometry;
                if (selectedFeature) {
                    if (map.getLayer(tempBufferLayer).graphics.length > 0) {
                        setTimeout(function () {
                            map.setExtent(GetBrowserMapExtent(selectedFeature));
                        }, 500);
                    } else {
                        map.centerAndZoom(selectedFeature, zoomLevel);
                    }
                }
                RelationshipQuery(selectedFeature, featureID, featureSet[point].attributes);
                dojo.byId("spanDirectionHeader").innerHTML = "Directions to " + featureSet[point].name;
                dojo.byId("spanFeatureInfo").innerHTML = featureSet[point].name;
                if (map.getLayer(tempGraphicsLayerId).graphics.length > 0) {
                    ShowProgressIndicator();
                    if (!countySearch) {
                        ConfigureRoute(map.getLayer(tempGraphicsLayerId).graphics[0].geometry, featureSet[point].geometry);
                    }
                } else {
                    NewAddressSearch();
                }
            } else {
                HideSearchResultContainer();
                selectedFeature = featureSet[this.getAttribute("count")].geometry;
                if (mapPoint) {
                    dojo.byId("imgDirections").style.display = "block";
                    dojo.byId("divInfoDirections").style.display = "none";
                }
                RelationshipQuery(selectedFeature, featureID, featureSet[point].attributes, isFeatureSearched);
                ShowInfoDetailsView();
                if (map.getLayer(tempBufferLayer).graphics.length > 0) {
                    dojo.byId("imgList").style.display = "block";
                }
                HideProgressIndicator();
            }

        };
    }
    try {
        map.getLayer(highlightLayerId).clear();
        if (geometry) {
            defaultFeature = featureSet[0];
        } else {

            for (var i in featureSet) {
                if (dojo.string.substitute(featureName, featureSet[i].attributes) === dojo.byId("txtAddress").value) {
                    defaultFeature = featureSet[i];
                }
            }

        }

        if (!defaultFeature || isFeatureSearched) {
            defaultFeature = featureSet[0];
            selectedFeature = featureSet[0].geometry;
            if (!isMobileDevice) {
                map.centerAndZoom(selectedFeature, zoomLevel);
            }
        }

        var featureID = defaultFeature.attributes[map.getLayer(devPlanLayerID).objectIdField];
        map.getLayer(highlightLayerId).clear();
        dojo.byId("spanDirectionHeader").setAttribute("featureName", dojo.string.substitute(featureName, defaultFeature.attributes));
    } catch (err) {
        alert(messages.getElementsByTagName("falseConfigParams")[0].childNodes[0].nodeValue);
    }
    if (!isMobileDevice) {
        fromInfoWindow = false;
        RelationshipQuery(selectedFeature, featureID, defaultFeature.attributes);
        map.getLayer(highlightLayerId).clear();
        var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, locatorRippleSize, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.colorFromRgb(GetStylesSheet(".RippleColor")), 4), new dojo.Color([0, 0, 0, 0]));
        AddGraphic(map.getLayer(highlightLayerId), symbol, defaultFeature.geometry);
        try {
            dojo.byId("spanDirectionHeader").innerHTML = "Directions to " + dojo.string.substitute(featureName, defaultFeature.attributes);
            dojo.byId("spanFeatureInfo").innerHTML = dojo.string.substitute(featureName, defaultFeature.attributes);
        } catch (err) {
            alert(messages.getElementsByTagName("falseConfigParams")[0].childNodes[0].nodeValue);
        }
        if (mapPoint) {
            if (isBrowser) {
                ConfigureRoute(mapPoint, defaultFeature.geometry);
            } else {
                if (isMobileDevice || isTablet) {
                    ConfigureRoute(mapPoint, defaultFeature.geometry);
                }
            }
        } else {
            NewAddressSearch();
        }
        try {
            dojo.addClass(dojo.query("[fName = " + dojo.string.substitute(facilityId, defaultFeature.attributes) + " ]", dojo.byId("divFeatureList"))[0], "nodeBackgroundColor");
        } catch (err) {
            alert(messages.getElementsByTagName("falseConfigParams")[0].childNodes[0].nodeValue);
        }

    } else {
        try {
            fromInfoWindow = true;
            HideProgressIndicator();
            map.infoWindow.resize(225, 60);
            if (!isFeatureSearched) {
                if (mapPoint) {
                    selectedGraphic = mapPoint;
                    var screenPoint = map.toScreen(selectedGraphic);
                    screenPoint.y = map.height - screenPoint.y;
                    map.infoWindow.show(screenPoint);
                    map.setExtent(GetInfoWindowMobileMapExtent(mapPoint));
                    map.infoWindow.setTitle((currentLocation) ? textForGeoLocation : dojo.byId("txtAddress").value.trimString(18), function () {
                        ShowSearchResultsContainer();
                    });
                    currentLocation = false;
                    map.infoWindow.setContent("");
                } else {
                    ShowSearchResultsContainer();
                }
            } else {
                RelationshipQuery(selectedFeature, featureID, defaultFeature.attributes, true);

                dojo.query("[fName = " + dojo.string.substitute(facilityId, defaultFeature.attributes) + " ]", dojo.byId("divResultDataContent")).forEach(function (node) {
                    dojo.addClass(node, "nodeBackgroundColor");
                });
            }
            if (!isFeatureSearched) {
                if (!countySearch) {
                    dojo.byId("spanTitle").innerHTML = dojo.string.substitute(messages.getElementsByTagName("numberOfFeaturesFoundNearAddress")[0].childNodes[0].nodeValue, [featureset.features.length]);
                } else {
                    dojo.byId("spanTitle").innerHTML = dojo.string.substitute(messages.getElementsByTagName("numberOfFeaturesFoundNearCounty")[0].childNodes[0].nodeValue, [featureset.features.length]);
                }

            } else {
                dojo.byId("spanTitle").innerHTML = dojo.string.substitute(messages.getElementsByTagName("numberOfFeaturesFoundBySearch")[0].childNodes[0].nodeValue, [featureset.features.length]);
            }
        } catch (err) {
            alert(messages.getElementsByTagName("falseConfigParams")[0].childNodes[0].nodeValue);
        }
    }

    CreateScrollbar(dojo.byId("divFeatureListContainer"), dojo.byId("divFeatureList"));
    CreateScrollbar(dojo.byId("divResultDataContainer"), dojo.byId("divResultDataContent"));
}

//Show the result list of features found in the buffered area  for mobile

function ShowSearchResultsContainer() {
    dojo.byId("divInfoContainer").style.display = "none";
    dojo.byId("divResults").style.display = "block";
    dojo.replaceClass("divResultContent", "showContainer", "hideContainer");
    SetHeightSearchResults();
}

function RelationshipQuery(selectedFeature, featureID, attributes, isFeatureSearched) {
    try {
        facilityID = dojo.string.substitute(facilityId, attributes);
        if (commentLayer.Visibility) {
            FetchComments(dojo.string.substitute(facilityId, attributes), fromInfoWindow);
        }
    } catch (err) {
        alert(messages.getElementsByTagName("falseConfigParams")[0].childNodes[0].nodeValue);
    }
    CreateFeatureDetails(selectedFeature, attributes, isFeatureSearched);
    if (!commentLayer.Visibility) {
        HideProgressIndicator();
    }
}

function CreateFeatureDetails(selectedFeature, attributes, isFeatureSearched) {
    if (!fromInfoWindow) {
        RemoveChildren(dojo.byId("divInformationHolder"));
        RemoveChildren(dojo.byId("divPhotoGalleryContent"));
        var tableInfoHolder = dojo.create("table", {
            "className": "tblInformationHolder",
            "cellspacing": "0"
        }, dojo.byId("divInformationHolder"));
    } else {
        RemoveChildren(dojo.byId("divInfoPhotoGalleryContent"));
        RemoveChildren(dojo.byId("tblInfoDetails"));
        DisplayInfoWindow(selectedFeature, attributes, isFeatureSearched);
        var tableInfoHolder = dojo.byId("tblInfoDetails");
    }
    var tbodyInfoHolder = dojo.create("tbody", {}, tableInfoHolder);
    for (var i in attributes) {
        if (!attributes[i]) {
            attributes[i] = showNullValueAs;
        }
    }
    if (isMobileDevice || fromInfoWindow) {
        var trFeatureName = dojo.create("tr", {}, tbodyInfoHolder);
        var tdFeatureName = dojo.create("td", {}, trFeatureName);
        var tblFeatureName = dojo.create("table", {}, tdFeatureName);
        tblFeatureName.className = "tblInfoDetails";

        dojo.addClass(tblFeatureName, "featureNameWidth");
        var tbodyFeatureName = dojo.create("tbody", {}, tblFeatureName);
        var trFName = dojo.create("tr", {}, tbodyFeatureName);
        var tdFName = dojo.create("td", {
            "id": "tdFName"
        }, trFName);

        try {
            tdFName.setAttribute("featureName", dojo.string.substitute(featureName, attributes));
            tdFName.innerHTML = dojo.string.substitute(featureName, attributes);
        } catch (err) {
            alert(messages.getElementsByTagName("falseConfigParams")[0].childNodes[0].nodeValue);
        }
    }

    for (var i = 0; i < infoPopupFieldsCollection.length; i++) {
        var trInfoHolder = dojo.create("tr", {}, tbodyInfoHolder);

        var tdInfoHolder = dojo.create("td", {}, trInfoHolder);
        var tblData = dojo.create("table", {
            "cellspacing": "0"
        }, tdInfoHolder);
        tblData.className = "tdbreakword";
        dojo.addClass(tblData, "tbl");
        var trData = tblData.insertRow(0);
        var tdDisplayText = dojo.create("td", {}, trData);
        var fieldValue;
        dojo.addClass(tdDisplayText, "tdDisplayText");
        if (infoPopupFieldsCollection[i].DisplayText && (infoPopupFieldsCollection[i].DisplayText != "")) {
            tdDisplayText.innerHTML = infoPopupFieldsCollection[i].DisplayText + " ";
        } else {
            var tempValue = infoPopupFieldsCollection[i].FieldName.split("{");
            var fieldName = tempValue[1].split("}");
            for (var j = 0; j < map.getLayer("devPlanLayerID").fields.length; j++) {
                if (map.getLayer("devPlanLayerID").fields[j].alias == fieldName[0]) {
                    tdDisplayText.innerHTML = map.getLayer("devPlanLayerID").fields[j].alias + ": ";
                    break;
                }
            }
        }
        var tdFieldName = dojo.create("td", {}, trData);
        try {
            fieldValue = dojo.string.substitute(infoPopupFieldsCollection[i].FieldName, attributes);
        } catch (err) {
            alert(messages.getElementsByTagName("falseConfigParams")[0].childNodes[0].nodeValue);
        }
        if ((fieldValue) && (fieldValue !== "-")) {
            tdFieldName.innerHTML = fieldValue;
        }
        if ((fieldValue) && (fieldValue !== "-")) {
            if (CheckMailFormat(fieldValue)) {
                tdFieldName.innerHTML = "";
                var mail = document.createElement("u");
                mail.style.cursor = "pointer";
                mail.innerHTML = infoPopupFieldsCollection[i].FieldName;
                mail.setAttribute("email", fieldValue);
                mail.style.wordBreak = "break-all";
                mail.onclick = function () {
                    parent.location = "mailto:" + this.getAttribute("email");
                };
                tdFieldName.appendChild(mail);
            } else if (fieldValue.match("http:") || fieldValue.match("https:")) {
                tdFieldName.innerHTML = "";
                var link = document.createElement("u");
                link.className = "mailLink";
                link.innerHTML = "More info";
                link.setAttribute("link", fieldValue);
                link.onclick = function () {
                    window.open(this.getAttribute("link"));
                };
                tdFieldName.appendChild(link);
                tdFieldName.style.wordBreak = "break-all";
            }
        }
    }
    if (infoPopupFieldsCollection.length == 0) {
        map.infoWindow.hide();
        alert(messages.getElementsByTagName("blankInfoPopupFields")[0].childNodes[0].nodeValue);
    }
    if (isMobileDevice || fromInfoWindow) {
        var tablePhoto = dojo.create("table", {
            "style": "width:100%;height:100%;",
            "id": "tblPhoto"
        }, dojo.byId("divInfoPhotoGalleryContent"));
    } else {
        var tablePhoto = dojo.create("table", {
            "style": "width:100%;height:100%;",
            "id": "tblPhotoPod"
        }, dojo.byId("divPhotoGalleryContent"));
    }
    var tbodyPhoto = dojo.create("tbody", {}, tablePhoto);
    var trPhoto = dojo.create("tr", {}, tbodyPhoto);
    var tdPhoto = dojo.create("td", {
        "style": "vertical-align:top;"
    }, trPhoto);
    var divPhoto = dojo.create("div", {}, tdPhoto);
    if (!fromInfoWindow) {
        divPhoto.style.width = infoBoxWidth - 20 + "px";
        divPhoto.id = "divPhotoPod";
    } else {
        divPhoto.id = "divPhoto";
        if (isMobileDevice) {
            divPhoto.style.width = (dojo.window.getBox().w - 20) + "px";
        } else {
            divPhoto.style.width = infoWindowWidth - 20 + "px";
        }
    }

  //sbtest
    if (0 == 1) {
      var imgGallery;
      map.getLayer(devPlanLayerID).queryAttachmentInfos(attributes[map.getLayer(devPlanLayerID).objectIdField], function (attachment) {
        var tdImagePhoto = dojo.create("td", {
          "align": "right"
        }, trFName);
        imgGallery = dojo.create("img", {
          "class": "imgOptions",
          "src": "images/gallery.png"
        }, tdImagePhoto);
        imgGallery.id = "mblInfoGallery";
        imgGallery.title = "Gallery";
        imgGallery.style.display = "block";

        if (fromInfoWindow) {
          imgGallery.onclick = function () {
            ShowPhotoGalleryView();
          };
        }

        if (attachment.length > 0) {
          var trAttachemnt = dojo.create("tr", {}, tbodyInfoHolder);
          var tdAttachment = dojo.create("td", {}, trAttachemnt);
          var tblAttachment = dojo.create("table", {
            "cellspacing": "0"
          }, tdAttachment);
          tblAttachment.style.width = "95%";
          var tbodyAttachment = dojo.create("tbody", {}, tblAttachment);
          var trAttachmentText = dojo.create("tr", {}, tbodyAttachment);

          imgFiles = [];
          var counterPdf = 0;
          var counterImg = 0;

          attachment.sort(function (a, b) {
            return a.id - b.id;
          });

          for (var k = 0; k < attachment.length; k++) {

            if (attachment[k].contentType.indexOf("pdf") >= 0) {
              var tdAttachmentText = dojo.create("td", {}, trAttachmentText);
              tdAttachmentText.innerHTML = "Attachment : ";
              dojo.addClass(tdAttachmentText, "tdDisplayText");
              var tdAttachmentFile = dojo.create("td", {}, trAttachmentText);
              dojo.addClass(tdAttachmentText, "tdAttachmentText");
              tdAttachmentFile.innerHTML = "View";
              tdAttachmentFile.setAttribute("url", attachment[k].url);
              tdAttachmentFile.setAttribute("url", attachment[k].url);
              tdAttachmentFile.onclick = function () {
                window.open(this.getAttribute("url"));
              };
              counterPdf++;
            } else {

              if (fromInfoWindow || isMobileDevice) {
                imgFiles.push(attachment[k].url);
              } else {
                imgArray.push(attachment[k].url);
              }

              if (!fromInfoWindow) {
                ResetSlideControls();
              }
              AddImage(k, counterPdf, attachment[k].url, divPhoto, attachment.length);
            }

          }
        } else if (!fromInfoWindow) {
          dojo.byId("divPhotoPod").innerHTML = messages.getElementsByTagName("noPhotosAvailable")[0].childNodes[0].nodeValue;
        } else {
          divPhoto.innerHTML = messages.getElementsByTagName("noPhotosAvailable")[0].childNodes[0].nodeValue;
        }
        var trActivity = dojo.create("tr", {}, tbodyInfoHolder);
        var tdActivity = dojo.create("td", {
          "colspan": "2"
        }, trActivity);
        var tblActivity = dojo.create("table", {}, tdActivity);
        var tbodyActivity = dojo.create("tbody", {}, tblActivity);
        var trImg = dojo.create("tr", {}, tbodyActivity);

        var tdImg = dojo.create("td", {}, trImg);
        var divActivity = dojo.create("div", {
          "id": "divActivity"
        }, tdImg);

        if (!fromInfoWindow) {
          divActivity.style.width = infoBoxWidth - 20 + "px";
        } else {
          if (isMobileDevice) {
            divActivity.style.width = (dojo.window.getBox().w - 50) + "px";
          } else {
            divActivity.style.width = infoWindowWidth - 20 + "px";
          }
        }
        try {
          for (var j = 0; j < infoActivity.length; j++) {

            if (dojo.string.substitute(infoActivity[j].FieldName, attributes) === "Yes") {

              var imgActivity = dojo.create("img", {
                "src": infoActivity[j].Image,
                "style": "padding:2px;",
                "class": "imgOptions",
                "title": infoActivity[j].Alias
              }, divActivity);
              dojo.addClass(imgActivity, "imgActivity");

            }
          }
        } catch (err) {
          alert(messages.getElementsByTagName("falseConfigParams")[0].childNodes[0].nodeValue);
        }
        CreateScrollbar(dojo.byId("divInformationContainer"), dojo.byId("divInformationHolder"));
        CreateScrollbar(dojo.byId("divPhotoGalleryContentHolder"), dojo.byId("divPhotoGalleryContent"));
        SetHeightGalleryDetails();
        SetHeightViewDetails();
      }, function (err) {
        HideProgressIndicator();
        alert(err.message);
      });
    }
}

//Add attachments coming from the layers

function AddImage(index, pdfCount, imageURL, divPhoto, totalImages) {
    var imgGallery = dojo.create("img", {
        "src": loadingAttachmentsImg
    }, divPhoto);
    dojo.addClass(imgGallery, "imgGallery");
    var dummyImage = dojo.create("img", {
        "src": imageURL
    }, null);
    dummyImage.onload = function () {
        imgGallery.src = imageURL;
        dojo.addClass(imgGallery, "imgGallery");
    };
    if (fromInfoWindow) {
        imgGallery.id = "infoImgAttach" + index;
    }
    imgGallery.setAttribute("index", (index - pdfCount));
    imgGallery.setAttribute("totalImages", totalImages);
    imgGallery.onclick = function (evt) {
        if (imgGallery.src === imageURL) {
            if (!this.id) {
                fromInfoWindow = false;
            } else {
                fromInfoWindow = true;
            }
            ShowImages(this);
        }
    };
}

//Calculate distance between two mapPoints

function GetDistance(startPoint, endPoint) {
    var sPoint = esri.geometry.webMercatorToGeographic(startPoint);
    var ePoint = esri.geometry.webMercatorToGeographic(endPoint);
    var lon1 = sPoint.x;
    var lat1 = sPoint.y;
    var lon2 = ePoint.x;
    var lat2 = ePoint.y;
    var theta = lon1 - lon2;
    var dist = Math.sin(Deg2Rad(lat1)) * Math.sin(Deg2Rad(lat2)) + Math.cos(Deg2Rad(lat1)) * Math.cos(Deg2Rad(lat2)) * Math.cos(Deg2Rad(theta));
    dist = Math.acos(dist);
    dist = Rad2Deg(dist);
    dist = dist * 60 * 1.1515;
    return (dist * 10) / 10;
}

//Convert the degrees to radians

function Deg2Rad(deg) {
    return (deg * Math.PI) / 180.0;
}

//Convert the radians to degrees

function Rad2Deg(rad) {
    return (rad / Math.PI) * 180.0;
}

//Clear the buffer graphics

function ClearBuffer() {
    var layer = map.getLayer(tempBufferLayer);
    if (layer) {
        var count = layer.graphics.length;
        for (var i = 0; i < count; i++) {
            var graphic = layer.graphics[i];
            if (graphic.geometry.type === "polygon") {
                layer.remove(graphic);
            }
        }
    }
}

//Get the extent based on the map-point

function GetExtent(point) {
    var xmin = point.x;
    var ymin = (point.y) - 30;
    var xmax = point.x;
    var ymax = point.y;
    return new esri.geometry.Extent(xmin, ymin, xmax, ymax, map.spatialReference);
}

//Locate feature by name

function LocateFeaturebyName() {
    searchFlag = true;
    addressFlag = false;

    if (isBrowser && !getDirectionsDesktop) {
        dojo.byId("tdDirectionsPod").style.display = "block";
    } else if (isTablet && !getDirectionsMobile) {
        dojo.byId("tdDirectionsPod").style.display = "block";
    }


    var thisSearchTime = lastSearchTime = (new Date()).getTime();
    activityQueryString = "";
    mapPoint = null;
    RemoveChildren(dojo.byId("tblAddressResults"));
    RemoveScrollBar(dojo.byId("divAddressScrollContainer"));
    if (dojo.byId("txtAddress").value.trim() === "") {
        dojo.byId("imgSearchLoader").style.display = "none";
        dojo.byId("txtAddress").focus();
        return;
    }
    var qTask = new esri.tasks.QueryTask(devPlanLayerURL);
    var query = new esri.tasks.Query();
    query.where = "UPPER" + "(" + nameAttribute + ")" + " LIKE '%" + dojo.byId("txtAddress").value.trim().toUpperCase() + "%'";
    query.outFields = ["*"];
    query.returnGeometry = true;
    query.outSpatialReference = map.spatialReference;
    dojo.byId("imgSearchLoader").style.display = "block";
    qTask.execute(query, function (featureset) {
        if (thisSearchTime < lastSearchTime) {
            return;
        }
        if (resultFound) {
            dojo.byId("imgSearchLoader").style.display = "none";
            return;
        }
        RemoveChildren(dojo.byId("tblAddressResults"));
        RemoveScrollBar(dojo.byId("divAddressScrollContainer"));
        if (dojo.byId("txtAddress").value.trim() === "") {
            dojo.byId("txtAddress").focus();
            RemoveChildren(dojo.byId("tblAddressResults"));
            RemoveScrollBar(dojo.byId("divAddressScrollContainer"));
            return;
        }
        dojo.byId("imgSearchLoader").style.display = "none";
        if (featureset.features.length > 0) {
            if (featureset.features.length === 1) {
                resultFound = true;
                dojo.byId("txtAddress").blur();
                RemoveChildren(dojo.byId("divFeatureList"));
                map.getLayer(routeLayerId).clear();
                for (var i = 0; i < handlersPod.length; i++) {
                    dojo.disconnect(handlersPod[i]);
                }
                handlersPod = [];

                map.infoWindow.hide();
                selectedGraphic = null;
                selectedFeature = null;
                try {
                    dojo.byId("txtAddress").value = dojo.string.substitute(featureName, featureset.features[0].attributes);
                    dojo.byId("txtAddress").setAttribute("defaultFeatureName", dojo.string.substitute(featureName, featureset.features[0].attributes));
                } catch (err) {
                    alert(messages.getElementsByTagName("falseConfigParams")[0].childNodes[0].nodeValue);
                }
                dojo.byId("txtAddress").setAttribute("defaultFeatureTitle", "");
                dojo.addClass(dojo.byId("txtAddress"), "colorChange");
                searchedFeature = dojo.byId("txtAddress").value;

                selectedFeature = featureset.features[0].geometry;
                LocateFeatureOnMap();
            } else {
                var tableAddressResults = dojo.byId("tblAddressResults");
                var tBodyAddressResults = document.createElement("tbody");
                tableAddressResults.appendChild(tBodyAddressResults);
                tableAddressResults.cellSpacing = 0;
                tableAddressResults.cellPadding = 0;
                var featureSet = [];
                try {
                    for (var i = 0; i < featureset.features.length; i++) {
                        featureSet.push({
                            name: dojo.string.substitute(featureName, featureset.features[i].attributes),
                            geometry: featureset.features[i].geometry,
                            attributes: featureset.features[i].attributes
                        });
                    }
                } catch (err) {
                    alert(messages.getElementsByTagName("falseConfigParams")[0].childNodes[0].nodeValue);
                }
                featureSet.sort(function (a, b) {
                    var nameA = a.name.toLowerCase(),
                        nameB = b.name.toLowerCase();
                    if (nameA < nameB) //sort string ascending
                    {
                        return -1
                    } else {
                        return 1
                    }
                });

                for (var i = 0; i < featureSet.length; i++) {
                    var feature = featureSet[i];
                    var trAddressResults = document.createElement("tr");
                    tBodyAddressResults.appendChild(trAddressResults);
                    var tdData = document.createElement("td");
                    try {
                        tdData.innerHTML = dojo.string.substitute(featureName, feature.attributes);

                        tdData.align = "left";
                        tdData.className = "bottomborder";
                        dojo.addClass(tdData, "cursorPointer");
                        tdData.height = 20;
                        tdData.setAttribute("x", feature.geometry.x);
                        tdData.setAttribute("y", feature.geometry.y);
                        tdData.setAttribute("name", dojo.string.substitute(featureName, feature.attributes));
                    } catch (err) {
                        alert(messages.getElementsByTagName("falseConfigParams")[0].childNodes[0].nodeValue);
                    }
                    tdData.onclick = function () {
                        map.getLayer(routeLayerId).clear();
                        RemoveChildren(dojo.byId("divFeatureList"));
                        for (var i = 0; i < handlersPod.length; i++) {
                            dojo.disconnect(handlersPod[i]);
                        }
                        handlersPod = [];

                        map.infoWindow.hide();
                        selectedGraphic = null;
                        selectedFeature = null;

                        dojo.byId("txtAddress").value = this.innerHTML;
                        dojo.byId("txtAddress").setAttribute("defaultFeatureName", this.innerHTML);
                        dojo.byId("txtAddress").setAttribute("defaultFeatureTitle", "");
                        dojo.addClass(dojo.byId("txtAddress"), "colorChange");
                        searchedFeature = dojo.byId("txtAddress").value;

                        selectedFeature = new esri.geometry.Point(Number(this.getAttribute("x")), Number(this.getAttribute("y")), map.spatialReference);
                        LocateFeatureOnMap();
                    };
                    trAddressResults.appendChild(tdData);
                }
                SetHeightAddressResults();
            }

        } else {
            isFeatureSearched = true;
            ErrorHandlerForFeatures();
        }
    }, function (err) {
        isFeatureSearched = true;
        ErrorHandlerForFeatures();
    });
}

function ErrorHandlerForFeatures() {
    selectedFeature = null;
    dojo.byId("imgSearchLoader").style.display = "none";

    if (dojo.byId("tdSearchFeature").className === "tdSearchByFeature") {
        var tableAddressResults = dojo.byId("tblAddressResults");
    }
    var tBodyAddressResults = document.createElement("tbody");
    tableAddressResults.appendChild(tBodyAddressResults);
    tableAddressResults.cellSpacing = 0;
    tableAddressResults.cellPadding = 0;
    var trAddressResults = document.createElement("tr");
    tBodyAddressResults.appendChild(trAddressResults);
    var tdInvalidSearch = document.createElement("td");
    if (!isFeatureSearched) {
        tdInvalidSearch.innerHTML = messages.getElementsByTagName("invalidSearch")[0].childNodes[0].nodeValue;
    } else {
        tdInvalidSearch.innerHTML = messages.getElementsByTagName("noFeatures")[0].childNodes[0].nodeValue;
    }
    tdInvalidSearch.align = "left";
    tdInvalidSearch.className = "bottomborder";
    tdInvalidSearch.style.cursor = "default";
    tdInvalidSearch.height = 20;
    trAddressResults.appendChild(tdInvalidSearch);
}

function LocateFeatureOnMap() {
    map.infoWindow.hide();
    map.getLayer(tempGraphicsLayerId).clear();
    map.getLayer(tempBufferLayer).clear();
    isFeatureSearched = true;
    map.getLayer(highlightLayerId).clear();

    var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, locatorRippleSize, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.colorFromRgb(GetStylesSheet(".RippleColor")), 4), new dojo.Color([0, 0, 0, 0]));
    AddGraphic(map.getLayer(highlightLayerId), symbol, selectedFeature);
    if (getDirections) {
        if (!isBrowser) {
            if (getDirectionsMobile) {
                ShowMyLocation();
            } else {
                if (dojo.coords("divLayerContainer").h > 0) {
                    dojo.replaceClass("divLayerContainer", "hideContainerHeight", "showContainerHeight");
                    dojo.replaceClass(dojo.byId("divLayerContainer"), "zeroHeight", "addressHolderHeight");
                }
                if (!isMobileDevice) {
                    if (dojo.coords("divAddressHolder").h > 0) {
                        dojo.replaceClass("divAddressHolder", "hideContainerHeight", "showContainerHeight");
                        dojo.replaceClass(dojo.byId("divAddressHolder"), "zeroHeight", "addressHolderHeight");
                    }
                }

                if (isFeatureSearched) {
                    QueryLayer(null, null, true);
                    if (isMobileDevice) {
                        map.centerAndZoom(selectedFeature, zoomLevel);
                        setTimeout(function () {
                            map.infoWindow.hide();
                            var xcenter = (map.extent.xmin + map.extent.xmax) / 2;
                            var ycenter = (map.extent.ymin + map.extent.ymax) / 2;
                            selectedFeature = new esri.geometry.Point(xcenter, ycenter, map.spatialReference);
                            map.setExtent(GetInfoWindowMobileMapExtent(selectedFeature));
                        }, 1000);
                    }
                    else {
                        map.centerAndZoom(selectedFeature, zoomLevel);
                    }
                    isFeatureSearched = false;
                }
            }

        } else {
            if (getDirectionsDesktop) {
                ShowMyLocation();
            } else {

                if (dojo.coords("divLayerContainer").h > 0) {
                    dojo.replaceClass("divLayerContainer", "hideContainerHeight", "showContainerHeight");
                    dojo.replaceClass(dojo.byId("divLayerContainer"), "zeroHeight", "addressHolderHeight");
                }
                if (!isMobileDevice) {
                    if (dojo.coords("divAddressHolder").h > 0) {
                        dojo.replaceClass("divAddressHolder", "hideContainerHeight", "showContainerHeight");
                        dojo.replaceClass(dojo.byId("divAddressHolder"), "zeroHeight", "addressHolderHeight");
                    }
                }

                if (isFeatureSearched) {
                    QueryLayer(null, null, true);
                    if (!isMobileDevice) {
                        map.centerAndZoom(selectedFeature, zoomLevel);
                    }
                    isFeatureSearched = false;
                }
            }
        }
    } else {
        if (!isMobileDevice) {
            if (selectedFeature) {
                map.centerAndZoom(selectedFeature, zoomLevel);
            }
            if (dojo.coords("divAddressHolder").h > 0) {
                dojo.replaceClass("divAddressHolder", "hideContainerHeight", "showContainerHeight");
                dojo.addClass(dojo.byId("divAddressHolder"), "zeroHeight");
            }
        }
        if (isFeatureSearched) {
            QueryLayer(null, null, true);
        }
    }
    if (isMobileDevice) {
        HideAddressContainer();
    }
}

//Display the view to search by feature name

function ShowFeatureSearchView() {
    if (dojo.byId("imgSearchLoader").style.display === "block") {
        return;
    }
    dojo.addClass(dojo.byId("txtAddress"), "onBlurColorChange");
    dojo.byId("txtAddress").value = dojo.byId("txtAddress").getAttribute("defaultFeatureName");
    lastSearchString = dojo.byId("txtAddress").value.trim();
    RemoveChildren(dojo.byId("tblAddressResults"));
    RemoveScrollBar(dojo.byId("divAddressScrollContainer"));
    dojo.byId("tdSearchAddress").className = "tdSearchByUnSelectedAddress";
    dojo.byId("tdSearchFeature").className = "tdSearchByFeature";
    dojo.byId("tdSearchActivity").className = "tdSearchByUnSelectedActivity";
    dojo.byId("tdActivitySearch").style.display = "none";
    dojo.byId("tdAddressSearch").style.display = "block";
}

//Display the view to search by address

function ShowAddressSearchView() {
    if (dojo.byId("imgSearchLoader").style.display === "block") {
        return;
    }
    dojo.addClass(dojo.byId("txtAddress"), "onBlurColorChange");
    dojo.byId("txtAddress").value = dojo.byId("txtAddress").getAttribute("defaultAddress");
    lastSearchString = dojo.byId("txtAddress").value.trim();
    RemoveChildren(dojo.byId("tblAddressResults"));
    RemoveScrollBar(dojo.byId("divAddressScrollContainer"));
    dojo.byId("tdSearchAddress").className = "tdSearchByAddress";
    dojo.byId("tdSearchFeature").className = "tdSearchByUnSelectedFeature";
    dojo.byId("tdSearchActivity").className = "tdSearchByUnSelectedActivity";
    dojo.byId("tdActivitySearch").style.display = "none";
    dojo.byId("tdAddressSearch").style.display = "block";
}

//Display the view to search by Activity

function ShowActivitySearchView() {
    if (dojo.byId("imgSearchLoader").style.display === "block") {
        return;
    }
    dojo.addClass(dojo.byId("txtAddress"), "onBlurColorChange");
    if (dojo.byId("tableActivityList").rows.length === 0) {
        var activityArray = [];
        for (var i in infoActivity) {
            var temp = infoActivity[i];

            var activityName;
            infoActivity[i].FieldName.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g, function (match, key) {
                activityName = key;
            });

            temp.AttributeName = activityName;
            activityArray.push(infoActivity[i]);
        }
        for (var i = 0; i < (activityArray.length / 2); i++) {
            var trActivityList = dojo.byId("tableActivityList").insertRow(i);
            var tdActivityOdd = trActivityList.insertCell(0);
            dojo.addClass(tdActivityOdd, "tdDisplayText");
            CreateActivityCell(tdActivityOdd, activityArray[i * 2], i * 2);

            var tdActivityEven = trActivityList.insertCell(1);
            dojo.addClass(tdActivityEven, "tdDisplayText");
            CreateActivityCell(tdActivityEven, activityArray[(i * 2) + 1], (i * 2) + 1);
        }
    } else {
        for (var i in infoActivity) {
            if (infoActivity[i].isSelected) {
                dojo.replaceClass(dojo.byId("imgActivity" + infoActivity[i].AttributeName), "selectedActivity", "imgOptions");
            } else {
                dojo.replaceClass(dojo.byId("imgActivity" + infoActivity[i].AttributeName), "imgOptions", "selectedActivity");
            }
        }
    }
    dojo.byId("tdSearchAddress").className = "tdSearchByUnSelectedAddress";
    dojo.byId("tdSearchFeature").className = "tdSearchByUnSelectedFeature";
    dojo.byId("tdSearchActivity").className = "tdSearchByActivity";
    dojo.byId("tdAddressSearch").style.display = "none";
    dojo.byId("tdActivitySearch").style.display = "block";
    SetHeightActivityView();
}

//display the available activities in the activity search container

function CreateActivityCell(tdParent, activity, index) {
    if (activity) {
        var tableActivity = dojo.create("table", {}, tdParent);
        dojo.addClass(tableActivity, "CreateActivityTable");
        var tbodyActivity = dojo.create("tbody", {}, tableActivity);
        var trActivity = dojo.create("tr", {}, tbodyActivity);
        var tdActivity = dojo.create("td", {}, trActivity);
        tdActivity.align = "left";
        if (isBrowser) {
            dojo.addClass(tdActivity, "activitySearchBrowser");
        } else {
            dojo.addClass(tdActivity, "activitySearchMobile");
        }
        var tdText = dojo.create("td", {
            "style": "cursor:pointer;"
        }, trActivity);
        tdText.style.cursor = "pointer";
        tdText.align = "left";
        var img = dojo.create("img", {
            "src": activity.Image,
            "className": "imgActivitySearch",
            "className": "imgOptions"
        }, tdActivity);
        dojo.addClass(img, "imgActivitySearch");
        img.id = "imgActivity" + activity.AttributeName;
        img.setAttribute("index", index);
        img.setAttribute("activity", activity.AttributeName);
        if (activity.isSelected) {
            img.className = "selectedActivity";
        }
        tdText.innerHTML = activity.Alias;

        trActivity.onclick = function () {
            if (dojo.hasClass(img, "selectedActivity")) {
                dojo.replaceClass(img, "imgOptions", "selectedActivity");
            } else {
                dojo.replaceClass(img, "selectedActivity", "imgOptions");
            }
        };
    }
}

//Get feature results for searched activities

function LocateFeaturebyActivity() {
    searchFlag = true;
    addressFlag = false;
    mapPoint = null;

    if (isBrowser && !getDirectionsDesktop) {
        dojo.byId("tdDirectionsPod").style.display = "block";
    } else if (isTablet && !getDirectionsMobile) {
        dojo.byId("tdDirectionsPod").style.display = "block";
    }

    activityQueryString = "";
    dojo.query(".selectedActivity", dojo.byId("tableActivityList")).forEach(function (node) {
        var activity = node.getAttribute("activity");
        activityQueryString += activity + " = 'Yes' AND ";
    });

    if (activityQueryString === "") {
        alert(messages.getElementsByTagName("selectActivities")[0].childNodes[0].nodeValue);
        return;
    }
    activityQueryString += "1=1";
    var queryTask = new esri.tasks.QueryTask(devPlanLayerURL);
    var query = new esri.tasks.Query();
    query.where = activityQueryString;
    query.outFields = [nameAttribute];
    query.returnGeometry = true;
    ShowProgressIndicator();
    queryTask.execute(query, function (relatedRecords) {
        var objectIds = relatedRecords.features;
        if (objectIds.length > 0) {
            HideProgressIndicator();
            if (objectIds.length === 1) {
                map.getLayer(routeLayerId).clear();
                dojo.query(".selectedActivity", dojo.byId("tableActivityList")).forEach(function (node) {
                    var activity = node.getAttribute("index");
                    infoActivity[activity].isSelected = true;
                });

                dojo.query(".imgOptions", dojo.byId("tableActivityList")).forEach(function (node) {
                    var activity = node.getAttribute("index");
                    infoActivity[activity].isSelected = false;
                });
                map.infoWindow.hide();
                selectedGraphic = null;
                selectedFeature = null;
                isFeatureSearched = true;
                selectedFeature = relatedRecords.features[0].geometry;
                try {
                    searchedFeature = dojo.string.substitute(featureName, relatedRecords.features[0].attributes);
                } catch (err) {
                    alert(messages.getElementsByTagName("falseConfigParams")[0].childNodes[0].nodeValue);
                }
                LocateFeatureOnMap();
                ShowActivitySearchView();
            } else {
                var featureSet = [];
                try {
                    for (var i = 0; i < objectIds.length; i++) {
                        featureSet.push({
                            name: dojo.string.substitute(featureName, relatedRecords.features[i].attributes),
                            geometry: relatedRecords.features[i].geometry,
                            attributes: relatedRecords.features[i].attributes
                        });

                    }
                } catch (err) {
                    alert(messages.getElementsByTagName("falseConfigParams")[0].childNodes[0].nodeValue);
                }
                map.getLayer(routeLayerId).clear();
                dojo.query(".selectedActivity", dojo.byId("tableActivityList")).forEach(function (node) {
                    var activity = node.getAttribute("index");
                    infoActivity[activity].isSelected = true;
                });

                dojo.query(".imgOptions", dojo.byId("tableActivityList")).forEach(function (node) {
                    var activity = node.getAttribute("index");
                    infoActivity[activity].isSelected = false;
                });
                map.infoWindow.hide();
                selectedGraphic = null;
                selectedFeature = null;
                isFeatureSearched = true;
                selectedFeature = featureSet[0].geometry;
                try {
                    searchedFeature = dojo.string.substitute(featureName, featureSet[0].attributes);
                } catch (err) {
                    alert(messages.getElementsByTagName("falseConfigParams")[0].childNodes[0].nodeValue);
                }
                LocateFeatureOnMap();
                ShowActivitySearchView();
            }
        } else {
            HideProgressIndicator();
            isFeatureSearched = false;
            selectedFeature = null;
            dojo.byId("imgSearchLoader").style.display = "none";
            alert(messages.getElementsByTagName("invalidSearch")[0].childNodes[0].nodeValue);
        }
    });
}
