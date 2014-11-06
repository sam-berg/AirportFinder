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
dojo.require("esri.map");
dojo.require("esri.tasks.geometry");
dojo.require("esri.layers.FeatureLayer");
dojo.require("esri.tasks.locator");
dojo.require("dojo.date.locale");
dojo.require("dojox.mobile");
dojo.require("js.Config");
dojo.require("dojo.window");
dojo.require("js.date");
dojo.require("dojo.number");
dojo.require("js.InfoWindow");
dojo.require("esri.tasks.route");

var baseMapLayers; //Variable to store base map layers
var devPlanLayerURL; //Variable to store Feature layer URL
var commentLayer; //Variable to store feature comments layer URL
var referenceOverlayLayer; //Variable to store Reference Overlay Layer
var geometryService; //Variable to store Geometry Service

var formatDateAs; //variable to store the date format
var fontSize; //Variable to store font sizes for all devices
var showNullValueAs; //Variable to store default value for replacing null values

var infoActivity; //variable to store the activities for a feature
var infoBoxWidth; //variable to store the width of the carousel pod
var infoWindowContent; //variable to store content for info window
var infoPopupFieldsCollection; //variable to store info window fields
var infoWindowHeader; //variable to store info window header title
var infoWindowHeight; //variable to store info window height
var infoWindowWidth; //variable to store info window width

var isBrowser = false; //This variable is set to true when the app is running on desktop browsers
var isiOS = false; //This variable is set to true when the app is running on iPhone or iPad
var isMobileDevice = false; //This variable is set to true when the app is running on mobile device
var isTablet = false; //This variable is set to true when the app is running on tablets
var isAndroid = false;

var map; //variable to store map object
var mapPoint; //variable to store map point

var mapSharingOptions; //variable for storing the tiny service URL
var messages; //Variable to store the error messages

var devPlanLayerID = "devPlanLayerID"; //variable to store feature layer ID
var commentsLayerId = "commentsLayerId"; //variable to store feature comments layer ID
var tempGraphicsLayerId = "tempGraphicsLayerID"; //variable to store graphics layer ID
var highlightLayerId = "highlightLayerId"; //Graphics layer object for displaying selected feature
var routeLayerId = "routeLayerId"; //variable to store graphics layer ID for routing

var selectedGraphic; // variable to store selected map point

var tempBufferLayer = "tempBufferLayer"; // variable to store Graphics layer object
var bufferDistance; //variable to store distance for drawing the buffer

var rendererColor; //variable to store buffer color
var order; //variable to store sequence of info pods
var routeTask; //variable to store object for route task
var routeSymbol; //variable to store object for route symbol
var locatorRippleSize; //variable to store locator ripple size

var featureName; //variable to store feature name object
var selectedFeature; //variable to store selected feature
var isFeatureSearched = false; //flag set true/false for the feature searched
var searchedFeature; //variable to store searched feature

var searchAddressViaPod = false; //flag set true if the address is searched through pods in the bottom panel
var loadingIndicatorCounter = 0;

var handlers = []; //Array to hold handlers
var handlersPod = []; //Array to hold handlers pod

var directionsHeaderArray = []; //Array to hold directions in header
var getDirections; // master variable for directions
var resultFound = false;
var printFlag = false; //flag set true to enable printing
var loadingAttachmentsImg = "images/imgAttachmentLoader.gif"; //variable to store the path of attachment loader image

var nameAttribute;
var locatorSettings; //variable to store locator settings

var getDirectionsMobile; //flag to enable/disable directions for Mobile/tablet
var getDirectionsDesktop; //flag to enable/disable directions for desktop

var foreignKeyforComments; //variable to store  foreign key attribute for comments
var facilityId; //variable to store primary key for feature layer

var commentsInfoPopupFieldsCollection; //variable to store fields for adding and displaying comment
var databaseFields; // Define the database field names


var lastSearchString; //variable for store the last search string
var stagedSearch; //variable for store the time limit for search
var lastSearchTime; //variable for store the time of last search
var zoomLevel;
var countySearch;

var themeCSS; //variable to store the current theme classes
var approximateValue;

var applicationName; //variable to store name of the application
var shortcutIcon; //variable to store Favicon object
var appleTouchIcon; //variable to store Apple touch icon object
var androidTouchIcon; //variable to store Android touch icon object

//This initialization function is called when the DOM elements are ready

function Init() {

    esri.config.defaults.io.proxyUrl = "proxy.ashx"; //relative path
    esriConfig.defaults.io.alwaysUseProxy = false;
    esriConfig.defaults.io.timeout = 180000; // milliseconds

    var userAgent = window.navigator.userAgent;
    if (userAgent.indexOf("iPhone") >= 0 || userAgent.indexOf("iPad") >= 0) {
        isiOS = true;
        dojo.addClass(dojo.byId("divAddressPodPlaceHolder"), "divRadiusPodPlaceHolder");
    }
    if ((userAgent.indexOf("Android") >= 0 && userAgent.indexOf("Mobile") >= 0) || userAgent.indexOf("iPhone") >= 0) {
        fontSize = 15;
        isMobileDevice = true;
        dojo.byId("dynamicStyleSheet").href = "styles/mobile.css";
    } else if ((userAgent.indexOf("iPad") >= 0) || (userAgent.indexOf("Android") >= 0)) {
        isAndroid = navigator.userAgent.indexOf("Android") >= 0;
        fontSize = 14;
        isTablet = true;
        dojo.byId("dynamicStyleSheet").href = "styles/tablet.css";
    } else {
        fontSize = 11;
        isBrowser = true;
        dojo.byId("dynamicStyleSheet").href = "styles/browser.css";
    }
    dojo.byId("divSplashContent").style.fontSize = fontSize + "px";

    var responseObject = new js.Config();
    shortcutIcon = document.createElement("link");
    shortcutIcon.rel = "shortcut icon";
    shortcutIcon.type = "image/x-icon";
    shortcutIcon.href = responseObject.ApplicationFavicon;
    document.getElementsByTagName('head')[0].appendChild(shortcutIcon);

    if (isMobileDevice || isTablet) {
        appleTouchIcon = document.createElement("link");
        appleTouchIcon.rel = "apple-touch-icon-precomposed";
        appleTouchIcon.type = "image/x-icon";
        appleTouchIcon.href = responseObject.ApplicationIcon;
        document.getElementsByTagName('head')[0].appendChild(appleTouchIcon);

        androidTouchIcon = document.createElement("link");
        androidTouchIcon.rel = "apple-touch-icon";
        androidTouchIcon.type = "image/x-icon";
        androidTouchIcon.href = responseObject.ApplicationIcon;
        document.getElementsByTagName('head')[0].appendChild(androidTouchIcon);
    }
    applicationName = dojo.byId("lblAppName").innerHTML = responseObject.ApplicationName;
    document.title = responseObject.ApplicationName;
    var requireObject = "dojo/text!./" + responseObject.ApplicationTheme;
    require([requireObject], function (cssTemplete) {

        var themeObj = document.createElement("style"),
            style = cssTemplete;
        head = document.getElementsByTagName("head")[0];
        themeObj.href = responseObject.ApplicationTheme;
        themeObj.type = "text/css";
        themeObj.id = "Theme";
        if (themeObj.styleSheet) {

            themeObj.styleSheet.cssText = style;
        } else {
            themeObj.appendChild(document.createTextNode(style));
        }
        head.appendChild(themeObj);
        if (dojo.isIE < 9) {
            themeCSS = themeObj.styleSheet.rules;
        } else {
            themeCSS = themeObj.sheet.cssRules;
        }
        var image;

        for (var i = 0; i < themeCSS.length; i++) {
            if (themeCSS[i].selectorText == ".mainLoader") {
                image = themeCSS[i].style.backgroundImage;
                break;
            }
        }
        image = image.split('(')[1];
        image = image.split(')')[0];

        if (!dojo.isChrome && !(dojo.isIE < 9) && isBrowser && !dojo.isSafari) {
            image = image.split('"')[1];
            image = image.split('./')[1];
        } else if (dojo.isIE < 9) {
            image = image.split('./')[1];
            AddCSSClass();
        }
        dojo.byId("mainLoader").src = image;
        dojo.byId("imgPodSearchLoader").src = image;
        dojo.byId("imgSearchLoader").src = image;

        dojo.connect(dojo.byId("txtAddress"), "onpaste", function () {
            CutAndPasteTimeout();
        });

        dojo.connect(dojo.byId("txtAddress"), "oncut", function () {
            CutAndPasteTimeout();
        });
        dojo.connect(dojo.byId("txtAddress"), "onkeyup", function (evt) {
            searchAddressViaPod = false;
            if (evt) {
                var keyCode = evt.keyCode;
                if (keyCode === 8) { // To handle backspace
                    resultFound = false;
                }
                if (keyCode === 27) {
                    RemoveChildren(dojo.byId("tblAddressResults"));
                    RemoveScrollBar(dojo.byId("divAddressScrollContainer"));
                    return;
                }

                if (evt.keyCode == dojo.keys.ENTER) {
                    if (dojo.byId("txtAddress").value != '') {
                        LocateFeatureAndAddress();
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
                if (dojo.coords("divAddressContent").h > 0) {
                    if (dojo.byId("txtAddress").value.trim() !== "") {
                        if (lastSearchString !== dojo.byId("txtAddress").value.trim()) {
                            lastSearchString = dojo.byId("txtAddress").value.trim();
                            RemoveChildren(dojo.byId("tblAddressResults"));

                            // Clear any staged search
                            clearTimeout(stagedSearch);

                            if (dojo.byId("txtAddress").value.trim().length > 0) {
                                // Stage a new search, which will launch if no new searches show up
                                // before the timeout
                                stagedSearch = setTimeout(function () {
                                    LocateFeatureAndAddress();
                                }, 500);
                            }
                        }
                    } else {
                        lastSearchString = dojo.byId("txtAddress").value.trim();
                        dojo.byId("imgSearchLoader").style.display = "none";
                        RemoveChildren(dojo.byId("tblAddressResults"));
                        CreateScrollbar(dojo.byId("divAddressScrollContainer"), dojo.byId("divAddressScrollContent"));
                    }
                }
            }
        });


        dojo.connect(dojo.byId("imgLocate"), "onclick", function () {
            searchAddressViaPod = false;
            if (dojo.hasClass(dojo.byId("tdSearchAddress"), "tdSearchByAddress")) {
                if (dojo.byId("txtAddress").value.trim() === "") {
                    alert(messages.getElementsByTagName("addressToLocate")[0].childNodes[0].nodeValue);
                    return;
                }
                LocateAddress();
            } else if (dojo.hasClass(dojo.byId("tdSearchFeature"), "tdSearchByFeature")) {
                resultFound = false;
                if (dojo.byId("txtAddress").value.trim() === "") {
                    alert(messages.getElementsByTagName("featureToLocate")[0].childNodes[0].nodeValue);
                    return;
                }
                LocateFeaturebyName();
            } else if (dojo.hasClass(dojo.byId("tdSearchActivity"), "tdSearchByActivity")) {
                LocateFeaturebyActivity();
            }
        });

        if (!Modernizr.geolocation) {
            dojo.byId("tdGeolocation").style.display = "none";
        }

        Initialize(responseObject);
    });
}

function LocateFeatureAndAddress() {
    if (dojo.byId("tdSearchAddress").className === "tdSearchByAddress") {
        LocateAddress();
    } else if (dojo.byId("tdSearchFeature").className === "tdSearchByFeature") {
        LocateFeaturebyName();
    }
}

function CutAndPasteTimeout() {
    searchAddressViaPod = false;
    setTimeout(function () {
        LocateFeatureAndAddress();
    }, 100);
}

function AddCSSClass() {
    if (dojo.hasClass(dojo.byId("tdSearchAddress"), "tdSearchByAddress")) {
        dojo.removeClass(dojo.byId("tdSearchAddress"), "tdSearchByAddress");
    }
    if (dojo.hasClass(dojo.byId("tdSearchFeature"), "tdSearchByUnSelectedFeature")) {
        dojo.removeClass(dojo.byId("tdSearchFeature"), "tdSearchByUnSelectedFeature");
    }
    if (dojo.hasClass(dojo.byId("tdSearchActivity"), "tdSearchByUnSelectedActivity")) {
        dojo.removeClass(dojo.byId("tdSearchActivity"), "tdSearchByUnSelectedActivity");
    }
    if (dojo.hasClass(dojo.byId("txtAddress"), "txtAddress")) {
        dojo.removeClass(dojo.byId("txtAddress"), "txtAddress");
    }
    if (dojo.hasClass(dojo.byId("txtPodAddress"), "txtPodAddress")) {
        dojo.removeClass(dojo.byId("txtPodAddress"), "txtPodAddress");
    }
    if (dojo.hasClass(dojo.byId("divAddressPodPlaceHolder"), "divAddressPodPlaceHolder")) {
        dojo.removeClass(dojo.byId("divAddressPodPlaceHolder"), "divAddressPodPlaceHolder");
    }
    if (dojo.hasClass(dojo.byId("divCarouselContentInfo"), "transparentBackground")) {
        dojo.removeClass(dojo.byId("divCarouselContentInfo"), "transparentBackground");
    }
    if (dojo.hasClass(dojo.byId("divSearchHeader"), "divHeader")) {
        dojo.removeClass(dojo.byId("divSearchHeader"), "divHeader");
    }
    if (dojo.hasClass(dojo.byId("divPodContentStyle"), "divContentStyle")) {
        dojo.removeClass(dojo.byId("divPodContentStyle"), "divContentStyle");
    }
    if (dojo.hasClass(dojo.byId("divImageBackground"), "divImageBackground")) {
        dojo.removeClass(dojo.byId("divImageBackground"), "divImageBackground");
    }
    if (dojo.hasClass(dojo.byId("divApplicationHeader"), "divApplicationHeader")) {
        dojo.removeClass(dojo.byId("divApplicationHeader"), "divApplicationHeader");
    }
    if (dojo.hasClass(dojo.byId("divAppHolder"), "divAppHolder")) {
        dojo.removeClass(dojo.byId("divAppHolder"), "divAppHolder");
    }
    dojo.addClass(dojo.byId("tdSearchAddress"), "tdSearchByAddress");
    dojo.addClass(dojo.byId("tdSearchFeature"), "tdSearchByUnSelectedFeature");
    dojo.addClass(dojo.byId("tdSearchActivity"), "tdSearchByUnSelectedActivity");
    dojo.addClass(dojo.byId("txtAddress"), "txtAddress");
    dojo.addClass(dojo.byId("txtPodAddress"), "txtPodAddress");
    dojo.addClass(dojo.byId("divAddressPodPlaceHolder"), "divAddressPodPlaceHolder");
    dojo.addClass(dojo.byId("divCarouselContentInfo"), "transparentBackground");
    dojo.addClass(dojo.byId("divSearchHeader"), "divHeader");
    dojo.addClass(dojo.byId("divPodContentStyle"), "divContentStyle");
    dojo.addClass(dojo.byId("divImageBackground"), "divImageBackground");
    dojo.addClass(dojo.byId("divApplicationHeader"), "divApplicationHeader");
    dojo.addClass(dojo.byId("divAppHolder"), "divAppHolder");
}

//this function is called to load the configurable parameters

function Initialize(responseObject) {

    var infoWindow = new js.InfoWindow({
        domNode: dojo.create("div", null, dojo.byId("map"))
    });
    if (isMobileDevice) {
        dojo.byId("divInfoContainer").style.display = "none";
        dojo.removeClass(dojo.byId("divInfoContainer"), "opacityHideAnimation");
        dojo.byId("divResults").style.display = "none";
        dojo.removeClass(dojo.byId("divResults"), "opacityHideAnimation");
        dojo.replaceClass("divAddressHolder", "hideContainer", "hideContainerHeight");
        dojo.byId("divAddressContainer").style.display = "none";
        dojo.removeClass(dojo.byId("divAddressContainer"), "hideContainerHeight");
        dojo.addClass(dojo.byId("divSplashScreenContent"), "splashScreenSize");
        dojo.byId("divLogo").style.display = "none";
        dojo.byId("lblAppName").style.display = "none";
        dojo.addClass(dojo.byId("lblAppName"), "lblAppName");
        dojo.byId("divToggle").style.display = "none";
    } else {
        dojo.byId("imgDirections").style.display = "none";
        dojo.byId("imgList").style.display = "none";
        var imgBasemap = document.createElement("img");
        imgBasemap.src = "images/imgBaseMap.png";
        imgBasemap.className = "imgOptions";
        imgBasemap.title = "Switch Basemap";
        imgBasemap.id = "imgBaseMap";
        imgBasemap.style.cursor = "pointer";
        imgBasemap.onclick = function () {
            ShowBaseMaps();
        };
        dojo.byId("tdBaseMap").appendChild(imgBasemap);
        dojo.byId("tdBaseMap").className = "tdHeader";
        dojo.addClass(dojo.byId("divSplashScreenContent"), "splashScreenContentSize");
        dojo.byId("divAddressContainer").style.display = "block";
        dojo.byId("divLogo").style.display = "block";
        dojo.byId("imgMblNextImg").style.display = "none";
        dojo.byId("imgMblPrevImg").style.display = "none";
    }

    locatorSettings = responseObject.LocatorSettings;
    zoomLevel = responseObject.ZoomLevel;
    devPlanLayerURL = responseObject.FacilityLayer;
    infoBoxWidth = responseObject.InfoBoxWidth;
    dojo.byId("imgApp").src = responseObject.ApplicationIcon;


    dojo.byId("divSplashContent").innerHTML = responseObject.SplashScreen.Message;

    dojo.xhrGet({
        url: "ErrorMessages.xml",
        handleAs: "xml",
        preventCache: true,
        load: function (xmlResponse) {
            messages = xmlResponse;
            var baseMapURLCount=0;
            for (var i = 0; i < baseMapLayers.length; i++) {
                if (baseMapLayers[i].MapURL) {
                    baseMapURLCount++;
                }
            }
            if (baseMapURLCount == 0) {
                alert(messages.getElementsByTagName("noBaseMapURL")[0].childNodes[0].nodeValue);
                HideProgressIndicator();
            }
        }
    });

    map = new esri.Map("map", {
        slider: true,
        infoWindow: infoWindow
    });

    dojo.connect(map, "onLoad", function () {
        map.disableKeyboardNavigation();
        routeParams = new esri.tasks.RouteParameters();
        routeParams.stops = new esri.tasks.FeatureSet();
        routeParams.returnRoutes = false;
        routeParams.returnDirections = true;
        routeParams.directionsLengthUnits = esri.Units.MILES;
        routeParams.outSpatialReference = map.spatialReference;
        var zoomExtent;
        var extent = GetQuerystring("extent");
        if (extent !== "") {
            zoomExtent = extent.split(",");
        } else {
            zoomExtent = responseObject.DefaultExtent.split(",");
        }
        var startExtent = new esri.geometry.Extent(parseFloat(zoomExtent[0]), parseFloat(zoomExtent[1]), parseFloat(zoomExtent[2]), parseFloat(zoomExtent[3]), map.spatialReference);

        map.setExtent(startExtent);
        dojo.create("div", {
            className: "esriSimpleSliderHomeButton",
            onclick: function () {
                map.setExtent(startExtent);
            }
        }, dojo.query(".esriSimpleSliderIncrementButton")[0], "after");
        MapInitFunction(responseObject.SplashScreen.isVisible);
    });
    ShowProgressIndicator();

    geometryService = new esri.tasks.GeometryService(responseObject.GeometryService);
    commentsInfoPopupFieldsCollection = responseObject.CommentsInfoPopupFieldsCollection;
    databaseFields = responseObject.DatabaseFields;
    getDirectionsMobile = responseObject.GetDirectionsMobile;
    getDirectionsDesktop = responseObject.GetDirectionsDesktop;
    baseMapLayers = responseObject.BaseMapLayers;
    mapSharingOptions = responseObject.MapSharingOptions;
    formatDateAs = responseObject.FormatDateAs;
    showNullValueAs = responseObject.ShowNullValueAs;
    infoActivity = responseObject.Activities;
    infoWindowHeader = responseObject.InfoWindowHeader;
    infoWindowContent = responseObject.InfoWindowContent;
    infoPopupFieldsCollection = responseObject.InfoPopupFieldsCollection;
    infoWindowHeight = responseObject.InfoPopupHeight;
    infoWindowWidth = responseObject.InfoPopupWidth;
    commentLayer = responseObject.CommentsLayer;
    facilityId = responseObject.PrimaryKeyForFeatures;
    foreignKeyforComments = responseObject.ForeignKeyforComments;
    bufferDistance = responseObject.BufferDistance;
    textForGeoLocation = responseObject.TextForGeoLocation;
    order = responseObject.Order;
    routeTask = new esri.tasks.RouteTask(responseObject.RouteServiceURL);
    dojo.connect(routeTask, "onSolveComplete", ShowRoute);
    dojo.connect(routeTask, "onError", ErrorHandler);
    routeSymbol = new esri.symbol.SimpleLineSymbol().setColor(responseObject.RouteColor).setWidth(responseObject.RouteWidth);
    featureName = responseObject.FeatureName;
    locatorRippleSize = responseObject.LocatorRippleSize;
    getDirections = responseObject.GetDirections;
    referenceOverlayLayer = responseObject.ReferenceOverlayLayer;
    approximateValue = responseObject.ApproximateValue;
    if (isTablet) {
        dojo.addClass(dojo.byId("tdPreviousImg"), "tdPreviousImg");
        dojo.addClass(dojo.byId("tdNextImg"), "tdNextImg");
    }
    featureName.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g, function (match, key) {
        nameAttribute = key;
    });
    dojo.byId("tdSearchAddress").innerHTML = locatorSettings.Locators[0].DisplayText;
    dojo.byId("tdSearchFeature").innerHTML = locatorSettings.Locators[1].DisplayText;
    dojo.byId("tdSearchActivity").innerHTML = locatorSettings.Locators[2].DisplayText;

    esri.addProxyRule({proxyUrl: esri.config.defaults.io.proxyUrl, urlPrefix: commentLayer.URL});
    esri.addProxyRule({proxyUrl: esri.config.defaults.io.proxyUrl, urlPrefix: responseObject.RouteServiceURL});

    var trCarousel = dojo.byId("tblCarousel").insertRow(0);
    for (var i in order) {
        dojo.query("[type=" + order[i] + "]").forEach(function (node) {
            var tdCarousel = trCarousel.insertCell(i);
            if (order[i] === "photogallery") {
                tdCarousel.id = "tdPhotoGallery";
            }
            if (order[i] === "directions") {
                tdCarousel.id = "tdDirectionsPod";
                if (!getDirections) {
                    tdCarousel.style.display = "none";
                }
            }
            if (order[i] === "comments") {
                tdCarousel.id = "tdCommentsPod";
                if (!commentLayer.Visibility) {
                    dojo.byId("divComments").style.display = "none";
                }
            }
            tdCarousel.appendChild(node);
            node.style.width = infoBoxWidth + "px";
        });
    }

    CreateBaseMapComponent();



    if (!isMobileDevice) {
        TouchEvent();
    } else {
        TouchImage();
    }


    dojo.connect(map, "onExtentChange", function () {
        SetMapTipPosition();
        if (dojo.coords("divAppContainer").h > 0) {
            ShareLink(false);
        }
    });

    dojo.byId("txtAddress").setAttribute("defaultAddress", locatorSettings.Locators[0].LocatorDefaultAddress);
    dojo.byId("txtAddress").value = locatorSettings.Locators[0].LocatorDefaultAddress;
    lastSearchString = dojo.byId("txtAddress").value.trim();
    dojo.byId("txtAddress").setAttribute("defaultAddressTitle", locatorSettings.Locators[0].LocatorDefaultAddress);
    dojo.addClass(dojo.byId("txtAddress"), "onBlurColorChange");

    dojo.byId("txtAddress").setAttribute("defaultFeatureName", locatorSettings.Locators[1].LocatorDefaultFeature);
    dojo.byId("txtAddress").setAttribute("defaultFeatureTitle", locatorSettings.Locators[1].LocatorDefaultFeature);

    dojo.byId("txtPodAddress").value = locatorSettings.Locators[0].LocatorDefaultAddress;
    lastPodSearchString = dojo.byId("txtPodAddress").value;
    dojo.addClass(dojo.byId("txtPodAddress"), "onBlurColorChange");
    dojo.byId("txtPodAddress").setAttribute("defaultAddress", locatorSettings.Locators[0].LocatorDefaultAddress);
    dojo.byId("txtPodAddress").setAttribute("defaultAddressPodTitle", locatorSettings.Locators[0].LocatorDefaultAddress);

    dojo.connect(dojo.byId("txtAddress"), "ondblclick", ClearDefaultText);
    dojo.connect(dojo.byId("txtAddress"), "onblur", ReplaceDefaultText);
    dojo.connect(dojo.byId("txtAddress"), "onfocus", function () {
        dojo.addClass(this, "colorChange");
        if ((dojo.coords("divAddressHolder").h > 0) && isAndroid && isTablet && window.matchMedia("(orientation: landscape)").matches) {
            WipeOutResults();
        }
    });

    dojo.connect(dojo.byId("txtPodAddress"), "ondblclick", ClearDefaultText);
    dojo.connect(dojo.byId("txtPodAddress"), "onblur", ReplaceDefaultText);
    dojo.connect(dojo.byId("txtPodAddress"), "onfocus", function () {
        dojo.addClass(this, "colorChange");
    });

    dojo.connect(dojo.byId("imgHelp"), "onclick", function () {
        window.open(responseObject.HelpURL);
    });
}

//Function to create graphics and feature layer

function MapInitFunction(splashScreenVisibility) {
    if (dojo.query(".logo-med", dojo.byId("map")).length > 0) {
        dojo.query(".esriControlsBR", dojo.byId("map"))[0].id = "imgesriLogo";
    } else if (dojo.query(".logo-sm", dojo.byId("map")).length > 0) {
        dojo.query(".esriControlsBR", dojo.byId("map"))[0].id = "imgesriLogo";
    }

    dojo.addClass("imgesriLogo", "esriLogo");

    dojo.connect(map, "onPanEnd", function () {
        if (printFlag) {
            map.setLevel(currentLevel + 1);
            setTimeout(function () {
                map.setLevel(currentLevel);
            }, 100);
            printFlag = false;
        }
    });

    dojo.connect(map, "onPanStart", function () {
        if (printFlag) {
            currentLevel = map.getLevel();
        }
    });


    if (referenceOverlayLayer.DisplayOnLoad && referenceOverlayLayer.ServiceUrl) {
        var layerType = referenceOverlayLayer.ServiceUrl.substring(((referenceOverlayLayer.ServiceUrl.lastIndexOf("/")) + 1), (referenceOverlayLayer.ServiceUrl.length));
        if (!isNaN(layerType) && (layerType != "")) {
            var overlaymap = new esri.layers.FeatureLayer(referenceOverlayLayer.ServiceUrl, {
                mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
                outFields: ["*"]
            });
            overlaymap.setMaxAllowableOffset(10)
            map.addLayer(overlaymap);

        } else {
            var url1 = referenceOverlayLayer.ServiceUrl + "?f=json";
            esri.request({
                url: url1,
                handleAs: "json",
                load: function (data) {
                    if (!data.tileInfo) {
                        var imageParameters = new esri.layers.ImageParameters();
                        //Takes a URL to a non cached map service.
                        var overlaymap = new esri.layers.ArcGISDynamicMapServiceLayer(referenceOverlayLayer.ServiceUrl, {
                            "imageParameters": imageParameters
                        });
                        map.addLayer(overlaymap);

                    } else {
                        var overlaymap = new esri.layers.ArcGISTiledMapServiceLayer(referenceOverlayLayer.ServiceUrl);
                        map.addLayer(overlaymap);
                    }
                },
                error: function (err) {
                    alert(messages.getElementsByTagName("referenceOverlayError")[0].childNodes[0].nodeValue);
                }
            });
        }
    }

    var graphicLayer = new esri.layers.GraphicsLayer();
    graphicLayer.id = tempBufferLayer;
    map.addLayer(graphicLayer);

    gLayer = new esri.layers.GraphicsLayer();
    gLayer.id = highlightLayerId;
    map.addLayer(gLayer);

    var routeLayer = new esri.layers.GraphicsLayer();
    routeLayer.id = routeLayerId;
    map.addLayer(routeLayer);
    if (devPlanLayerURL) {
        var devPlanLayer = new esri.layers.FeatureLayer(devPlanLayerURL, {
            mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
            outFields: ["*"],
            id: devPlanLayerID
        });
        map.addLayer(devPlanLayer);

        var facilityID;
        facilityId.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g, function (match, key) {
            facilityID = key;
        });

        var handle = dojo.connect(devPlanLayer, "onUpdateEnd", function () {
            HideProgressIndicator();
            dojo.disconnect(handle);
            var featureId = GetQuerystring("selectedFeatureID");
            if (featureId !== "") {
                var query = new esri.tasks.Query();
                query.where = facilityID + "= '" + featureId + "'";
                devPlanLayer.queryFeatures(query, function (results) {
                    if (results.features.length > 0) {
                        setTimeout(function () {
                            searchFlag = true;
                            addressFlag = false;
                            defaultFeature = results.features[0];
                            selectedFeature = results.features[0].geometry;
                            ExecuteQueryForFeatures(results, null, null, true);
                        }, 500);
                    }
                });
            }
        });

        dojo.connect(devPlanLayer, "onClick", function (evtArgs) {
            searchFlag = false;
            selectedFeature = evtArgs.graphic.geometry;
            isFeatureSearched = false;
            selectedGraphic = null;
            map.infoWindow.hide();
            ShowFeatureInfoDetails(evtArgs.graphic.geometry, evtArgs.graphic.attributes);
            evtArgs = (evtArgs) ? evtArgs : event;
            evtArgs.cancelBubble = true;
            if (evtArgs.stopPropagation) {
                evtArgs.stopPropagation();
            }
        });
    }
    else {
        alert(messages.getElementsByTagName("missingFacilityLayerURL")[0].childNodes[0].nodeValue);
    }
    if (commentLayer.Visibility) {
        var commentsLayer = new esri.layers.FeatureLayer(commentLayer.URL, {
            mode: esri.layers.FeatureLayer.MODE_SELECTION,
            outFields: ["*"],
            id: commentsLayerId
        });
        map.addLayer(commentsLayer);
    } else {
        dojo.byId("imgComments").style.display = "none";
    }
    var gLayer = new esri.layers.GraphicsLayer();
    gLayer.id = tempGraphicsLayerId;
    map.addLayer(gLayer);

    if (splashScreenVisibility) {
        dojo.byId("divSplashScreenContainer").style.display = "block";
        dojo.replaceClass("divSplashScreenContent", "showContainer", "hideContainer");
        SetHeightSplashScreen();
    } else {
        dojo.byId("divSplashScreenContainer").style.display = "none";
    }
    CreateRatingWidget(dojo.byId("commentRating"));

    if (!isMobileDevice) {
        window.onresize = function () {
            resizeHandler();
            ResetSlideControls();
        };
    } else {
        window.onresize = function () {
            OrientationChanged();
        };
        SetHeightAddressResults();
    }
    HideProgressIndicator();
}
dojo.addOnLoad(Init);
