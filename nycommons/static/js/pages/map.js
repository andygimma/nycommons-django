//
// mappage.js
//
// Scripts that only run on the map page.
//

var _ = require('underscore');
var L = require('leaflet');
var Spinner = require('spin.js');

require('../map/lotmap');
require('bootstrap_button');
require('bootstrap_tooltip');
require('jquery-infinite-scroll');
require('leaflet-loading');
require('../handlebars.helpers');
require('../map.search.js');
var details = require('../components/details');
var exportLink = require('../components/export').exportLink;
var filters = require('../components/filters');
var hashHandler = require('../components/hash');
var legend = require('../components/legend').legend;
var locateButton = require('../components/locate').locateButton;
var searchButton = require('../components/search').searchButton;
require('../components/sidebar');
require('../data/lotcounts').init();
var oasis = require('../lib/oasis');


// Watch out for IE 8
var console = window.console || {
    warn: function () {}
};

function updateDetailsLink(map) {
    var params = map.buildLotFilterParams();
    delete params.parents_only;

    var l = window.location,
        query = '?' + $.param(params),
        url = l.protocol + '//' + l.host + l.pathname + query + l.hash;
    $('a.details-link').attr('href', url);
}

function checkForBoundaries() {
    // Check for city council / community board layers, console a warning
    var url = window.location.protocol + '//' + window.location.host +
        Django.url('inplace:layer_upload');
    if ($('.filter-city-council-districts').length === 0) {
        console.warn('No city council districts! Add some here: ' + url);
    }
    if ($('.filter-community-districts').length === 0) {
        console.warn('No community districts! Add some here: ' + url);
    }
}

function addBoundary(map, layer, pk, options) {
    if (!pk || pk === '') {
        map.removeBoundaries();
    }

    options = options || {};
    if (options.zoomToBounds === undefined) {
        options.zoomToBounds = true;
    }
    var url = Django.url('inplace:boundary_detail', { pk: pk });
    $.getJSON(url, function (data) {
        map.updateBoundaries(data, options);
    });
}

// TODO button no longer exists but we should load recent activity
/*
var spinner = new Spinner().spin($('.activity-stream')[0]);

var url = Django.url('activity_list');
$('.activity-stream').load(url, function () {
    $('.action-list').infinitescroll({
        loading: {
            finishedMsg: 'No more activities to load.'
        },
        behavior: 'local',
        binder: $('.overlaymenu-news .overlaymenu-menu-content'),
        itemSelector: 'li.action',
        navSelector: '.activity-stream-nav',
        nextSelector: '.activity-stream-nav a:first'
    });
});
*/

$(document).ready(function () {
    if ($('.map-page').length > 0) {
        var params;

        var mapOptions = {
            filterParams: filters.filtersToParams(null, {}),
            onMouseOverFeature: function (feature) {},
            onMouseOutFeature: function (feature) {}
        };

        // Get the current center/zoom from hash
        var parsedHash = hashHandler.parse();
        if (parsedHash.center) {
            mapOptions.center = parsedHash.center;
        }
        if (parsedHash.zoom) {
            mapOptions.zoom = parsedHash.zoom;
        }

        var map = L.lotMap('map', mapOptions);
        map.addControl(L.control.zoom({ position: 'bottomright' }));

        checkForBoundaries();

        $(document).on('filtersChanged', function (event, data) {
            map.updateFilters(data.filters);
            var params = map.buildLotFilterParams();
            $(document).trigger('updateLotCount', { map: map });
            hashHandler.update(map);
        });

        // Add boundary when input changes
        $(document).on('boundaryChanged', function (event, data) {
            addBoundary(map, data.layer, data.value, {});
        });

        // Show and hide lots based on boundary geometry
        map.on('boundarieschange', function (event) {
            map.updateFilters(map.currentFilters);
        });

        legend.attachTo('#map-legend', { map: map });
        locateButton.attachTo('.map-header-locate-btn', { map: map });
        searchButton.attachTo('.map-header-search-btn', { searchBar: '.map-search' });
        details.details.attachTo('.details-section', { map: map });
        filters.filters.attachTo('.filters-section', { initialFilters: parsedHash.filters || {} });
        exportLink.attachTo('.export', { map: map });

        // Add lots *after* filters are set up so we have initial filters loaded
        map.addLotsLayer();

        $('.details-print').click(function () {
            window.print();
            return false;
        });

        $('form.map-search-form').mapsearch()
            .on('searchstart', function (e) {
                map.removeUserLayer();
            })
            .on('searchresultfound', function (e, result) {
                var oasisUrl = oasis.vacantLotsUrl(result.latitude, result.longitude);
                map.addUserLayer([result.latitude, result.longitude], {
                    popupContent: '<p>This is the point we found when we searched.</p><p>Not seeing a vacant lot here that you expected? Check <a href="' + oasisUrl + '" target="_blank">OASIS in this area</a>. Learn more about using OASIS in our <a href="/faq/#why-isnt-vacant-lot-near-me-map" target="_blank">FAQs</a>.</p>'
                });
            });

        $(document).trigger('updateLotCount', { map: map });
        map.on({
            'moveend': function () {
                hashHandler.update(map);
                $(document).trigger('mapMoved');
                $(document).trigger('updateLotCount', { map: map });
            },
            'zoomend': function () {
                hashHandler.update(map);
                $(document).trigger('mapMoved');
                $(document).trigger('updateLotCount', { map: map });
            }
        });

        $('.admin-button-add-lot').click(function () {
            map.enterLotAddMode();
        });

        $('.admin-button-email').click(function () {
            map.enterMailMode();
        });
    }
});
