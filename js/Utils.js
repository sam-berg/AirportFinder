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
var orientationChange = false; //flag set on orientation event
var tinyResponse; //variable to store the response getting from tiny URL API
var tinyUrl; //variable to store the tiny URL
var newInfoLeftOffice = 0; //variable to store position of attachments in info pop up
var newGalleryLeft = 0; //variable to store new left position of the photo gallery
var selectedFeatureID; // variable to store the selected feature ID
var index = 0; // variable to store index of the image
var imgFiles = []; // variable to store image files
var fromInfoWindow = false; //flag set to true if the attachments are from info window
var lastPodSearchString;
var currentLocation = false;
//Refresh address container div

function RemoveChildren(parentNode) {
    if (parentNode) {
        while (parentNode.hasChildNodes()) {
            parentNode.removeChild(parentNode.lastChild);
        }
    }
}

//Remove scroll bar

function RemoveScrollBar(container) {
    if (dojo.byId(container.id + "scrollbar_track")) {
        container.removeChild(dojo.byId(container.id + "scrollbar_track"));
    }
}

//Get the extent based on the map-point

function GetInfoWindowBrowserMapExtent(mapPoint) {
    var width = map.extent.getWidth();
    var height = map.extent.getHeight();
    var xmin = mapPoint.x - (width / 2);
    var ymin = mapPoint.y - (height / 2.5);
    var xmax = xmin + width;
    var ymax = ymin + height;
    return new esri.geometry.Extent(xmin, ymin, xmax, ymax, map.spatialReference);
}

//Get the extent based on the map point

function GetBrowserMapExtent(mapPoint) {
    var circle = new esri.geometry.Polygon(map.spatialReference);
    var ring = []; // point that make up the circle
    var radius = 200;
    var pts = 4; // number of points on the circle
    var angle = 360 / pts; // used to compute points on the circle
    for (var i = 1; i <= pts; i++) {
        // convert angle to radians
        var radians = i * angle * Math.PI / 180;
        ring.push([Number(mapPoint.x) + radius * Math.cos(radians), Number(mapPoint.y) + radius * Math.sin(radians)]);
    }
    ring.push(ring[0]); // start point needs to == end point
    circle.addRing(ring);

    var extent = circle.getExtent();

    var width = Number(extent.getWidth());
    var height = Number(extent.getHeight());
    var xmin = mapPoint.x - (width / 2);
    var ymin = mapPoint.y - (height / 2.5);
    var xmax = xmin + width;
    var ymax = ymin + height;
    return new esri.geometry.Extent(xmin, ymin, xmax, ymax, map.spatialReference);
}

//Get the extent based on the map-point

function GetInfoWindowMobileMapExtent(mapPoint) {
    var width = map.extent.getWidth();
    var height = map.extent.getHeight();
    var xmin = mapPoint.x - (width / 2);
    var ymin = mapPoint.y - (height / 4);
    var xmax = xmin + width;
    var ymax = ymin + height;
    return new esri.geometry.Extent(xmin, ymin, xmax, ymax, map.spatialReference);
}

//Get the extent based on the map-point

function GetMobileMapExtent(mapPoint) {
    var circle = new esri.geometry.Polygon(map.spatialReference);
    var ring = []; // point that make up the circle
    var radius = 200;
    var pts = 4; // number of points on the circle
    var angle = 360 / pts; // used to compute points on the circle
    for (var i = 1; i <= pts; i++) {
        // convert angle to radians
        var radians = i * angle * Math.PI / 180;
        ring.push([mapPoint.x + radius * Math.cos(radians), mapPoint.y + radius * Math.sin(radians)]);
    }
    ring.push(ring[0]); // start point needs to == end point
    circle.addRing(ring);

    var extent = circle.getExtent();

    var width = Number(extent.getWidth());
    var height = 400;
    var xmin = mapPoint.x - (width / 2);
    var ymin = mapPoint.y - (height / 4);
    var xmax = xmin + width;
    var ymax = ymin + height;
    return new esri.geometry.Extent(xmin, ymin, xmax, ymax, map.spatialReference);
}
//Trim string
String.prototype.trim = function () {
    return this.replace(/^\s*/, "").replace(/\s*$/, "");
};

//Append ... for a string
String.prototype.trimString = function (len) {
    return (this.length > len) ? this.substring(0, len) + "..." : this;
};

//Convert string to bool
String.prototype.bool = function () {
    return (/^true$/i).test(this);
};

//Restrict the maximum no of characters in the text area control

function imposeMaxLength(Object, MaxLen) {
    return (Object.value.length <= MaxLen);
}

//Show error message span

function ShowSpanErrorMessage(controlId, message) {
    dojo.byId(controlId).style.display = "block";
    dojo.byId(controlId).innerHTML = message;
}

//Displaying the current location of the user

function ShowMyLocation() {

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

    if (!Modernizr.geolocation) {
        if (isFeatureSearched) {
            QueryLayer(null, null, true);
            if (!isMobileDevice) {
                map.setExtent(GetBrowserMapExtent(selectedFeature));
            }
        }
    } else {
        var cBackupTimeout = 16000;
        backupTimeoutTimer = setTimeout(function () {
            alert(messages.getElementsByTagName("geolocationTimeout")[0].childNodes[0].nodeValue);
            if (isFeatureSearched) {
                QueryLayer(null, null, true);
                setTimeout(function () {
                    if (!isMobileDevice) {
                        map.centerAndZoom(selectedFeature, zoomLevel);
                    }
                }, 500);
            }
        }, cBackupTimeout);


        navigator.geolocation.getCurrentPosition(
            function (position) {
                // Only use the position if the browser has given us one that at least has the potential
                // of being correct
                if (Math.round(position.coords.longitude) !== 0 || Math.round(position.coords.latitude) !== 0) {
                    map.getLayer(tempGraphicsLayerId).clear();
                    clearTimeout(backupTimeoutTimer);
                    ShowProgressIndicator();
                    mapPoint = new esri.geometry.Point(position.coords.longitude, position.coords.latitude, new esri.SpatialReference({
                        wkid: 4326
                    }));
                    var graphicCollection = new esri.geometry.Multipoint(new esri.SpatialReference({
                        wkid: 4326
                    }));
                    graphicCollection.addPoint(mapPoint);
                    geometryService.project([graphicCollection], map.spatialReference, function (newPointCollection) {
                        mapPoint = newPointCollection[0].getPoint(0);
                        if (isFeatureSearched) {
                            imgArray = [];
                            var symbol = new esri.symbol.PictureMarkerSymbol(locatorSettings.DefaultLocatorSymbol, locatorSettings.MarkupSymbolSize.width, locatorSettings.MarkupSymbolSize.height);
                            var attr = {
                                Address: textForGeoLocation
                            };
                            var graphic = new esri.Graphic(mapPoint, symbol, attr, null);
                            map.getLayer(tempGraphicsLayerId).add(graphic);
                            QueryLayer(null, mapPoint, true);
                            isFeatureSearched = false;
                        } else {
                            currentLocation = true;
                            LocateAddressOnMap(null, null, textForGeoLocation);
                        }
                    });
                } else {
                    reportGeolocationError();
                }
            },

            function (error) {
                reportGeolocationError(error);
            }, {
                timeout: 10000
            });
    }
}

function reportGeolocationError(error) {
    clearTimeout(backupTimeoutTimer);
    HideProgressIndicator();
    if (error) {
        switch (error.code) {
            case error.TIMEOUT:
                alert(messages.getElementsByTagName("geolocationTimeout")[0].childNodes[0].nodeValue);
                break;
            case error.POSITION_UNAVAILABLE:
                alert(messages.getElementsByTagName("geolocationPositionUnavailable")[0].childNodes[0].nodeValue);
                break;
            case error.PERMISSION_DENIED:
                alert(messages.getElementsByTagName("geolocationPermissionDenied")[0].childNodes[0].nodeValue);
                break;
            case error.UNKNOWN_ERROR:
                alert(messages.getElementsByTagName("geolocationUnKnownError")[0].childNodes[0].nodeValue);
                break;
        }
    } else {
        alert(messages.getElementsByTagName("geolocationPositionUnavailable")[0].childNodes[0].nodeValue);
    }
    if (isFeatureSearched) {
        imgArray = [];
        QueryLayer(null, null, true);
        setTimeout(function () {
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
        }, 500);
    }
}


//Handle orientation change event

function OrientationChanged() {
    orientationChange = true;



    if (map) {
        var timeout = (isMobileDevice && isiOS) ? 100 : 500;
        map.infoWindow.hide();
        setTimeout(function () {

            if (isMobileDevice) {

                map.reposition();
                map.resize();
                SetHeightAddressResults();
                SetHeightSplashScreen();
                SetHeightComments();
                SetHeightGalleryDetails();
                SetHeightImage();
                SetHeightViewDirections();
                SetHeightSearchResults();
                SetHeightActivityView();
                SetHeightCmtControls();
                if (dojo.byId("divActivity")) {
                    dojo.byId("divActivity").style.width = (dojo.window.getBox().w - 50) + "px";
                }
                if (dojo.byId("divPhoto")) {
                    dojo.byId("divPhoto").style.width = (dojo.window.getBox().w - 20) + "px";
                }
                setTimeout(function () {
                    SetHeightViewDetails();
                }, 1500);
                setTimeout(function () {
                    if (selectedFeature && (!mapPoint)) {
                        map.setExtent(GetInfoWindowMobileMapExtent(selectedFeature));
                    } else if (mapPoint) {
                        map.setExtent(GetInfoWindowMobileMapExtent(mapPoint));
                    }
                    orientationChange = false;
                    return;
                }, 1000);
            } else {
                setTimeout(function () {

                    if (selectedFeature && (!mapPoint)) {
                        map.setExtent(GetInfoWindowBrowserMapExtent(selectedFeature));
                    } else {
                        if (map.getLayer(tempBufferLayer).graphics.length > 0) {
                            map.setExtent(map.getLayer(tempBufferLayer).graphics[0].geometry.getExtent().expand(1.6));
                        }
                    }
                    orientationChange = false;
                }, 500);
                if ((dojo.coords("divAddressHolder").h > 0) && isAndroid && isTablet && window.matchMedia("(orientation: landscape)").matches) {
                    if (dojo.hasClass(dojo.byId("txtAddress"), "colorChange")) {
                        WipeOutResults();
                    }
                }
            }
        }, timeout);
    }
}

//Hide splash screen container

function HideSplashScreenMessage() {
    if (dojo.isIE < 9) {
        dojo.byId("divSplashScreenContent").style.display = "none";
    }
    dojo.addClass("divSplashScreenContainer", "opacityHideAnimation");
    dojo.replaceClass("divSplashScreenContent", "hideContainer", "showContainer");
}

//Set height for splash screen

function SetHeightSplashScreen() {
    var height = (isMobileDevice) ? (dojo.window.getBox().h - 110) : (dojo.coords(dojo.byId("divSplashScreenContent")).h - 80);
    dojo.byId("divSplashContent").style.height = (height + 10) + "px";
    CreateScrollbar(dojo.byId("divSplashContainer"), dojo.byId("divSplashContent"));
}

//Handle resize event

function resizeHandler() {
    if (map) {
        map.reposition();
        map.resize();
    }
}

//Reset map position

function SetMapTipPosition() {
    if (!orientationChange) {
        if (selectedGraphic) {
            var screenPoint = map.toScreen(selectedGraphic);
            if (isMobileDevice) {
                screenPoint.y = dojo.window.getBox().h - screenPoint.y;
            } else {
                screenPoint.y = map.height - screenPoint.y;
            }
            map.infoWindow.setLocation(screenPoint);
            return;
        }
    }
}

//Display address container

function ShowLocateContainer() {
    dojo.byId("txtAddress").blur();

    if (dojo.coords("divAppContainer").h > 0) {
        dojo.replaceClass("divAppContainer", "hideContainerHeight", "showContainerHeight");
        dojo.replaceClass(dojo.byId("divAppContainer"), "zeroHeight", "fullHeight");

    }
    if (dojo.coords("divLayerContainer").h > 0) {
        dojo.replaceClass(dojo.byId("divLayerContainer"), "zeroHeight", "addressHolderHeight");
        dojo.replaceClass("divLayerContainer", "hideContainerHeight", "showContainerHeight");
    }
    if (isMobileDevice) {
        dojo.byId("divAddressContainer").style.display = "block";
        dojo.replaceClass("divAddressHolder", "showContainer", "hideContainer");
        dojo.byId("txtAddress").value = dojo.byId("txtAddress").getAttribute("defaultAddress");
        if (dojo.byId("tdSearchFeature").className === "tdSearchByFeature") {
            dojo.byId("txtAddress").value = dojo.byId("txtAddress").getAttribute("defaultFeatureName");
            lastSearchString = dojo.byId("txtAddress").value.trim();
        }
        dojo.replaceClass(dojo.byId("txtAddress"), "onBlurColorChange", "colorChange");
    } else {
        if (dojo.coords("divAddressHolder").h > 0) {
            dojo.replaceClass("divAddressHolder", "hideContainerHeight", "showContainerHeight");
            dojo.replaceClass(dojo.byId("divAddressHolder"), "zeroHeight", "addressHolderHeight");
            dojo.byId("txtAddress").blur();
        } else {
            dojo.replaceClass(dojo.byId("txtAddress"), "onBlurColorChange", "colorChange");
            dojo.byId("txtAddress").style.color = "gray";
            dojo.addClass(dojo.byId("divAddressHolder"), "addressHolderHeight");
            setTimeout(function () {
                dojo.byId("txtAddress").style.verticalAlign = "middle";
            }, 500);
            dojo.byId("txtAddress").value = dojo.byId("txtAddress").getAttribute("defaultAddress");
            if (dojo.byId("tdSearchFeature").className === "tdSearchByFeature") {
                dojo.byId("txtAddress").value = dojo.byId("txtAddress").getAttribute("defaultFeatureName");
            }
            lastSearchString = dojo.byId("txtAddress").value.trim();
        }
    }

    if (dojo.byId("tdSearchActivity").className === "tdSearchByActivity") {
        ShowActivitySearchView();
    }
    RemoveChildren(dojo.byId("tblAddressResults"));
    resizeHandler();
    SetHeightAddressResults();
}

//Hide address container

function HideAddressContainer() {
    if (isMobileDevice) {
        setTimeout(function () {
            dojo.byId("divAddressContainer").style.display = "none";
        }, 500);
        dojo.replaceClass("divAddressHolder", "hideContainer", "showContainer");
    } else {
        dojo.replaceClass("divAddressHolder", "hideContainerHeight", "showContainerHeight");
        dojo.replaceClass(dojo.byId("divAddressHolder"), "zeroHeight", "addressHolderHeight");
    }
}

function SetHeightAddressResults() {
    var height = (isMobileDevice) ? (dojo.window.getBox().h - 50) : dojo.coords(dojo.byId("divAddressHolder")).h;
    if (height > 0) {
        dojo.byId("divAddressScrollContent").style.height = (height - ((!isTablet) ? 145 : 175)) + "px";
    }
    if (isMobileDevice) {
        dojo.byId("divPodAddressScrollContent").style.height = (height - 100) + "px";
        dojo.byId("divAddressScrollContent").style.height = (height - 130) + "px";
        dojo.byId("tdSearchAddress").style.width = ((dojo.window.getBox().w - 100) / 3) + "px";
        dojo.byId("tdSearchFeature").style.width = ((dojo.window.getBox().w - 100) / 3) + "px";
        dojo.byId("tdSearchActivity").style.width = ((dojo.window.getBox().w - 100) / 3) + "px";
        dojo.byId("divAddressPlaceHolder").style.width = (dojo.window.getBox().w - 30) + "px";
    }
    CreateScrollbar(dojo.byId("divAddressScrollContainer"), dojo.byId("divAddressScrollContent"));
    CreateScrollbar(dojo.byId("divPodAddressScrollContainer"), dojo.byId("divPodAddressScrollContent"));
}

function SetHeightActivityView() {
    if (isMobileDevice) {
        var height = (dojo.window.getBox().h - 110);
        dojo.byId("divActivityContent").style.height = (height) + "px";
    }
    CreateScrollbar(dojo.byId("divActivityContainer"), dojo.byId("divActivityContent"));
}

//Create the tiny URL with current extent and selected feature

function ShareLink(ext) {
    tinyUrl = null;
    var mapExtent = GetMapExtent();
    var url = esri.urlToObject(window.location.toString());
    if (selectedFeatureID) {
        var urlStr = encodeURI(url.path) + "?selectedFeatureID=" + selectedFeatureID;
    } else {
        var urlStr = encodeURI(url.path) + "?extent=" + mapExtent;
    }
    try {
        url = dojo.string.substitute(mapSharingOptions.TinyURLServiceURL, [urlStr]);

        dojo.io.script.get({
            url: url,
            callbackParamName: "callback",
            load: function (data) {
                tinyResponse = data;
                tinyUrl = data;
                var attr = mapSharingOptions.TinyURLResponseAttribute.split(".");
                for (var x = 0; x < attr.length; x++) {
                    tinyUrl = tinyUrl[attr[x]];
                }
                if (ext) {
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
                    var cellHeight = (isMobileDevice || isTablet) ? 81 : 60;
                    if (dojo.coords("divAppContainer").h > 0) {
                        dojo.replaceClass("divAppContainer", "hideContainerHeight", "showContainerHeight");
                        dojo.replaceClass(dojo.byId("divAppContainer"), "zeroHeight", "fullHeight");
                    } else {
                        dojo.byId("divAppContainer").style.height = cellHeight + "px";
                        dojo.replaceClass("divAppContainer", "showContainerHeight", "hideContainerHeight");
                        dojo.replaceClass(dojo.byId("divAppContainer"), "fullHeight", "zeroHeight");
                    }
                }
            },
            error: function (error) {
                alert(tinyResponse.error);
            }
        });
    } catch (err) {
        alert(messages.getElementsByTagName("falseConfigParams")[0].childNodes[0].nodeValue);
    }
    setTimeout(function () {
        if (!tinyResponse) {
            alert(messages.getElementsByTagName("tinyURLEngine")[0].childNodes[0].nodeValue);
            return;
        }
    }, 6000);
}

//Open login page for facebook,tweet and open Email client with shared link for Email

function Share(site) {
    if (dojo.coords("divAppContainer").h > 0) {
        dojo.replaceClass("divAppContainer", "hideContainerHeight", "showContainerHeight");
        dojo.addClass(dojo.byId("divAppContainer"), "zeroHeight");
    }
    if (tinyUrl) {
        try {
            switch (site) {
                case "facebook":
                    window.open(dojo.string.substitute(mapSharingOptions.FacebookShareURL, [tinyUrl]));
                    break;
                case "twitter":
                    window.open(dojo.string.substitute(mapSharingOptions.TwitterShareURL, [tinyUrl]));
                    break;
                case "mail":
                    parent.location = dojo.string.substitute(mapSharingOptions.ShareByMailLink, [tinyUrl]);
                    break;
            }
        } catch (err) {
            alert(messages.getElementsByTagName("falseConfigParams")[0].childNodes[0].nodeValue);
        }
    } else {
        alert(messages.getElementsByTagName("tinyURLEngine")[0].childNodes[0].nodeValue);
        return;
    }
}

//Get current map Extent

function GetMapExtent() {
    var extents = Math.round(map.extent.xmin).toString() + "," + Math.round(map.extent.ymin).toString() + "," +
        Math.round(map.extent.xmax).toString() + "," + Math.round(map.extent.ymax).toString();
    return (extents);
}

//Get the query string value of the provided key if not found the function returns empty string

function GetQuerystring(key) {
    var _default;
    if (!_default) {
        _default = "";
    }
    key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
    var qs = regex.exec(window.location.href);
    if (!qs) {
        return _default;
    } else {
        return qs[1];
    }
}

//Show progress indicator

function ShowProgressIndicator() {
    loadingIndicatorCounter++;
    dojo.byId("divLoadingIndicator").style.display = "block";
}

//Hide progress indicator

function HideProgressIndicator() {
    dojo.byId("divLoadingIndicator").style.display = "none";
}

//Create scroll-bar

function CreateScrollbar(container, content) {
    var yMax;
    var pxLeft, pxTop, xCoord, yCoord;
    var scrollbar_track;
    var isHandleClicked = false;
    this.container = container;
    this.content = content;
    content.scrollTop = 0;
    if (dojo.byId(container.id + "scrollbar_track")) {
        RemoveChildren(dojo.byId(container.id + "scrollbar_track"));
        container.removeChild(dojo.byId(container.id + "scrollbar_track"));
    }
    if (!dojo.byId(container.id + "scrollbar_track")) {
        scrollbar_track = document.createElement("div");
        scrollbar_track.id = container.id + "scrollbar_track";
        scrollbar_track.className = "scrollbar_track";
    } else {
        scrollbar_track = dojo.byId(container.id + "scrollbar_track");
    }

    var containerHeight = dojo.coords(container);
    var height = containerHeight.h - 6;
    if (height < 0) {
        height = 0;
    }
    scrollbar_track.style.height = height + "px";
    scrollbar_track.style.right = 5 + "px";

    var scrollbar_handle = document.createElement("div");
    scrollbar_handle.className = "scrollbar_handle";
    scrollbar_handle.id = container.id + "scrollbar_handle";

    scrollbar_track.appendChild(scrollbar_handle);
    container.appendChild(scrollbar_track);

    if ((content.scrollHeight - content.offsetHeight) <= 5) {
        scrollbar_handle.style.display = "none";
        scrollbar_track.style.display = "none";
        return;
    } else {
        scrollbar_handle.style.display = "block";
        scrollbar_track.style.display = "block";
        scrollbar_handle.style.height = Math.max(this.content.offsetHeight * (this.content.offsetHeight / this.content.scrollHeight), 25) + "px";
        yMax = this.content.offsetHeight - scrollbar_handle.offsetHeight;
        yMax = yMax - 5; //for getting rounded bottom of handle
        if (window.addEventListener) {
            content.addEventListener("DOMMouseScroll", ScrollDiv, false);
        }
        content.onmousewheel = function (evt) {
            ScrollDiv(evt);
        };
    }

    function ScrollDiv(evt) {
        var evt = window.event || evt; //equalize event object
        var delta = evt.detail ? evt.detail * (-120) : evt.wheelDelta; //delta returns +120 when wheel is scrolled up, -120 when scrolled down
        pxTop = scrollbar_handle.offsetTop;

        if (delta <= -120) {
            var y = pxTop + 10;
            if (y > yMax) {
                y = yMax;
            } // Limit vertical movement
            if (y < 0) {
                y = 0;
            } // Limit vertical movement
            scrollbar_handle.style.top = y + "px";
            content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
        } else {
            var y = pxTop - 10;
            if (y > yMax) {
                y = yMax;
            } // Limit vertical movement
            if (y < 0) {
                y = 2;
            } // Limit vertical movement
            scrollbar_handle.style.top = (y - 2) + "px";
            content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
        }
    }

    //Attaching events to scrollbar components
    scrollbar_track.onclick = function (evt) {
        if (!isHandleClicked) {
            evt = (evt) ? evt : event;
            pxTop = scrollbar_handle.offsetTop; // Sliders vertical position at start of slide.
            var offsetY;
            if (!evt.offsetY) {
                var coords = dojo.coords(evt.target);
                offsetY = evt.layerY - coords.t;
            } else {
                offsetY = evt.offsetY;
            }
            if (offsetY < scrollbar_handle.offsetTop) {
                scrollbar_handle.style.top = offsetY + "px";
                content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
            } else if (offsetY > (scrollbar_handle.offsetTop + scrollbar_handle.clientHeight)) {
                var y = offsetY - scrollbar_handle.clientHeight;
                if (y > yMax) {
                    y = yMax;
                } // Limit vertical movement
                if (y < 0) {
                    y = 0;
                } // Limit vertical movement
                scrollbar_handle.style.top = y + "px";
                content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
            } else {
                return;
            }
        }
        isHandleClicked = false;
    };

    //Attaching events to scrollbar components
    scrollbar_handle.onmousedown = function (evt) {
        isHandleClicked = true;
        evt = (evt) ? evt : event;
        evt.cancelBubble = true;
        if (evt.stopPropagation) {
            evt.stopPropagation();
        }
        pxTop = scrollbar_handle.offsetTop; // Sliders vertical position at start of slide.
        yCoord = evt.screenY; // Vertical mouse position at start of slide.
        document.body.style.MozUserSelect = "none";
        document.body.style.userSelect = "none";
        document.onselectstart = function () {
            return false;
        };
        document.onmousemove = function (evt) {
            evt = (evt) ? evt : event;
            evt.cancelBubble = true;
            if (evt.stopPropagation) {
                evt.stopPropagation();
            }
            var y = pxTop + evt.screenY - yCoord;
            if (y > yMax) {
                y = yMax;
            } // Limit vertical movement
            if (y < 0) {
                y = 0;
            } // Limit vertical movement
            scrollbar_handle.style.top = y + "px";
            content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
        };
    };

    document.onmouseup = function () {
        document.body.onselectstart = null;
        document.onmousemove = null;
    };

    scrollbar_handle.onmouseout = function (evt) {
        document.body.onselectstart = null;
    };

    var startPos;
    var scrollingTimer;

    dojo.connect(container, "touchstart", function (evt) {
        touchStartHandler(evt);
    });

    dojo.connect(container, "touchmove", function (evt) {
        touchMoveHandler(evt);
    });

    dojo.connect(container, "touchend", function (evt) {
        touchEndHandler(evt);
    });

    //Handlers for Touch Events

    function touchStartHandler(e) {
        startPos = e.touches[0].pageY;
    }

    function touchMoveHandler(e) {
        var touch = e.touches[0];
        e.cancelBubble = true;
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        e.preventDefault();

        pxTop = scrollbar_handle.offsetTop;
        var y;
        if (startPos > touch.pageY) {
            if (isTablet) {
                y = pxTop + 5;
            }
            else {
                y = pxTop + 10;
            }
        } else {
            if (isTablet) {
                y = pxTop - 5;
            }
            else {
                y = pxTop - 10;
            }
        }

        //setting scrollbar handle
        if (y > yMax) {
            y = yMax;
        } // Limit vertical movement
        if (y < 0) {
            y = 0;
        } // Limit vertical movement
        setTimeout(function () {
            scrollbar_handle.style.top = y + "px";
            //setting content position
            content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));

            scrolling = true;

            startPos = touch.pageY;
        }, 100);
    }

    function touchEndHandler(e) {
        scrollingTimer = setTimeout(function () {
            clearTimeout(scrollingTimer);
            scrolling = false;
        }, 100);
    }
    //touch scrollbar end
}

//Validate Email

function CheckMailFormat(emailValue) {
    var pattern = /^([a-zA-Z][a-zA-Z0-9\_\-\.]*\@[a-zA-Z0-9\-]*\.[a-zA-Z]{2,4})?$/i
    if (pattern.test(emailValue)) {
        return true;
    } else {
        return false;
    }
}

function SetHeightComments() {
    var height = (isMobileDevice) ? (dojo.window.getBox().h) : (dojo.coords(dojo.byId("divInfoContent")).h - 10);
    if (height > 0) {
        dojo.byId("divCommentsContent").style.height = (height - ((isBrowser) ? 115 : 150)) + "px";
    }
    CreateScrollbar(dojo.byId("divCommentsContainer"), dojo.byId("divCommentsContent"));
    CreateScrollbar(dojo.byId("divCommentContainer"), dojo.byId("divCommentHolder"));
    if (isMobileDevice) {
        dojo.byId("divInfoComments").style.width = dojo.window.getBox().w - 15 + "px";
    }
}

function SetHeightSearchResults() {
    var height = (isMobileDevice) ? (dojo.window.getBox().h) : (dojo.coords(dojo.byId("divResultContent")).h - 10);
    if (height > 0) {
        dojo.byId("divResultDataContent").style.height = (height - ((isBrowser) ? 60 : 65)) + "px";
    }
    CreateScrollbar(dojo.byId("divResultDataContainer"), dojo.byId("divResultDataContent"));

}

function SetHeightViewDetails() {
    var height = (isMobileDevice) ? dojo.window.getBox().h : dojo.coords(dojo.byId("divInfoContent")).h;
    if (height > 0) {
        dojo.byId("divInfoDetailsScroll").style.height = (height - ((isBrowser) ? 50 : 55)) + "px";
    }
    CreateScrollbar(dojo.byId("divInfoDetails"), dojo.byId("divInfoDetailsScroll"));
}

function SetHeightGalleryDetails() {
    var height = (isMobileDevice) ? dojo.window.getBox().h : dojo.coords(dojo.byId("divInfoContent")).h;
    if (height > 0) {
        dojo.byId("divInfoPhotoGalleryContent").style.height = (height - ((isBrowser) ? 55 : 65)) + "px";
    }
    CreateScrollbar(dojo.byId("divInfoPhotoGalleryContainer"), dojo.byId("divInfoPhotoGalleryContent"));
}

function SetHeightImage() {
    var height = (isMobileDevice) ? dojo.window.getBox().h : dojo.coords(dojo.byId("divInfoContent")).h;
    var width = (isMobileDevice) ? dojo.window.getBox().w : dojo.coords(dojo.byId("divInfoContent")).h;
    if (height > 0) {
        dojo.byId("divMblImage").style.height = (height - 65) + "px";
    }
    dojo.byId("imgMblAttachment").style.maxWidth = (width - 20) + "px";
    dojo.byId("imgMblAttachment").style.height = (height - 70) + "px";
}

function SetHeightViewDirections() {
    var height = (isMobileDevice) ? dojo.window.getBox().h : dojo.coords(dojo.byId("divInfoContent")).h;
    height1 = height - ((isBrowser) ? 55 : 65);
    if (height1 < 0) {
        height1 = -(height1);
    }
    if (height < 0) {
        height = -(height);
    }
    dojo.byId("divInfoDirectionsScroll").style.height = height1 + "px";
    CreateScrollbar(dojo.byId("divInfoDirections"), dojo.byId("divInfoDirectionsScroll"));
    if (dojo.byId("divNewInfoDirectionsScroll").style.display === "block") {
        dojo.byId("divNewInfoDirectionsScroll").style.height = (height - ((isBrowser) ? 55 : 65)) + "px";
        CreateScrollbar(dojo.byId("divInfoDirections"), dojo.byId("divNewInfoDirectionsScroll"));
    }
}

function ShowFeatureInfoDetails(selectedFeature, attributes) {
    fromInfoWindow = true;
    newInfoLeftOffice = 0;
    newGalleryLeft = 0;

    if (!isMobileDevice) {
        dojo.byId("divInfoContent").style.width = infoWindowWidth + "px";
        dojo.byId("divInfoContent").style.height = infoWindowHeight + "px";
    }
    if (commentLayer.Visibility) {
        dojo.byId("imgComments").style.display = "block";
    } else {
        dojo.byId("imgComments").style.display = "none";
        HideProgressIndicator();
    }
    if (!isMobileDevice) {
        dojo.byId("divInfoContent").style.display = "none";
    }

    ShowProgressIndicator();
    var featureID = attributes[map.getLayer(devPlanLayerID).objectIdField];
    RelationshipQuery(selectedFeature, featureID, attributes, isFeatureSearched);
}

//Sort comments according to date

function SortResultFeatures(a, b) {
    try {
        var x = dojo.string.substitute(commentsInfoPopupFieldsCollection.SubmitDate, a.attributes);
        var y = dojo.string.substitute(commentsInfoPopupFieldsCollection.SubmitDate, b.attributes);
    } catch (err) {
        alert(messages.getElementsByTagName("falseConfigParams")[0].childNodes[0].nodeValue);
    }
    return ((x > y) ? -1 : ((x < y) ? 1 : 0));
}

//Fetch comments from layer

function FetchComments(facilityID, isInfoView) {
    map.infoWindow.hide();
    selectedFeatureID = facilityID;
    var query = new esri.tasks.Query();
    var facId;
    foreignKeyforComments.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g, function (match, key) {
        facId = key;
    });

    query.where = facId + "= '" + facilityID + "'";
    query.outFields = ["*"];
    map.getLayer(commentsLayerId).selectFeatures(query, esri.layers.FeatureLayer.SELECTION_NEW, function (features) {
        if (fromInfoWindow || isMobileDevice) {
            RemoveChildren(dojo.byId("divCommentsContent"));
            RemoveScrollBar(dojo.byId("divCommentsContainer"));
        } else {
            RemoveChildren(dojo.byId("divCommentHolder"));
            RemoveScrollBar(dojo.byId("divCommentContainer"));
        }
        var commentsTable = dojo.create("table", {
            "cellspacing": "0",
            "className": "tblCommentsContent"
        }, dojo.byId("divCommentsContent"));
        commentsTable.id = "tblComment";
        if (fromInfoWindow || isMobileDevice) {
            dojo.byId("divCommentsContent").appendChild(commentsTable);
        } else {
            dojo.byId("divCommentHolder").appendChild(commentsTable);
        }
        if (!isMobileDevice) {
            if (fromInfoWindow) {
                commentsTable.style.width = (infoWindowWidth - 25) + "px";
            } else {
                commentsTable.style.width = (infoBoxWidth - 20) + "px";
            }
        } else {
            commentsTable.style.width = "97%";
        }

        var commentsTBody = document.createElement("tbody");
        commentsTable.appendChild(commentsTBody);
        if (features.length > 0) {
            if (searchFlag) {
                dojo.byId("divComments").style.display = "block";
            }
            features.sort(SortResultFeatures); //Sort comments based on submitted date
            for (var i = 0; i < features.length; i++) {

                var trComments = document.createElement("tr");
                var commentsCell = document.createElement("td");
                commentsCell.className = "bottomborder";

                var controlId = (isInfoView) ? "info_" + i : i;

                commentsCell.appendChild(CreateCommentRecord(features[i].attributes, controlId));
                trComments.appendChild(commentsCell);
                commentsTBody.appendChild(trComments);
                CreateRatingWidget(dojo.byId("commentRating" + controlId));
                try {
                    SetRating(dojo.byId("commentRating" + controlId), dojo.string.substitute(commentsInfoPopupFieldsCollection.Rank, features[i].attributes));
                } catch (err) {
                    alert(messages.getElementsByTagName("falseConfigParams")[0].childNodes[0].nodeValue);
                }
            }
        } else {
            if (dojo.byId("tdCom")) {
                dojo.byId("tdCom").innerHTML = "";
            }
            var trComments = document.createElement("tr");
            var commentsCell = document.createElement("td");
            commentsCell.appendChild(document.createTextNode(messages.getElementsByTagName("noComment")[0].childNodes[0].nodeValue));
            trComments.setAttribute("noComments", "true");
            trComments.appendChild(commentsCell);
            commentsTBody.appendChild(trComments);
            if (searchFlag) {
                dojo.byId("divComments").style.display = "none";
            }
            ResetSlideControls();
        }
        SetHeightComments();
        if (routeDrawn && isMobileDevice) {
            ShowProgressIndicator();
        }
        else {
            setTimeout(function () {
                HideProgressIndicator();
            }, 1000);
        }
    }, function (err) {
        HideProgressIndicator();
        alert(messages.getElementsByTagName("commentsErrorMessage")[0].childNodes[0].nodeValue);
    });
}

//Get width of a control when text and font size are specified
String.prototype.getWidth = function (fontSize) {
    var test = document.createElement("span");
    document.body.appendChild(test);
    test.style.visibility = "hidden";

    test.style.fontSize = fontSize + "px";

    test.innerHTML = this;
    var w = test.offsetWidth;
    document.body.removeChild(test);
    return w;
};

//Create comment record

function CreateCommentRecord(attributes, i) {
    var tableComments = document.createElement("table");
    tableComments.className = "tdRating";
    tableComments.cellSpacing = "0";
    var tBodyComments = document.createElement("tbody");

    var trRating = document.createElement("tr");
    tBodyComments.appendChild(trRating);

    var tdRating = document.createElement("td");
    tdRating.className = "tdRating";
    tdRating.align = "left";
    tdRating.appendChild(CreateRatingControl(true, "commentRating" + i, 0, 5));
    trRating.appendChild(tdRating);

    var trCaption = document.createElement("tr");
    tBodyComments.appendChild(trCaption);

    var tdResult = document.createElement("td");
    tdResult.style.width = "80px";

    var trDate = document.createElement("tr");
    tBodyComments.appendChild(trDate);

    var tdCaption = document.createElement("td");
    var date = new js.date();
    try {
        if (!dojo.string.substitute(commentsInfoPopupFieldsCollection.SubmitDate, attributes)) {
            dojo.string.substitute(commentsInfoPopupFieldsCollection.SubmitDate, attributes) = showNullValueAs;
            tdCaption.innerHTML = "Date: " + showNullValueAs;
        } else {

            var utcMilliseconds = Number(dojo.string.substitute(commentsInfoPopupFieldsCollection.SubmitDate, attributes));
            tdCaption.innerHTML = "Date: " + dojo.date.locale.format(date.utcToLocal(date.utcTimestampFromMs(utcMilliseconds)), {
                datePattern: formatDateAs,
                selector: "date"
            });
        }
    } catch (err) {
        alert(messages.getElementsByTagName("falseConfigParams")[0].childNodes[0].nodeValue);
        tdCaption.innerHTML = "Date: " + showNullValueAs;
    }

    tdCaption.align = "left";
    tdCaption.colSpan = 2;

    trCaption.appendChild(tdResult);
    trDate.appendChild(tdCaption);

    var trCommentsInput = document.createElement("tr");
    var tdValue = document.createElement("td");
    tdValue.id = "tdComment";
    if (isMobileDevice) {
        tdValue.style.width = "95%";
    } else {
        tdValue.style.width = (infoWindowWidth - 40) + "px";
    }
    tdValue.colSpan = 2;
    try {
        if (dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes) !== "null" || dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes)) {
            var wordCount = dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes).split(/\n/).length;
            if (wordCount > 1) {
                var value = dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes).split(/\n/)[0].length === 0 ? "<br>" : dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes).split(/\n/)[0].trim();
                for (var c = 1; c < wordCount; c++) {
                    var comment;
                    if (value !== "<br>") {
                        comment = dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes).split(/\n/)[c].trim().replace("", "<br>");
                    } else {
                        comment = dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes).split(/\n/)[c].trim();
                    }
                    value += dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes).split(/\n/)[c].length === 0 ? "<br>" : comment;
                }
            } else {
                value = dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes);
            }
            tdValue.innerHTML += value;

            if (CheckMailFormat(dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes)) || dojo.string.substitute(dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes)).match("http:") || dojo.string.substitute(dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes)).match("https:")) {
                tdValue.className = "tdBreakWord";
            } else {
                tdValue.className = "tdBreak";
            }
            var x = dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes).split(" ");
            for (var i in x) {
                w = x[i].getWidth(15);
                var boxWidth = (isMobileDevice) ? (dojo.window.getBox().w - 23) : (infoWindowWidth - 40);
                if (boxWidth < w) {
                    tdValue.className = "tdBreakWord";
                    continue;
                }
            }
        } else {
            tdValue.innerHTML = showNullValueAs;
        }
    } catch (err) {
        alert(messages.getElementsByTagName("falseConfigParams")[0].childNodes[0].nodeValue);
    }
    trCommentsInput.appendChild(tdValue);
    tBodyComments.appendChild(trCommentsInput);

    tableComments.appendChild(tBodyComments);
    return tableComments;
}

//Create rating control

function CreateRatingControl(readonly, ctlId, intitalValue, numStars) {
    var ratingCtl = document.createElement("ul");
    ratingCtl.setAttribute("readonly", readonly);
    ratingCtl.id = ctlId;
    ratingCtl.setAttribute("value", intitalValue);
    ratingCtl.setAttribute("numStars", numStars);
    ratingCtl.style.padding = 0;
    ratingCtl.style.margin = 0;
    return ratingCtl;
}

//Create Rating widget

function CreateRatingWidget(rating) {
    var numberStars = Number(rating.getAttribute("numstars"));
    var isReadOnly = String(rating.getAttribute("readonly")).bool();
    for (var i = 0; i < numberStars; i++) {
        var li = document.createElement("li");
        li.value = (i + 1);
        li.className = isReadOnly ? "ratingStar" : "ratingStarBig";
        rating.appendChild(li);
        if (i < rating.value) {
            dojo.addClass(li, isReadOnly ? "ratingStarChecked" : "ratingStarBigChecked");
        }
        li.onmouseover = function () {
            if (!isReadOnly) {
                var ratingValue = Number(this.value);
                var ratingStars = dojo.query(isReadOnly ? ".ratingStar" : ".ratingStarBig", rating);
                for (var i = 0; i < ratingValue; i++) {
                    dojo.addClass(ratingStars[i], isReadOnly ? "ratingStarChecked" : "ratingStarBigChecked");
                }
            }
        };
        li.onmouseout = function () {
            if (!isReadOnly) {
                var ratings = Number(rating.value);
                var ratingStars = dojo.query(isReadOnly ? ".ratingStar" : ".ratingStarBig", rating);
                for (var i = 0; i < ratingStars.length; i++) {
                    if (i < ratings) {
                        dojo.addClass(ratingStars[i], isReadOnly ? "ratingStarChecked" : "ratingStarBigChecked");
                    } else {
                        dojo.removeClass(ratingStars[i], isReadOnly ? "ratingStarChecked" : "ratingStarBigChecked");
                    }
                }
            }
        };
        li.onclick = function () {
            if (!isReadOnly) {
                rating.value = Number(this.value);
                var ratingStars = dojo.query(isReadOnly ? ".ratingStar" : ".ratingStarBig", rating);
                for (var i = 0; i < ratingStars.length; i++) {
                    if (i < this.value) {
                        dojo.addClass(ratingStars[i], isReadOnly ? "ratingStarChecked" : "ratingStarBigChecked");
                    } else {
                        dojo.removeClass(ratingStars[i], isReadOnly ? "ratingStarChecked" : "ratingStarBigChecked");
                    }
                }
            }
        };
    }
}

function SetRating(control, rating) {
    control.value = rating;
    var isReadOnly = String(control.getAttribute("readonly")).bool();
    var ratingStars = dojo.query(isReadOnly ? ".ratingStar" : ".ratingStarBig", control);
    for (var i = 0; i < ratingStars.length; i++) {
        if (i < rating) {
            dojo.addClass(ratingStars[i], isReadOnly ? "ratingStarChecked" : "ratingStarBigChecked");
        } else {
            dojo.removeClass(ratingStars[i], isReadOnly ? "ratingStarChecked" : "ratingStarBigChecked");
        }
    }
}

function HideInfoContainer() {
    if (isMobileDevice) {
        setTimeout(function () {
            dojo.byId("divInfoContainer").style.display = "none";
            dojo.replaceClass("divInfoContent", "hideContainer", "showContainer");
        }, 500);
    } else {
        selectedFeature = null;
        selectedGraphic = null;
        map.infoWindow.hide();
        pointAttr = null;
        dojo.byId("divInfoContent").style.display = "none";
    }
}

//Reset comments data

function ResetCommentValues() {
    SetRating(dojo.byId("commentRating"), 0);
    dojo.byId("txtComments").value = "";
    document.getElementById("commentError").innerHTML = "";
    document.getElementById("commentError").style.display = "none";
    dojo.byId("divAddComment").style.display = "none";
    dojo.byId("divCommentsView").style.display = "block";
    dojo.byId("divCommentsList").style.display = "block";
    SetHeightComments();
}

function DisplayInfoWindow(selectedFeature, attributes, featureSearched) {
    pointAttr = attributes;
    for (var i in attributes) {
        if (!attributes[i]) {
            attributes[i] = "";
        }
    }
    (isMobileDevice) ? map.infoWindow.resize(225, 60) : map.infoWindow.resize(infoWindowWidth, infoWindowHeight);

    setTimeout(function () {
        if (!isMobileDevice) {
            map.setExtent(GetInfoWindowBrowserMapExtent(selectedFeature));
        } else {
            if (!((searchFlag) && (map.getLayer(tempBufferLayer).graphics.length <= 0))) {

                setTimeout(function () {
                    if (!featureSearched) {
                        map.setExtent(GetInfoWindowMobileMapExtent(selectedFeature));
                    } else {
                        map.setExtent(GetMobileMapExtent(selectedFeature));
                    }
                }, 500);
            }
        }
        selectedGraphic = selectedFeature;
        var screenPoint = map.toScreen(selectedFeature);
        screenPoint.y = map.height - screenPoint.y;
        map.infoWindow.show(screenPoint);
        if (isMobileDevice) {
            map.getLayer(highlightLayerId).clear();
            var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, locatorRippleSize, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.colorFromRgb(GetStylesSheet(".RippleColor")), 4), new dojo.Color([0, 0, 0, 0]));
            AddGraphic(map.getLayer(highlightLayerId), symbol, selectedFeature);
            var header;
            try {
                if (dojo.string.substitute(infoWindowHeader[0].FieldName, attributes)) {
                    header = dojo.string.substitute(infoWindowHeader[0].FieldName, attributes).trimString(15);
                } else {
                    header = showNullValueAs;
                }
                if (map.getLayer(tempGraphicsLayerId).graphics.length > 0) {
                    if (map.getLayer(tempBufferLayer).graphics.length > 0) {
                        if (map.getLayer(tempBufferLayer).graphics[0].geometry.contains(selectedFeature)) {
                            RemoveChildren(dojo.byId("divDirection"));
                            ConfigureRoute(map.getLayer(tempGraphicsLayerId).graphics[0].geometry, selectedFeature);
                        } else {
                            map.getLayer(routeLayerId).clear();
                        }
                    } else {
                        RemoveChildren(dojo.byId("divDirection"));

                        ConfigureRoute(map.getLayer(tempGraphicsLayerId).graphics[0].geometry, selectedFeature);
                    }
                }



                map.infoWindow.setTitle(header, function () {
                    if (!getDirections) {
                        dojo.byId("imgDirections").style.display = "none";
                    } else {
                        if (map.getLayer(tempBufferLayer).graphics.length > 0) {
                            dojo.byId("imgList").style.display = "block";
                            if (!map.getLayer(tempBufferLayer).graphics[0].geometry.contains(selectedFeature)) {
                                dojo.byId("imgDirections").style.display = "none";
                            } else {
                                dojo.byId("imgDirections").style.display = "block";
                            }
                        } else if (map.getLayer(tempGraphicsLayerId).graphics.length > 0) {
                            if (isFeatureSearched) {
                                dojo.byId("imgList").style.display = "block";
                            }
                            dojo.byId("imgDirections").style.display = "block";
                        } else {
                            if (!addressFlag) {
                                dojo.byId("imgDirections").style.display = "block";
                            } else {
                                dojo.byId("imgDirections").style.display = "none";
                            }
                        }
                    }

                    if (featureSearched) {
                        isFeatureSearched = true;
                        dojo.byId("spanDirectionHeader").innerHTML = "Directions to " + dojo.string.substitute(featureName, attributes);
                        dojo.byId("spanFeatureInfo").innerHTML = dojo.string.substitute(featureName, attributes);
                        dojo.byId("imgList").style.display = "block";
                        if (getDirections) {
                            dojo.byId("imgDirections").style.display = "block";
                        }
                        if (!mapPoint) {
                            NewAddressSearch();
                        }
                    }

                    HideSearchResultContainer();
                    ShowFeatureDetailContainer();

                });
                var content;
                if ((dojo.string.substitute(infoWindowContent[0].FieldName, attributes)) && (dojo.string.substitute(infoWindowContent[0].FieldName, attributes) !== "-")) {
                    if (dojo.string.substitute(infoWindowContent[0].FieldName, attributes).trimString) {
                        content = dojo.string.substitute(infoWindowContent[0].FieldName, attributes).trimString(15);
                    } else {
                        content = dojo.string.substitute(infoWindowContent[0].FieldName, attributes);
                    }
                } else {
                    content = showNullValueAs;
                }
                map.infoWindow.setContent(content);
            } catch (err) {
                alert(messages.getElementsByTagName("falseConfigParams")[0].childNodes[0].nodeValue);
            }
        } else {
            dojo.byId("divInfoContent").style.display = "block";
            dojo.byId("tdInfoHeader").innerHTML = infoWindowHeader[0].InfoWindowHeaderText;
            dojo.byId("imgDetails").style.display = "none";
            ShowInfoDetailsView();
            SetHeightViewDetails();
        }
    }, 300);
}

//Show feature information container

function ShowFeatureDetailContainer() {
    dojo.byId("divInfoContainer").style.display = "block";
    dojo.byId("divInfoDetails").style.display = "block";
    dojo.byId("divInfoComments").style.display = "none";
    dojo.byId("divInfoDirections").style.display = "none";
    dojo.byId("imgMblPrevImg").style.display = "none";
    dojo.byId("imgMblNextImg").style.display = "none";
    dojo.byId("imgDetails").style.display = "none";
    if (commentLayer.Visibility) {
        dojo.byId("imgComments").style.display = "block";
    }
    dojo.byId("divInfoPhotoGalleryContainer").style.display = "none";

    dojo.replaceClass("divInfoContent", "showContainer", "hideContainer");
    SetHeightViewDetails();
    dojo.byId("tdInfoHeader").innerHTML = infoWindowHeader[0].InfoWindowHeaderText;
}

//Show add-comments view

function ShowAddCommentsView() {
    if (dojo.isIE) {
        dojo.byId("txtComments").value = "";
    }
    dojo.byId("divAddComment").style.display = "block";
    dojo.byId("divCommentsView").style.display = "none";
    dojo.byId("divCommentsList").style.display = "none";
    SetHeightCmtControls();
    setTimeout(function () {
        dojo.byId("txtComments").focus();
    }, 50);
}

function SetHeightCmtControls() {
    var height = (isMobileDevice) ? (dojo.window.getBox().h - 20) : dojo.coords(dojo.byId("divInfoContent")).h;
    dojo.byId("divCmtIpContainer").style.height = (height - ((isTablet) ? 60 : 50)) + "px";
    dojo.byId("divCmtIpContent").style.height = (height - ((isTablet) ? 60 : 50)) + "px";
    CreateScrollbar(dojo.byId("divCmtIpContainer"), dojo.byId("divCmtIpContent"));
}

//Adds a new comment

function AddComment() {
    if (commentLayer.Visibility) {
        if (dojo.byId("txtComments").value.trim().length === 0) {
            dojo.byId("txtComments").focus();
            ShowSpanErrorMessage("commentError", messages.getElementsByTagName("enterComment")[0].childNodes[0].nodeValue);
            return;
        } else if (dojo.byId("txtComments").value.length > 250) {
            dojo.byId("txtComments").focus();
            ShowSpanErrorMessage("commentError", messages.getElementsByTagName("commentsLength")[0].childNodes[0].nodeValue);
            return;
        }

        ShowProgressIndicator();
        var commentGraphic = new esri.Graphic();
        var referenceDate = new Date(1970, 0, 1);
        var date = new js.date();

        var attr = {};
        attr[databaseFields.FeatureIdFieldName] = selectedFeatureID;
        attr[databaseFields.CommentsFieldName] = dojo.byId("txtComments").value.trim();
        attr[databaseFields.DateFieldName] = date.utcMsFromTimestamp(date.localToUtc(date.localTimestampNow()));
        attr[databaseFields.RankFieldName] = Number(dojo.byId("commentRating").value);
        commentGraphic.setAttributes(attr);

        map.getLayer(commentsLayerId).applyEdits([commentGraphic], null, null, function (msg) {
            if (!msg[0].error) {
                var tableCommentsContent = dojo.query("table", dojo.byId("divCommentsContent"));
                if (tableCommentsContent.length > 0) {
                    var x = dojo.query("tr[noComments = 'true']", tableCommentsContent[0]);
                    if (x.length > 0) {
                        RemoveChildren(tableCommentsContent[0]);
                    }
                    var trCommentsContent = tableCommentsContent[0].insertRow(0);
                    var commentsCell = document.createElement("td");
                    commentsCell.className = "bottomborder";
                    var index = dojo.query("tr", tableCommentsContent[0]).length;
                    if (index) {
                        index = 0;
                    }
                    var controlId = "info_" + index;
                    commentsCell.appendChild(CreateCommentRecord(attr, controlId));
                    trCommentsContent.appendChild(commentsCell);
                    CreateRatingWidget(dojo.byId("commentRating" + controlId));
                    SetRating(dojo.byId("commentRating" + controlId), attr[databaseFields.RankFieldName]);
                    if (defaultFeature) {
                        if (defaultFeature.facilityID === selectedFeatureID) {
                            var commentsTable = dojo.query("table", dojo.byId("divCommentHolder"));
                            if (commentsTable.length > 0) {
                                var noComments = dojo.query("tr[noComments = 'true']", commentsTable[0]);
                                if (noComments.length > 0) {
                                    RemoveChildren(commentsTable[0]);
                                }
                                dojo.byId("divComments").style.display = "block";
                                ResetSlideControls();
                                var trCommentsContent = commentsTable[0].insertRow(0);
                                var commentsCell = document.createElement("td");
                                commentsCell.className = "bottomborder";
                                var index = dojo.query("tr", dojo.byId("tblComment")).length;
                                if (index) {
                                    index = 0;
                                }
                                var controlId = index;
                                commentsCell.appendChild(CreateCommentRecord(attr, controlId));
                                trCommentsContent.appendChild(commentsCell);
                                CreateRatingWidget(dojo.byId("commentRating" + controlId));
                                SetRating(dojo.byId("commentRating" + controlId), attr[databaseFields.RankFieldName]);
                            }
                        }
                    }
                }
            }
            ResetCommentValues();
            HideProgressIndicator();
            SetHeightComments();
        }, function (err) {
            HideProgressIndicator();
            alert(messages.getElementsByTagName("commentsErrorMessage")[0].childNodes[0].nodeValue);
        });
    }
}

function HideSearchResultContainer() {
    setTimeout(function () {
        dojo.byId("divResults").style.display = "none";
        dojo.replaceClass("divResultContent", "hideContainer", "showContainer");
    }, 500);
}

//Show Info details view

function ShowInfoDetailsView() {
    dojo.byId("divInfoComments").style.display = "none";
    dojo.byId("divInfoDetails").style.display = "block";
    dojo.byId("divInfoDirections").style.display = "none";
    if (commentLayer.Visibility) {
        dojo.byId("imgComments").style.display = "block";
    } else {
        dojo.byId("imgComments").style.display = "none";
        HideProgressIndicator();
    }
    dojo.byId("imgDetails").style.display = "none";
    dojo.byId("tdImgGAllery").style.display = "none";
    dojo.byId("tdInfoHeader").style.display = "block";
    dojo.byId("tdInfoHeader").innerHTML = infoWindowHeader[0].InfoWindowHeaderText;
    dojo.byId("tdClose").style.display = "block";
    dojo.byId("divInfoPhotoGalleryContainer").style.display = "none";
    if (isMobileDevice) {
        if (!addressFlag) {
            dojo.byId("imgDirections").style.display = "block";
        }
        if (!getDirections) {
            dojo.byId("imgDirections").style.display = "none";
        } else {
            if (!isFeatureSearched) {
                if (map.getLayer(tempBufferLayer).graphics.length > 0) {
                    dojo.byId("imgList").style.display = "block";
                    if (!map.getLayer(tempBufferLayer).graphics[0].geometry.contains(selectedFeature)) {
                        dojo.byId("imgDirections").style.display = "none";
                    } else {
                        dojo.byId("imgDirections").style.display = "block";
                    }
                }
            } else {
                dojo.byId("imgList").style.display = "block";
            }
        }


        if (countySearch) {
            dojo.byId("imgDirections").style.display = "block";
        }
    }
    SetHeightViewDetails();
}

function ShowPhotoGalleryView() {
    dojo.byId("divInfoComments").style.display = "none";
    dojo.byId("divInfoDetails").style.display = "none";
    dojo.byId("divInfoDirections").style.display = "none";
    dojo.byId("divInfoPhotoGalleryContainer").style.display = "block";
    dojo.byId("divPhoto").style.display = "block";
    dojo.byId("divMblImage").style.display = "none";
    dojo.byId("imgComments").style.display = "none";
    dojo.byId("imgDetails").style.display = "none";
    dojo.byId("imgDirections").style.display = "none";
    dojo.byId("imgList").style.display = "none";
    dojo.byId("tdInfoHeader").style.display = "none";
    dojo.byId("tdImgGAllery").style.display = "block";
    dojo.byId("divCount").style.display = "none";
    dojo.byId("imgMblPrevImg").style.display = "none";
    dojo.byId("imgMblNextImg").style.display = "none";
    dojo.byId("tdClose").style.display = "none";
    dojo.byId("imgGallery").src = "images/backGallery.png";
    dojo.byId("imgGallery").onclick = function () {
        ShowInfoDetailsView();
    };
    SetHeightGalleryDetails();
}

//Show comments view

function ShowCommentsView() {
    dojo.byId("imgDetails").style.display = "block";
    dojo.byId("imgComments").style.display = "none";
    dojo.byId("divInfoComments").style.display = "block";
    dojo.byId("divInfoDetails").style.display = "none";
    dojo.byId("divInfoDirections").style.display = "none";
    dojo.byId("divInfoPhotoGalleryContainer").style.display = "none";
    dojo.byId("tdInfoHeader").innerHTML = "Comments";
    if (isMobileDevice) {
        if (!addressFlag) {
            dojo.byId("imgDirections").style.display = "block";
        }
        if (!getDirections) {
            dojo.byId("imgDirections").style.display = "none";
        } else {
            if (!isFeatureSearched) {
                if (map.getLayer(tempBufferLayer).graphics.length > 0) {
                    dojo.byId("imgList").style.display = "block";
                    if (!map.getLayer(tempBufferLayer).graphics[0].geometry.contains(selectedFeature)) {
                        dojo.byId("imgDirections").style.display = "none";
                    } else {
                        dojo.byId("imgDirections").style.display = "block";
                    }
                }
            } else {
                dojo.byId("imgList").style.display = "block";
            }
        }

    }
    ResetCommentValues();
    SetHeightComments();
    SetHeightCmtControls();
}

//Show Info request directions view

function ShowInfoDirectionsView() {
    if (isMobileDevice) {
        dojo.byId("divInfoComments").style.display = "none";
        dojo.byId("divInfoDetails").style.display = "none";
        dojo.byId("divInfoDirections").style.display = "block";
        dojo.byId("imgDirections").style.display = "none";
        dojo.byId("imgDetails").style.display = "block";
        if (commentLayer.Visibility) {
            dojo.byId("imgComments").style.display = "block";
        }
        dojo.byId("tdInfoHeader").innerHTML = "Directions";
        SetHeightViewDirections();
    } else {
        dojo.byId("imgDirections").style.display = "none";
        dojo.byId("imgComments").style.display = "block";
        dojo.byId("divInfoComments").style.display = "none";
        dojo.byId("divInfoDetails").style.display = "block";
        dojo.byId("divInfoDirections").style.display = "none";
        SetHeightViewDetails();
    }
}

//Expand image

function ShowImages(img) {
    var images;
    if (fromInfoWindow) {
        images = imgFiles;
    } else {
        images = imgArray;
    }
    index = img.getAttribute("index");

    if (!isMobileDevice) {
        dojo.replaceClass("divImgsBlock", "opacityShowAnimation", "opacityHideAnimation");
        dojo.replaceClass("divImgs", "showContainer", "hideContainer");

        dojo.byId("imgNextImg").src = "images/arrRight.png";
        dojo.byId("imgPreviousImg").src = "images/arrLeft.png";
        if (index == 0 && images.length == 1) {
            dojo.byId("imgPreviousImg").style.display = "none";
            dojo.byId("imgNextImg").style.display = "none";
        } else if (index == 0) {
            dojo.byId("imgPreviousImg").style.display = "none";
            dojo.byId("imgNextImg").style.display = "block";
        } else if (images.length == Number(index) + 1) {
            dojo.byId("imgNextImg").style.display = "none";
            dojo.byId("imgPreviousImg").style.display = "block";
        } else {
            dojo.byId("imgNextImg").style.display = "block";
            dojo.byId("imgPreviousImg").style.display = "block";
        }
        setTimeout(function () {
            dojo.byId("divImgsBlock").style.display = "block";
            dojo.byId("divImgs").style.display = "block";
        }, 500);
        ShowProgressIndicator();
        dojo.byId("imgAttachments").src = images[index];
    } else {
        var imgNumber = img.getAttribute("totalImages");
        dojo.byId("divCount").style.display = "block";

        if (index == 0 && images.length == 1) {
            dojo.byId("imgMblPrevImg").style.display = "none";
            dojo.byId("imgMblNextImg").style.display = "none";
        } else if (index == 0) {
            dojo.byId("imgMblPrevImg").style.display = "none";
            dojo.byId("imgMblNextImg").style.display = "block";
        } else if (images.length == Number(index) + 1) {
            dojo.byId("imgMblNextImg").style.display = "none";
            dojo.byId("imgMblPrevImg").style.display = "block";
        } else {
            dojo.byId("imgMblNextImg").style.display = "block";
            dojo.byId("imgMblPrevImg").style.display = "block";
        }

        dojo.byId("divCount").innerHTML = (Number(index) + 1) + "/" + imgNumber;
        dojo.byId("divCount").style.padding = "5px";
        dojo.byId("tdClose").style.display = "none";

        dojo.byId("divInfoPhotoGalleryContainer").style.display = "none";
        dojo.byId("divMblImage").style.display = "block";
        SetHeightImage();
        ShowProgressIndicator();
        dojo.byId("imgMblAttachment").src = images[index];
        dojo.byId("imgMblAttachment").onload = function () {
            HideProgressIndicator();
        };
        dojo.byId("tdInfoHeader").style.display = "none";
        dojo.byId("tdImgGAllery").style.display = "block";
        dojo.byId("imgGallery").src = "images/mblGallery.png";
        dojo.byId("imgGallery").onclick = function () {
            ShowPhotoGalleryView();
        };
    }
}

function ShowNextImg() {
    var images;
    if (fromInfoWindow) {
        images = imgFiles;
    } else {
        images = imgArray;
    }
    if ((images.length) === Number(index) + 1) {
        dojo.byId("imgNextImg").style.display = "none";
        dojo.byId("imgMblNextImg").style.display = "none";
        HideProgressIndicator();
    } else if ((images.length) === Number(index) + 2) {
        index++;
        if (isMobileDevice) {
            dojo.byId("imgMblAttachment").src = images[index];
            dojo.byId("divCount").innerHTML = (Number(index) + 1) + "/" + imgFiles.length;
            dojo.byId("imgMblNextImg").style.display = "none";
            dojo.byId("imgMblPrevImg").style.display = "block";
        } else {
            dojo.byId("imgNextImg").style.display = "none";
            dojo.byId("imgPreviousImg").style.display = "block";
            ShowProgressIndicator();
            dojo.byId("imgAttachments").src = images[index];

        }
    } else {
        index++;
        if (isMobileDevice) {
            dojo.byId("imgMblAttachment").src = images[index];
            dojo.byId("imgMblAttachment").onload = function () {
                HideProgressIndicator();
            };
            dojo.byId("divCount").innerHTML = (Number(index) + 1) + "/" + imgFiles.length;
            dojo.byId("imgMblNextImg").style.display = "block";
            dojo.byId("imgMblPrevImg").style.display = "block";
        } else {
            dojo.byId("imgNextImg").style.display = "block";
            dojo.byId("imgPreviousImg").style.display = "block";
            ShowProgressIndicator();
            dojo.byId("imgAttachments").src = images[index];

        }
    }
}

function ShowPreviousImg() {
    var images;
    if (fromInfoWindow) {
        images = imgFiles;
    } else {
        images = imgArray;
    }
    if (index == 0) {
        dojo.byId("imgMblPrevImg").style.display = "none";
        dojo.byId("imgPreviousImg").style.display = "none";
        HideProgressIndicator();
    } else if (index === 1) {
        index--;
        if (isMobileDevice) {
            dojo.byId("imgMblAttachment").src = images[index];
            dojo.byId("divCount").innerHTML = (Number(index) + 1) + "/" + imgFiles.length;
            dojo.byId("imgMblPrevImg").style.display = "none";
            dojo.byId("imgMblNextImg").style.display = "block";
        } else {
            dojo.byId("imgPreviousImg").style.display = "none";
            dojo.byId("imgNextImg").style.display = "block";
            ShowProgressIndicator();
            dojo.byId("imgAttachments").src = images[index];

        }
    } else {
        index--;
        if (isMobileDevice) {
            dojo.byId("imgMblAttachment").src = images[index];
            dojo.byId("divCount").innerHTML = (Number(index) + 1) + "/" + imgFiles.length;
            dojo.byId("imgMblPrevImg").style.display = "block";
            dojo.byId("imgMblNextImg").style.display = "block";
        } else {
            dojo.byId("imgNextImg").style.display = "block";
            dojo.byId("imgPreviousImg").style.display = "block";
            ShowProgressIndicator();
            dojo.byId("imgAttachments").src = images[index];

        }
    }
}

function CloseImages() {
    dojo.replaceClass("divImgsBlock", "opacityHideAnimation", "opacityShowAnimation");
    dojo.replaceClass("divImgs", "hideContainer", "showContainer");
    setTimeout(function () {
        dojo.byId("divImgsBlock").style.display = "none";
        dojo.byId("divImgs").style.display = "none";
    }, 500);
}

function NewAddressSearch() {
    if (!getDirections) {
        dojo.byId("divDirections").style.display = "none";
    } else {
        if (getDirectionsDesktop && isBrowser) {
            dojo.byId("divDirections").style.display = "block";
        } else if (getDirectionsMobile && isTablet) {
            dojo.byId("divDirections").style.display = "block";

        }
        searchAddressViaPod = true;
        dojo.byId("tdPrint").style.display = "none";
        RemoveChildren(dojo.byId("tblPodAddressResults"));
        RemoveScrollBar(dojo.byId("divPodAddressScrollContainer"));
        dojo.byId("txtPodAddress").value = dojo.byId("txtPodAddress").getAttribute("defaultAddress");
        if (!isMobileDevice) {
            dojo.byId("divDirectionSearchContent").style.display = "block";
            dojo.byId("divDirectionContent").style.display = "none";
        } else {
            dojo.byId("divNewInfoDirectionsScroll").style.display = "block";
            dojo.byId("divInfoDirectionsScroll").style.display = "none";
            dojo.byId("divNewInfoDirectionsScroll").appendChild(dojo.byId("tblNewAddressSearch"));
        }
        lastPodSearchString = dojo.byId("txtPodAddress").value;

        dojo.connect(dojo.byId("txtPodAddress"), "onkeyup", function (evt) {
            searchAddressViaPod = true;

            if (evt) {
                var keyCode = evt.keyCode;
                if (keyCode === 8) { // To handle backspace
                    resultFound = false;
                }
                if (keyCode === 27) {
                    RemoveChildren(dojo.byId("tblPodAddressResults"));
                    RemoveScrollBar(dojo.byId("divPodAddressScrollContainer"));
                    return;
                }

                if (evt.keyCode == dojo.keys.ENTER) {
                    if (dojo.byId("txtPodAddress").value != '') {
                        LocateAddress();
                        return;
                    }
                }

                //validations for auto complete search
                if ((!((evt.keyCode >= 46 && evt.keyCode < 58) || (evt.keyCode > 64 && evt.keyCode < 91) || (evt.keyCode > 95 && evt.keyCode < 106) || evt.keyCode === 8 || evt.keyCode === 110 || evt.keyCode === 188)) || (evt.keyCode === 86 && evt.ctrlKey) || (evt.keyCode === 88 && evt.ctrlKey)) {
                    evt = (evt) ? evt : event;
                    evt.cancelBubble = true;
                    if (evt.stopPropagation) {
                        evt.stopPropagation();
                    }
                    return;
                }

                if (dojo.byId("txtPodAddress").value.trim() !== "") {
                    if (lastPodSearchString !== dojo.byId("txtPodAddress").value.trim()) {
                        lastPodSearchString = dojo.byId("txtPodAddress").value.trim();
                        RemoveChildren(dojo.byId("tblPodAddressResults"));

                        // Clear any staged search
                        clearTimeout(stagedSearch);

                        if (dojo.byId("txtPodAddress").value.trim().length > 0) {
                            // Stage a new search, which will launch if no new searches show up
                            // before the timeout
                            stagedSearch = setTimeout(function () {
                                LocateAddress();
                            }, 500);
                        }
                    }
                } else {
                    lastPodSearchString = dojo.byId("txtPodAddress").value.trim();
                    dojo.byId("imgPodSearchLoader").style.display = "none";
                    RemoveChildren(dojo.byId("tblPodAddressResults"));
                    CreateScrollbar(dojo.byId("divPodAddressScrollContainer"), dojo.byId("divPodAddressScrollContent"));
                }
            }
        });

        dojo.connect(dojo.byId("txtPodAddress"), "onpaste", function () {
            searchAddressViaPod = true;
            setTimeout(function () {
                LocateAddress();
            }, 100);
        });

        dojo.connect(dojo.byId("txtPodAddress"), "oncut", function () {
            searchAddressViaPod = true;
            setTimeout(function () {
                LocateAddress();
            }, 100);
        });

        dojo.byId("imgPodSearchLocate").onclick = function () {
            searchAddressViaPod = true;
            if (dojo.byId("txtPodAddress").value.trim() === "") {
                alert(messages.getElementsByTagName("addressToLocate")[0].childNodes[0].nodeValue);
                return;
            }
            searchAddressViaPod = true;
            LocateAddress();
        };
    }
}

//Show print window

function ShowModal() {
    if (dojo.coords("divAppContainer").h > 0) {
        dojo.replaceClass("divAppContainer", "hideContainerHeight", "showContainerHeight");
        dojo.addClass(dojo.byId("divAppContainer"), "zeroHeight");
    }
    if (dojo.coords("divLayerContainer").h > 0) {
        dojo.replaceClass("divLayerContainer", "hideContainerHeight", "showContainerHeight");
        dojo.addClass(dojo.byId("divLayerContainer"), "zeroHeight");
    }
    printFlag = true;
    window.open("printMap.htm");
}

//Get current map extent

function GetPrintExtent() {
    return map.extent;
}

//Get current active URL

function GetLayerUrl() {
    var layers = [];
    for (var j = 0; j < map.layerIds.length; j++) {
        var layer = map.getLayer(map.layerIds[j]);
        layers.push(layer);
    }
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].visible) {
            return layers[i].url;
        }
    }
}

//Get current instance of graphics layer

function GetGraphicsLayer() {
    var tempGraphicsLayer = map.getLayer(tempGraphicsLayerId);
    return tempGraphicsLayer;
}

//Get current instance of feature layer

function GetFeatureLayer() {
    var featuresLayer = map.getLayer(devPlanLayerID);
    return featuresLayer.url;
}

//Get current instance of route layer

function GetRouteLayer() {
    var routeLayer = map.getLayer(routeLayerId);
    return routeLayer;
}

//Add graphic to a layer.

function AddGraphic(layer, symbol, point, attr) {
    if (attr) {
        var graphic = new esri.Graphic(point, symbol, attr, null);
    } else {
        var graphic = new esri.Graphic(point, symbol, null, null);
    }
    layer.add(graphic);
}

function GetDirectionsHeader() {
    return directionsHeaderArray;
}

//Get current instance of highlighted layer

function GetHighlightedPollLayer() {
    var highlightedLayer = map.getLayer(highlightLayerId);
    return highlightedLayer;
}

//Clear default value

function ClearDefaultText(e) {
    var target = window.event ? window.event.srcElement : e ? e.target : null;
    if (!target) {
        return;
    }

    resultFound = false;

    if (dojo.byId("divDirections").style.display === "block") {
        ResetTagetValueToBlank(target, "defaultAddressPodTitle");
    }

    if (dojo.byId("tdSearchFeature").className === "tdSearchByFeature") {
        ResetTagetValueToBlank(target, "defaultFeatureTitle");
    } else {
        ResetTagetValueToBlank(target, "defaultAddressTitle");
    }
}

function ResetTagetValueToBlank(target, title) {
    target.value = "";
    dojo.addClass(target, "colorChange");
}

//Set default value

function ReplaceDefaultText(e) {
    var target = window.event ? window.event.srcElement : e ? e.target : null;
    if (!target) {
        return;
    }

    if (target.id === "txtPodAddress") {
        if (dojo.byId("divDirectionSearchContent").style.display === "block") {
            ResetTargetValue(target, "defaultAddress");
        }
    }
    if (dojo.byId("tdSearchFeature").className === "tdSearchByFeature") {
        ResetTargetValue(target, "defaultFeatureName");
    } else {
        ResetTargetValue(target, "defaultAddress");
    }
}

function ResetTargetValue(target, title) {
    if (target.value === "" && target.getAttribute(title)) {
        target.value = target.title;
        if (target.title === "") {
            target.value = target.getAttribute(title);
        }
    }
    if (dojo.hasClass(target, "colorChange")) {
        dojo.removeClass(target, "colorChange");
    }
    dojo.addClass(target, "onBlurColorChange");
    lastSearchString = dojo.byId("txtAddress").value.trim();
}
