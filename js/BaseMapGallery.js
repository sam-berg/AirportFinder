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
//Create base-map components
function CreateBaseMapComponent() {
    var baseMapURL = 0;
    var baseMapURLCount = 0;
    for (var i = 0; i < baseMapLayers.length; i++) {
        if (baseMapLayers[i].MapURL) {
            map.addLayer(CreateBaseMapLayer(baseMapLayers[i].MapURL, baseMapLayers[i].Key, (i === 0) ? true : false));
            if (baseMapURLCount == 0) {
                baseMapURL = i;
            }
            baseMapURLCount++;
        }
    }

    var layerList = dojo.byId("layerList");

    for (var i = 0; i < Math.ceil(baseMapLayers.length / 2); i++) {
        if (baseMapLayers[(i * 2) + 0] && baseMapLayers[(i * 2) + 0].MapURL) {
            var layerInfo = baseMapLayers[(i * 2) + 0];
            layerList.appendChild(CreateBaseMapElement(layerInfo));
        }
        if (baseMapLayers[(i * 2) + 1] && baseMapLayers[(i * 2) + 1].MapURL) {
            var layerInfo = baseMapLayers[(i * 2) + 1];
            layerList.appendChild(CreateBaseMapElement(layerInfo));
        }
    }

 if (baseMapURLCount >= 1) {
     dojo.addClass(dojo.byId("imgThumbNail" + baseMapLayers[baseMapURL].Key), "selectedBaseMap");
     map.getLayer(baseMapLayers[baseMapURL].Key).show();
    }
}

//Create elements to toggle the maps
function CreateBaseMapElement(baseMapLayerInfo) {
    var divContainer = document.createElement("div");
    divContainer.className = "baseMapContainerNode";
    var imgThumbnail = document.createElement("img");
    imgThumbnail.src = baseMapLayerInfo.ThumbnailSource;
    imgThumbnail.className = "basemapThumbnail";
    imgThumbnail.id = "imgThumbNail" + baseMapLayerInfo.Key;
    imgThumbnail.setAttribute("layerId", baseMapLayerInfo.Key);
    imgThumbnail.onclick = function () {
        ChangeBaseMap(this);
        ShowBaseMaps();
    };
    var spanBaseMapText = document.createElement("span");
    spanBaseMapText.id = "spanBaseMapText" + baseMapLayerInfo.Key;
    spanBaseMapText.className = "basemapLabel";
    spanBaseMapText.innerHTML = baseMapLayerInfo.Name;
    divContainer.appendChild(imgThumbnail);
    divContainer.appendChild(spanBaseMapText);
    return divContainer;
}

//Toggle Basemap
function ChangeBaseMap(spanControl) {
    HideMapLayers();
    var key = spanControl.getAttribute("layerId");

    for (var i = 0; i < baseMapLayers.length; i++) {
        if (baseMapLayers[i].MapURL) {
            dojo.removeClass(dojo.byId("imgThumbNail" + baseMapLayers[i].Key), "selectedBaseMap");
            if (dojo.isIE) {
                dojo.addClass(dojo.byId("imgThumbNail" + baseMapLayers[i].Key), "thumbNailStyle");
                dojo.addClass(dojo.byId("spanBaseMapText" + baseMapLayers[i].Key), "spanBaseMapTextStyle");
            }
            if (baseMapLayers[i].Key === key) {
                dojo.addClass(dojo.byId("imgThumbNail" + baseMapLayers[i].Key), "selectedBaseMap");
                var layer = map.getLayer(baseMapLayers[i].Key);
                layer.show();
            }
        }
    }
}

//Create layer on map
function CreateBaseMapLayer(layerURL, layerId, isVisible) {
    var layer = new esri.layers.ArcGISTiledMapServiceLayer(layerURL, { id: layerId, visible: isVisible });
    return layer;
}

function HideMapLayers() {
    for (var i = 0; i < baseMapLayers.length; i++) {
        if (baseMapLayers[i].MapURL) {
            var layer = map.getLayer(baseMapLayers[i].Key);
            if (layer) {
                layer.hide();
            }
        }
    }
}

//Animate base map panel with wipe-in and wipe-out animation
function ShowBaseMaps() {
    if (dojo.coords("divAppContainer").h > 0) {
        dojo.replaceClass("divAppContainer", "hideContainerHeight", "showContainerHeight");
        dojo.replaceClass(dojo.byId("divAppContainer"), "zeroHeight", "addressHolderHeight");
    }
    if (!isMobileDevice) {
        if (dojo.coords("divAddressHolder").h > 0) {
            dojo.replaceClass("divAddressHolder", "hideContainerHeight", "showContainerHeight");
            dojo.replaceClass(dojo.byId("divAddressHolder"), "zeroHeight", "addressHolderHeight");
        }
    }

    if (dojo.coords("divLayerContainer").h > 0) {
        dojo.replaceClass("divLayerContainer", "hideContainerHeight", "showContainerHeight");
        dojo.replaceClass(dojo.byId("divLayerContainer"), "zeroHeight", "addressHolderHeight");
    }
    else {
        dojo.byId("divLayerContainer").style.height = Math.ceil(baseMapLayers.length / 2) * (dojo.coords("divLayerHolder").h) + ((isTablet) ? 10 : 8) + "px";
        dojo.replaceClass("divLayerContainer", "showContainerHeight", "hideContainerHeight");
        dojo.replaceClass(dojo.byId("divLayerContainer"), "addressHolderHeight", "zeroHeight");
    }
}
