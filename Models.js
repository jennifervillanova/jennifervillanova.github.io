var Album = Backbone.Model.extend({
    photos: Photos,

    initialize: function() {
        this.photos = new Photos(this.id);
        this.photos.bind('reset', this.loaded, this);
        this.photos.fetch();
    },

    loaded: function() {
        Gallery.albumLoaded(this);
    },

    parse: function(entry) {
        return { id: entry.gphoto$name.$t, title: entry.title.$t.replace('[SITE] ', '') };
    }
});

var Albums = Backbone.Collection.extend({
    model: Album,

    initialize: function() {
    },

    url: function() {
        return 'http://picasaweb.google.com/data/feed/api/user/' + App.picasaUser + '?kind=album&access=public&alt=json&thumsize=' + App.thumbSize;
    },

    parse: function(response) {
        response.feed.entry = _.reject(response.feed.entry, function(entry) {
            if (entry.gphoto$name.$t == "ProfilePhotos" || !/SITE/.test(entry.gphoto$name.$t))
                return true;
        });

        return response.feed.entry;
    }
});

var Photo = Backbone.Model.extend({
    parse: function(entry) {
        return { title: entry.summary.$t, thumb: entry.media$group.media$thumbnail, src: entry.content.src,
                 width: entry.media$group.media$content[0].width, height: entry.media$group.media$content[0].height };
    }
});

var Photos = Backbone.Collection.extend({
    model: Photo,

    initialize: function(album) {
        this.url = 'http://picasaweb.google.com/data/feed/api/user/' + App.picasaUser + '/album/' + album + '?kind=photo&alt=json&imgmax=600';
    },

    parse: function(response) {
        return response.feed.entry;
    }
});
