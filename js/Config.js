/*global dojo */
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
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */
dojo.provide("js.Config");
dojo.declare("js.Config", null, {

    // This file contains various configuration settings for "Configurable Place Finder" template
    //
    // Use this file to perform the following:
    //
    // 1.  Specify application title                  - [ Tag(s) to look for: ApplicationName ]
    // 2.  Set path for application icon              - [ Tag(s) to look for: ApplicationIcon ]
    // 3.  Set path for application favicon           - [ Tag(s) to look for: ApplicationFavicon ]
    // 4.  Set path for application theme             - [ Tag(s) to look for: ApplicationTheme ]

    // 5.  Set splash screen message                  - [ Tag(s) to look for: SplashScreen ]
    // 6.  Set URL for help page                      - [ Tag(s) to look for: HelpURL ]

    // 7.  Specify URLs for basemaps                  - [ Tag(s) to look for: BaseMapLayers ]
    // 8.  Set initial map extent                     - [ Tag(s) to look for: DefaultExtent ]

    // 9.  Tags for using map services:
    // 9a. Specify URLs and attributes for operational layers
    //                                                - [ Tag(s) to look for: FacilityLayer, PrimaryKeyForFeatures, CommentsLayer, ForeignKeyforComments, FeatureName, ReferenceOverlayLayer ]
    // 9b. Customize info-Window settings             - [ Tag(s) to look for: InfoWindowHeader, InfoWindowContent ]
    // 9c. Customize info-Popup settings              - [ Tag(s) to look for: InfoPopupFieldsCollection, Activities ]
    // 9d. Customize info-Popup size                  - [ Tag(s) to look for: InfoPopupHeight, InfoPopupWidth ]
    // 9e. Customize data formatting                  - [ Tag(s) to look for: ShowNullValueAs, FormatDateAs ]

    // 10. Customize buffer settings                  - [ Tag(s) to look for: BufferDistance ]
    // 11. Customize directions settings              - [ Tag(s) to look for: GetDirectionsMobile, GetDirectionsDesktop, GetDirections, ApproximateValue ]

    // 12a. Customize address search settings         - [ Tag(s) to look for: DefaultLocatorSymbol, MarkupSymbolSize, Locators, LocatorDefaultAddress, LocatorParameters, LocatorURL, CandidateFields,
    //                                                                        DisplayField, AddressMatchScore, LocatorFieldName, LocatorFieldValues, CountyFields, MaxResults ]
    // 12b. Customize facility search settings        - [ Tag(s) to look for: DisplayText, LocatorDefaultFeature ]
    // 12c. Customize activity search settings        - [ Tag(s) to look for: DisplayText ]

    // 13. Customize ripple size settings             - [ Tag(s) to look for: LocatorRippleSize ]
    // 14. Customize zoom level settings              - [ Tag(s) to look for: ZoomLevel ]
    // 15. Customize database fields settings         - [ Tag(s) to look for: DatabaseFields ]
    // 16. Customize Comments infoPopup settings      - [ Tag(s) to look for: CommentsInfoPopupFieldsCollection ]
    // 17. Customize text for GeoLocation             - [ Tag(s) to look for: TextForGeoLocation ]
    // 18. Set URL for geometry service               - [ Tag(s) to look for: GeometryService ]

    // 19. Customize routing settings for directions  - [ Tag(s) to look for: RouteServiceURL, RouteColor, RouteWidth ]

    // 20. Configure data to be displayed on the bottom panel
    //                                                - [ Tag(s) to look for: InfoBoxWidth, Order]

    // 21. Specify URLs for map sharing               - [ Tag(s) to look for: MapSharingOptions, TinyURLServiceURL, TinyURLResponseAttribute, FacebookShareURL, TwitterShareURL, ShareByMailLink ]


    // ------------------------------------------------------------------------------------------------------------------------
    // GENERAL SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------
    // Set application title
    ApplicationName: "Airport Finder",

    // Set application icon path
    ApplicationIcon: "images/AirLogo.png",

    // Set application Favicon path
    ApplicationFavicon: "images/AirLogo.ico",

    // Set application theme (greenTheme.css , blueTheme.css , brownTheme.css)
    ApplicationTheme: "styles/blueTheme.css",

    // Set splash window content - Message that appears when the application starts
    SplashScreen: {
        Message: "<b>Welcome to Airport Finder</b> <br/> <hr/> <br/> The <b>Airport Finder</b> application helps citizens locate airport facilities and obtain information about aviation activities in Massachusetts.  <br/><br/>To locate an airport, simply enter an address in the search box, or use your current location. Airports will then be highlighted on the map and relevant information about available facility specifications will be presented to the user.",
        isVisible: true
    },

    // Set URL of help page/portal
    HelpURL: "help_AirportFinder.htm",

    // ------------------------------------------------------------------------------------------------------------------------
    // BASEMAP SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------
    // Set baseMap layers
    // Please note: All base-maps need to use the same spatial reference. By default, on application start the first base-map will be loaded
    BaseMapLayers: [{
        Key: "topoMap",
        ThumbnailSource: "images/topographic.jpg",
        Name: "Topographic",
        MapURL: "http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer"
    }, {
        Key: "parcelMap",
        ThumbnailSource: "images/parcel.png",
        Name: "Streets",
        MapURL: "http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer"
    },{
        Key: "imageMap",
        ThumbnailSource: "images/Imagery.jpg",
        Name: "Imagery",
        MapURL: "http://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer"
    }],

    // Initial map extent. Use comma (,) to separate values and don't delete the last comma
    DefaultExtent: "-8205414,5342535,-7762159,4999054",

    // ------------------------------------------------------------------------------------------------------------------------
    // OPERATIONAL DATA SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------

    // Configure operational layers:
    //URL used for doing query task on the feature layer
    FacilityLayer: "http://services.massdot.state.ma.us/ArcGIS/rest/services/Transit/AirportsFinder/MapServer/0",
    //Set the primary key attribute for features
    PrimaryKeyForFeatures: "${FACILITYID}",


    CommentsLayer: {
        //Set to true if comments need to be displayed , or false if not required
        Visibility: false,
        //URL used for doing query task on the comments layer
        URL: "http://yourserver/arcgis/rest/services/Parks/FeatureServer/1"
    },
    //Set the foreign key attribute for comments
    ForeignKeyforComments: "${FACILITYID}",

    //Set the name attribute for features
    FeatureName: "${NAME}",

    // ServiceUrl is the REST end point for the reference overlay layer
    // DisplayOnLoad setting is used to show or hide the reference overlay layer. Reference overlay will be shown when it is set to true

    ReferenceOverlayLayer: {
        ServiceUrl: "http://services.massdot.state.ma.us/ArcGIS/rest/services/",
        DisplayOnLoad: false
    },

    // ------------------------------------------------------------------------------------------------------------------------
    // INFO-WINDOW SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------
    // Info-window is a small, two line popup that gets displayed on selecting a feature
    // Set Info-window title. Configure this with text/fields
    InfoWindowHeader: [{
        FieldName: "${NAME}",
        Alias: "Name of Facility",
        InfoWindowHeaderText: "Facility Info"
    }],

    // Set content/fields for the callout window in Smartphone's
    InfoWindowContent: [{
        FieldName: "${ADDRESS}",
        Alias: "Full Address"
    }],

    // ------------------------------------------------------------------------------------------------------------------------
    // INFO-POPUP SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------
    // Info-popup is a popup dialog that gets displayed on selecting a feature
    // Set the content to be displayed on the info-Popup. Define labels, field values, field types and field formats
    InfoPopupFieldsCollection: [{
        DisplayText: "Airport ID:",
        FieldName: "${Airport_ID}"
    }, {
        DisplayText: "City:",
        FieldName: "${Location}"
    }, {
        DisplayText: "Address:",
        FieldName: "${ADDRESS}"
    }, {
        DisplayText: "Days Open:",
        FieldName: "${OPERDAYS}"
    }, {
        DisplayText: "Hours of Operation:",
        FieldName: "${OPERHOURS}"
	}, {
        DisplayText: "Manager Name:",
        FieldName: "${Manager_Nu}"
	}, {
        DisplayText: "Manager Number:",
        FieldName: "${Phone}"
    }, {
        DisplayText: "Airport Website:",
        FieldName: "${AirportURL}"
    }, {
        DisplayText: "Common Traffic Advisory Frequency:",
        FieldName: "${CTAF}"
    }, {
        DisplayText: "Automated Weather Observing System:",
        FieldName: "${AWOS}"
    }, {
        DisplayText: "Tower:",
        FieldName: "${TWR}"
    }, {
        DisplayText: "Ground:",
        FieldName: "${GND}"
    }, {
        DisplayText: "Automatic Terminal Information Service:",
        FieldName: "${ATIS}"
    }, {
        DisplayText: "Automated Surface Observing Systems:",
        FieldName: "${ASOS}"
    }, {
        DisplayText: "Elevation:",
        FieldName: "${Elevation}"
    }, {
        DisplayText: "Traffic Pattern Altitude:",
        FieldName: "${TPA}"
    }],

    //Activities to be displayed in info window for a feature
    Activities: [{
        FieldName: "${RESTROOMS}",
        Alias: "Public Restrooms Available",
        Image: "images/restrooms.png",
        isSelected: true
    }, {
        FieldName: "${CAR}",
        Alias: "Car Rental Service Available",
        Image: "images/automobile.png"
    }, {
        FieldName: "${RESTAURANT}",
        Alias: "Restaurant Available",
        Image: "images/cans_or_bottles.png"
    }, {
        FieldName: "${TAXI}",
        Alias: "Taxi Stand Present",
        Image: "images/fourwheel.png"
    }, {
        FieldName: "${BUS}",
        Alias: "Bus Service Available",
        Image: "images/bus.png"
    }, {
        FieldName: "${PARKING}",
        Alias: "Free Parking Available",
        Image: "images/parking.png"
    }, {
        FieldName: "${MAINTENANCE}",
        Alias: "Maintenance Available",
        Image: "images/mechanic.png"
    }, {
        FieldName: "${TRAINING}",
        Alias: "Training Available",
        Image: "images/bookstore.png"
    }, {
        FieldName: "${HELICOPTER}",
        Alias: "Helicopter Facilities",
        Image: "images/helicopter.png"
    }, {
        FieldName: "${LODGING}",
        Alias: "Lodging Available",
        Image: "images/hotel.png"
    }],

    // Set size of the info-Popup - select maximum height and width in pixels (not applicable for tabbed info-Popup)
    InfoPopupHeight: 270,
    InfoPopupWidth: 330,

    // Set string value to be shown for null or blank values
    ShowNullValueAs: "N/A",

    // Set date format
    FormatDateAs: "MMM dd, yyyy",

    //set distance in miles for drawing the buffer
    BufferDistance: "10",

    //Set this variable to true/false to enable/disable directions and will consume credits
    //Enabling the "GetDirections" parameter will draw routes and provide directions using the ArcGIS Online World Route Service. 
    //The World Route Service is an ArcGIS Online for organizations subscription service that uses credits when routes are generated.
    //if this master variable is set to false directions cannot be enabled for any of the devices
    
    GetDirections: false,

    //Set this variable to true/false to enable/disable directions for Mobile/tablet
    GetDirectionsMobile: false,

    //Set this variable to true/false to enable/disable directions for desktop
    GetDirectionsDesktop: false,

    //Set this value to display text besides calculated distances in search results
    ApproximateValue: "approx",

    // ------------------------------------------------------------------------------------------------------------------------
    // ADDRESS SEARCH SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------

    // Set locator settings such as locator symbol, size, display fields, match score

    //DefaultLocatorSymbol:Set the image path for locator symbol. e.g. pushpin.
    //MarkupSymbolSize:Set the image dimensions in pixels for locator symbol.
    //DisplayText: Set the title for type of search e.g. 'Location', 'Name', 'Activity'
    //LocatorDefaultAddress: Set the default address to search.
    //LocatorDefaultFeature: Set the default facility to search.
    //LocatorParameters: Required parameters to search the address candidates.
    //                SearchField: The name of geocode service input field that accepts the search address. e.g. 'SingleLine' or 'Address'.
    //                SearchBoundaryField: The name of geocode service input field that accepts an extent to search an input address within. e.g."searchExtent"
    //LocatorURL: Specify URL for geocode service.
    //LocatorOutFields: The list of outfields to be included in the result set provided by geocode service.
    //DisplayField: Specify the outfield of geocode service. The value in this field will be displayed for search results in the application.
    //AddressMatchScore: Required parameters to specify the accuracy of address match.
    //                Field: Set the outfield of geocode service that contains the Address Match Score.
    //                Value: Set the minimum score value for filtering the candidate results. The value should be a number between 0-100.
    //AddressSearch: Candidates based on which the address search will be performed.
    //                FilterFieldName: Set the outfield that contains the match level for geocode request. e.g. For World GeoCode, the field that contains the match level is 'Addr_type'.
    //                FilterFieldValues: Specify the desired match levels to filter address search results. e.g. 'StreetAddress', 'StreetName' etc.
    //PlaceNameSearch: Attributes based on which the layers will be queried when a location search is performed.
    //                LocatorFieldValue: Set the match level for county/place search. e.g. 'POI' will contain all administrative boundary
    //                FilterFieldName: Set the feature type for results returned by the geocode request. e.g. For World GeoCode, the field that contains the feature type is 'Type'.
    //                FilterFieldValues: Specify the feature types to filter search results. e.g. 'county', 'city' etc.
    //                Enabled: Sets whether the PlaceNameSearch results should be displayed or not.
    LocatorSettings: {
        DefaultLocatorSymbol: "images/RedPushpin.png",
        MarkupSymbolSize: {
            width: 35,
            height: 35
        },
        Locators: [{
            DisplayText: "Location",
            LocatorDefaultAddress: "10 Park Plaza, Boston MA 02116",
            LocatorParameters: {
                SearchField: "SingleLine",
                SearchBoundaryField: "searchExtent"
            },
            LocatorURL: "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
            LocatorOutFields: ["Addr_Type", "Type", "Score", "Match_Addr", "xmin", "xmax", "ymin", "ymax"],
            DisplayField: "${Match_Addr}",
            AddressMatchScore: {
                Field: "Score",
                Value: 80
            },
            AddressSearch: {
                FilterFieldName: 'Addr_Type',
                FilterFieldValues: ["StreetAddress", "StreetName", "PointAddress", "POI"]
            },
            PlaceNameSearch: {
                LocatorFieldValue: "POI",
                FilterFieldName: "Type",
                FilterFieldValues: ["county", "city"],
                Enabled: true
            }
        }, {
            DisplayText: "Name",
            LocatorDefaultFeature: "Knoch Park"
        }, {
            DisplayText: "Activity"
        }]
    },

    //Set the locator ripple size(in pixels)
    LocatorRippleSize: 40,

    //Set the Zoom Level
    ZoomLevel: 12,
    // Define the database field names
    // Note: DateFieldName refers to a date database field.
    // All other attributes refer to text database fields.
    DatabaseFields: {
        FeatureIdFieldName: "FACILITYID",
        CommentsFieldName: "COMMENTS",
        DateFieldName: "SUBMITDT",
        RankFieldName: "RANK"
    },

    // Set info-pop fields for adding and displaying comment
    CommentsInfoPopupFieldsCollection: {
        Rank: "${RANK}",
        SubmitDate: "${SUBMITDT}",
        Comments: "${COMMENTS}"
    },

    // Set default text for geolocation
    TextForGeoLocation: "My Location",

    // ------------------------------------------------------------------------------------------------------------------------
    // GEOMETRY SERVICE SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------

    // Set geometry service URL
    GeometryService: "http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",

    // ------------------------------------------------------------------------------------------------------------------------
    // DRIVING DIRECTIONS SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------
    // Set URL for routing service
    RouteServiceURL: "http://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World",

    // Set color for the route symbol
    RouteColor: "#7F7FFE",

    // Set width(in pixels) of the route
    RouteWidth: 6,

    // ------------------------------------------------------------------------------------------------------------------------
    // SETTINGS FOR INFO-PODS ON THE BOTTOM PANEL
    // ------------------------------------------------------------------------------------------------------------------------
    // Set width(in pixels) of the pods in the bottom panel
    InfoBoxWidth: 422,

    // Set sequence for info pods in the bottom panel
    Order: ["search", "facility", "directions", "photogallery", "comments"],

    // ------------------------------------------------------------------------------------------------------------------------
    // SETTINGS FOR MAP SHARING
    // ------------------------------------------------------------------------------------------------------------------------

    // Set URL for TinyURL service, and URLs for social media
    MapSharingOptions: {
        TinyURLServiceURL: "http://api.bit.ly/v3/shorten?login=esri&apiKey=R_65fd9891cd882e2a96b99d4bda1be00e&uri=${0}&format=json",
        TinyURLResponseAttribute: "data.url",
        FacebookShareURL: "http://www.facebook.com/sharer.php?u=${0}&t=Parks%20Finder",
        TwitterShareURL: "http://mobile.twitter.com/compose/tweet?status=Parks%20Finder ${0}",
        ShareByMailLink: "mailto:%20?subject=Check%20out%20this%20map&body=${0}"
    }
});
