var PhotoCollectionView = Backbone.View.extend({
    className: 'album',

    loaded: 0,
    disableMouseAnimations: false,

    events: {
        // Slide up the photo collection container
        'mouseover :not(.spread)': function() {
            if (this.disableMouseAnimations) return;
            $(this.el).find('div[class=content]').stop().animate({ marginTop: '-80px' }, 150);
        },

        // Slide down the photo collection container
        'mouseleave :not(.spread)': function() {
            if (this.disableMouseAnimations) return;
            $(this.el).find('div[class=content]').stop().animate({ marginTop: '0px' }, 250);
        },

        // Spread the photos
        'click div:not(.spread)': function() {
            _gaq.push(['_trackPageview', "/" + this.collection.toJSON().title]);

            this.disableMouseAnimations = true;

            // Hide other colletions
            Gallery.events.trigger('hide-collection', this);

            var that = this;
            $(this.el).find('div[class~=content]').each(function(index) {
                $(this).addClass("spread");
                var left = $(this).offset().left * -1 + (($(window).width() / that.collection.photos.length)  * index);
                $(this).stop().animate({ left: left + 'px' }, 500)
                    .find('img').stop().animate({ rotate: Math.floor(Math.random() * 41) - 20 + 'deg' }, 500, function() {
                        that.disableMouseAnimations = false;
                    });
            });
        },

        // Slide up the photo if the photo collection is spread
        'mouseover div[class~=spread]': function(e) {
            $(e.currentTarget).find('img').stop().animate({ marginTop: '-60px' }, 300);
        },

        // Slide down the photo if the photo collection is spread
        'mouseleave div[class~=spread]': function(e) {
            $(e.currentTarget).find('img').stop().animate({ marginTop: '0px' }, 200);
        },

        // Show the image in the center of page
        'click div[class~=spread]': function(e) {
            if (this.currentPhoto) this.currentPhoto.hide(); // Hide the other
            this.currentPhoto = new PhotoView($(e.currentTarget).find('img').data('photo'));
            this.currentPhoto.show();
        }
    },

    initialize: function() {
        $(this.el).append($("#album-template").html());
        $(this.el).find('div').text(this.collection.toJSON().title);

        // Handle 'hide-collection' event
        Gallery.events.on('hide-collection', function(view) {
            // Don't hide this collection if it was triggered by my self
            if (view.cid == this.cid) {
                $('#back-button').stop().animate({ left: '0px' }, 300);
                $(this.el).animate({ marginTop: '50px' }, 500);
                return;
            }
            this.hide();
        }, this);

        // Handle 'show-gallery' event
        Gallery.events.on('show-gallery', function() {
            if (this.currentPhoto) this.currentPhoto.hide();

            $(this.el).animate({ marginTop: '0px' }, 500);
            $('#back-button').stop().animate({ left: '-150px'}, 300);

            var that = this;
            $(this.el).find('div[class~=spread]').each(function(index) {
                var left = $(this).offset().left * -1 + (($(window).width() / that.collection.photos.length)  * index);
                $(this).stop().animate({ left: left + 'px' }, 500)
                    .animate({ marginTop: '0px' })
                    .find('img').stop().animate({ rotate: Math.floor(Math.random() * 41) - 20 + 'deg' }, 500, function() {
                        that.disableMouseAnimations = false;
                    });

                $(this).removeClass("spread");
            });
        }, this);
    },

    render: function(length, index) {
        var left = (($(window).width() - (200 * length)) / 2) + (index * 200)

        $(this.el).css('left', left);

        var maxWidth = 0;
        _.each(this.collection.photos.toJSON(), function(photo) {
            var img = $('<img/>');
            img.data('photo', photo);
            img.attr('src', photo.thumb[1].url);

            if (photo.thumb[1].width > maxWidth)
                maxWidth = photo.thumb[1].width;

            var rotate = Math.floor(Math.random() * 41) - 20;
            img.transform({'rotate': rotate + 'deg'});

            $(img).load(function() {
                $(this.el).append($('<div class="content"></div>').append(img));

                if (this.collection.photos.length == ++this.loaded) {
                    $(this.el).animate({ marginTop: '0px' }, 500);
                }
            }.bind(this));

        }.bind(this));

        $(this.el).find('div[class=content]').css('left', (160 - maxWidth) / 2);
    },

    hide: function() {
        $(this.el).animate({ marginTop: '90px' }, 500);
    }
});

var GalleryView = Backbone.View.extend({
    id: 'gallery',

    events: {
        'click #back-button': function() {
            Gallery.events.trigger('show-gallery', this);
        }
    },

    initialize: function() {
        var template = _.template($("#gallery-template").html());
        $(this.el).append(template());
        $("#spinner").show();
    },

    show: function(callback) {
        $(this.el).appendTo($('body'));
        $('#spinner').hide();

        this.collection.each(function(model, index) {
            var view = new PhotoCollectionView({ collection: model });
            view.render(this.collection.length, index);
            $(this.el).append(view.el);
        }.bind(this));
    },

    hide: function(callback) {
        $(this.el).slideUp(function() { if (callback) callback(); });
    }
});

var PhotoView = Backbone.View.extend({
    className: 'preview',

    initialize: function(photo) {
        this.photo = photo;
        var template = _.template($("#photo-template").html());
        $(this.el).append(template({ title: photo.title }));
    },

    show: function() {
        $('#spinner').show();

        var that = this;

        var img = new Image();
        $(img).load(function() {
            $('#spinner').hide();

            $(that.el).prepend(this);
            $('#gallery').prepend(that.el);

            $(that.el).css({
                marginLeft: ((this.width + 20) * -1 / 2),
                marginTop: ((this.height + 55) * -1) / 2 - 20,
                height: this.height + 55,
                width: this.width + 20,
                visibility: 'visible'
            });

            $(that.el).animate({ top: '50%', rotate: Math.floor(Math.random() * 10 ) - 10 + 'deg' }, 700);
        }).attr('src', this.photo.src);
    },

    hide: function() {
        $(this.el).stop().animate({ top: '-150%', rotate: Math.floor(Math.random() * 41) - 20 + 'deg' }, 1000, function() {
            $(this).remove();
        });
    }
});
