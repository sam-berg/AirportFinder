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
var hosizontalPosition = 0; //Scroll position of scrolling container
var newLeft = 0; //left position of the carousel content
var touchStart = false; //flag for setting the touch events

//Show animation for touch event
function TouchEvent() {
    dojo.connect(dojo.byId("divCarouselDataContainer"), "touchstart", function (e) {
        horizontalPosition = e.touches[0].pageX;
        touchStart = true;
    });

    dojo.connect(dojo.byId("divCarouselDataContainer"), "touchmove", function (e) {
        if (touchStart) {
            touchStart = false;
            var touch = e.touches[0];
            e.cancelBubble = true;
            if (e.stopPropagation) { e.stopPropagation(); }
            e.preventDefault();
            if (touch.pageX - horizontalPosition >= 2) {
                setTimeout(function () {
                    SlideLeft();
                }, 100);
            }
            if (horizontalPosition - touch.pageX >= 2) {
                setTimeout(function () {
                    SlideRight();
                }, 100);
            }
        }
    });

    dojo.connect(dojo.byId("divCarouselDataContainer"), "touchend", function () {
        horizontalPosition = 0;
        touchStart = false;
    });
}

//Show animation for touch event for images
function TouchImage() {
    dojo.connect(dojo.byId("divMblImage"), "touchstart", function (e) {

        horizontalPosition = e.touches[0].pageX;

        touchStart = true;
    });

    dojo.connect(dojo.byId("divMblImage"), "touchmove", function (e) {
        if (touchStart) {
            touchStart = false;
            var touch = e.touches[0];
            e.cancelBubble = true;
            if (e.stopPropagation) { e.stopPropagation(); }
            e.preventDefault();
            if (touch.pageX - horizontalPosition >= 2) {

                ShowProgressIndicator();
                setTimeout(function () {
                    ShowPreviousImg();
                }, 100);
            }
            if (horizontalPosition - touch.pageX >= 2) {
                ShowProgressIndicator();
                setTimeout(function () {
                    ShowNextImg();
                }, 100);
            }
        }
    });

    dojo.connect(dojo.byId("divMblImage"), "touchend", function () {
        horizontalPosition = 0;
        touchStart = false;
    });

}

//Display and hide bottom panel
function ShowHideResult(imgToggle) {
    if (dojo.byId("imgToggleResults").getAttribute("disable") === "true" || dojo.byId("imgToggleResults").getAttribute("disable") === true) {
        return;
    }
    if (imgToggle.getAttribute("state") === "minimized") {
        WipeInResults();   // maximize
    }
    else {
        WipeOutResults();  //minimize
    }
}

//Show bottom panel with wipe-in animation
function WipeInResults() {
    dojo.addClass(dojo.byId("divImageBackground"), "displayBlock");
    dojo.byId("imgToggleResults").setAttribute("state", "maximized");
    dojo.byId("imgToggleResults").title = "Hide Panel";
    dojo.replaceClass(dojo.byId("imgesriLogo"), "bottomPanelPosition", "zeroBottom");
    dojo.replaceClass(dojo.byId("divToggle"), "bottomPanelPosition", "zeroBottom");
    dojo.replaceClass(dojo.byId("divCarouselContent"), "bottomPanelHeight", "zeroHeight");
    dojo.replaceClass("divCarouselContent", "hideBottomContainer", "showBottomContainer");
    dojo.byId("imgToggleResults").src = "images/down.png";
}

//Hide bottom panel with wipe-out animation
function WipeOutResults() {
    dojo.byId("imgToggleResults").setAttribute("state", "minimized");
    dojo.byId("imgToggleResults").title = "Show Panel";
    dojo.replaceClass(dojo.byId("imgesriLogo"), "zeroBottom", "bottomPanelPosition");
    dojo.replaceClass(dojo.byId("divToggle"), "zeroBottom", "bottomPanelPosition");
    dojo.replaceClass(dojo.byId("divCarouselContent"), "zeroHeight", "bottomPanelHeight");
    dojo.replaceClass("divCarouselContent", "showBottomContainer", "hideBottomContainer");
    dojo.byId("imgToggleResults").src = "images/up.png";
}

//Slide carousel pods to right
function SlideRight() {
    difference = dojo.byId("divCarouselDataContainer").offsetWidth - dojo.byId("divCarouselDataContent").offsetWidth;
    if (newLeft > difference) {
        dojo.replaceClass(dojo.byId("divLeftArrow"), "displayBlock", "displayNone");
        dojo.replaceClass(dojo.byId("divLeftArrow"), "cursorPointer", "cursorDefault");
        newLeft = newLeft - (infoBoxWidth + 5);
        dojo.byId("divCarouselDataContent").style.left = newLeft + "px";
        dojo.addClass("divCarouselDataContent", "slidePanel");
        ResetSlideControls();
    }
}

//Slide carousel pods to left
function SlideLeft() {
    if (newLeft < 0) {
        if (newLeft > -(infoBoxWidth + 5)) {
            newLeft = 0;
        }
        else {
            newLeft = newLeft + (infoBoxWidth + 5);
        }
        if (newLeft >= -10) {
            newLeft = 0;
        }

        dojo.byId("divCarouselDataContent").style.left = (newLeft) + "px";
        dojo.addClass("divCarouselDataContent", "slidePanel");
        ResetSlideControls();
    }
}

//Reset slide controls
function ResetSlideControls() {
    if ((newLeft) - (dojo.byId("divCarouselDataContainer").offsetWidth - dojo.byId("divCarouselDataContent").offsetWidth) >= 10) {
        dojo.replaceClass(dojo.byId("divRightArrow"), "displayBlock", "displayNone");
        dojo.replaceClass(dojo.byId("divRightArrow"), "cursorPointer", "cursorDefault");
    }
    else {
        dojo.replaceClass(dojo.byId("divRightArrow"), "displayNone", "displayBlock");
        dojo.replaceClass(dojo.byId("divRightArrow"), "cursorDefault", "cursorPointer");
    }

    if (newLeft === 0) {
        dojo.replaceClass(dojo.byId("divLeftArrow"), "displayNone", "displayBlock");
        dojo.replaceClass(dojo.byId("divLeftArrow"), "cursorDefault", "cursorPointer");
    }
    else {
        dojo.replaceClass(dojo.byId("divLeftArrow"), "displayBlock", "displayNone");
        dojo.replaceClass(dojo.byId("divLeftArrow"), "cursorPointer", "cursorDefault");
    }
}

//Reset photo gallery slide controls
function ResetGallerySlideControls() {
    if ((dojo.byId("divInfoActData")) && (dojo.byId("divInfoScroll"))) {
        if (newInfoLeftOffice > dojo.byId("divInfoActData").offsetWidth - dojo.byId("divInfoScroll").offsetWidth) {
            dojo.byId("infoRightArrow").style.display = "block";
            dojo.byId("infoRightArrow").style.cursor = "pointer";
        }
        else {
            dojo.byId("infoRightArrow").style.display = "none";
            dojo.byId("infoRightArrow").style.cursor = "default";
        }

        if (newInfoLeftOffice === 0) {
            dojo.byId("infoLeftArrow").style.display = "none";
            dojo.byId("infoLeftArrow").style.cursor = "defalut";
        }
        else {
            dojo.byId("infoLeftArrow").style.display = "block";
            dojo.byId("infoLeftArrow").style.cursor = "pointer";
        }
    }

    if ((dojo.byId("divGalleryContainer")) && (dojo.byId("divGalleryContent"))) {
        if (newGalleryLeft > dojo.byId("divGalleryContainer").offsetWidth - dojo.byId("divGalleryContent").offsetWidth) {
            dojo.byId("galRightArrow").style.display = "block";
            dojo.byId("galRightArrow").style.cursor = "pointer";
        }
        else {
            dojo.byId("galRightArrow").style.display = "none";
            dojo.byId("galRightArrow").style.cursor = "default";
        }

        if (newGalleryLeft === 0) {
            dojo.byId("galLeftArrow").style.display = "none";
            dojo.byId("galLeftArrow").style.cursor = "defalut";
        }
        else {
            dojo.byId("galLeftArrow").style.display = "block";
            dojo.byId("galLeftArrow").style.cursor = "pointer";
        }
    }
}
