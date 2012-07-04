if (typeof Function.prototype.bind != 'function') {
	Function.prototype.bind = function (bind) {
    var self = this;
    return function () {
        var args = Array.prototype.slice.call(arguments);
        return self.apply(bind || null, args);
		}
	}
}

var AppRouter = Backbone.Router.extend({
    routes: {
        "": function() {
        var show = (this.view);
        this.view = this.views.gallery;
        if (show)
            this.view.show();
        },
        "album": function() { }
    },

    events: _.extend({}, Backbone.Events),

    views: {},
    view: null,
    albumsLoaded: 0,
    albumsLength: 0,
    albums: [],

    initialize: function() {
        this.views.gallery = new GalleryView({ collection: new Albums() });
        this.views.gallery.collection.bind('reset', function() {
            this.albumsLength = this.views.gallery.collection.length;
        }, this);
        this.views.gallery.collection.fetch();
    },

    albumLoaded: function(album) {
        this.albums.push(album);

        // Show the gallery when all albums are loaded
        if (++this.albumsLoaded == this.albumsLength)
            this.views.gallery.show();
    }
});

var App = {
    picasaUser: '108513385329854977027',
//    picasaUser: 'gustavosbarreto',
    thumbSize: 120,

    initialize: function() {
        window.Gallery = new AppRouter();
        Backbone.history.start();
    }
};

$(document).ready(function() {
    App.initialize();
});
