var Site = function(settings)
{ 
    for(opt in settings)
        this.options[opt] = settings[opt];
};

Site.prototype = 
{
    isTransitionInProgress : false,
    isMusicPlaying : false,
    fMusicPlayer : null,
    nextSwitch: null,
    fMusicPlayerIsLoaded : false,
    options: { enableKeyboard: true, autoSwitch: true, pauseOnPictureFor: 3500, transitionSpeed: 800, flashPlayerId : "fMusicPlayer" },
    
    init: function()
    {
        var $this = this;
        
        $(window).bind("resize", this.handleResizing);

        $("#musicbutton").click(function(e){
            e.preventDefault();
            $this.toggleMusic.apply($this, arguments);
        });
        
        $("#btn_next").click(function(){
            $this.nextImage.apply($this, arguments);
        });
        
        $("#btn_prev").click(function(){
            $this.prevImage.apply($this, arguments);
        });
        
        if ($.browser.mozilla)
            $("#musicplayer").bind("ended", this.loopFirefox); 
            
        if (this.options.enableKeyboard)
        {
            var el = ($.browser.mozilla) ? window : document.body;
            $(el).keyup(function(e)
            {
                switch(e.keyCode)
                {
                    case 39: $this.nextImage(); break;
                    case 37: $this.prevImage(); break;
                }
            }); 
        }
    },
    
    loopFirefox: function(e)
    {
        this.currentTime = 0;
        this.play();
    },

    flashPlayerLoaded: function()
    {
        this.flashMusicPlayerIsLoaded = true;  
        this.isMusicPlaying = true;
        this.fMusicPlayer = $("#" + this.options.flashPlayerId).get(0);
    },
    
    toggleMusic: function(e)
    {
        if (!this.flashMusicPlayerIsLoaded)
        {
            var player = $("#musicplayer").get(0);
            if (player.volume == 1)
            {
                this.isMusicPlaying = false;  
                player.pause();
                player.volume = 0;
            }
            else
            {
                this.isMusicPlaying = true;  
                player.currentTime = 0;
                player.volume = 1;
                player.play();
            }
        }
        else
        {
            this.isMusicPlaying = !this.isMusicPlaying;  
            this.fMusicPlayer.toggleMusic();
        }
        
        $("#musicbutton").text((this.isMusicPlaying ? "sound on" : "sound off"));
    },

    nextImage: function(e)
    {
        if (this.isTransitionInProgress)
        {
            return;
        }

        this.cancelNextScheduledImage();
        
        var from = $("figure.active");
        var to = (from.next().is("figure") ? from.next() : from.parent().children(":first"));
        this.isTransitionInProgress = true;
        this.switchImages(from, to);
    },
    
    prevImage: function(e)
    {
        if (this.isTransitionInProgress)
            return;
        
        var from = $("figure.active");
        var to = (from.prev().is("figure") ? from.prev() : from.parent().children(":last"));
        this.isTransitionInProgress = true;
        this.switchImages(from, to);
    },
    
    switchImages: function(from, to)
    {
        var $this             = this;
        var isNextImageLoaded = to.children("img").get(0).complete;
        if (isNextImageLoaded)
        {
            from.stop().fadeOut($this.options.transitionSpeed, function(){
                
                from.removeClass("active").css("display", "none");
                to.addClass("active");
                $this.handleResizing();
                to.hide().fadeIn($this.options.transitionSpeed, function(){
                    $this.isTransitionInProgress = false;
                    $this.scheduleNextImage();
                });
            });
            
            return;
        }
        
        $("#loading").hide().fadeIn($this.options.transitionSpeed, function(){
            from.removeClass("active").css("display", "none");
            to.addClass("active");
            if (isNextImageLoaded)
            {
                $this.handleResizing();
                $this.hideLoading();
            }   
            else
            {
                imageLoaded();
            }
        });
    },
    
    hideLoading: function()
    {
        var $this = this;
        $("#loading").fadeOut(this.options.transitionSpeed, function(){
            $this.isTransitionInProgress = false;
            $this.scheduleNextImage();
        });
    },

    cancelNextScheduledImage: function()
    {
        clearTimeout(this.nextSwitch);
        this.nextSwitch = null;
    },
    
    scheduleNextImage: function()
    {
        var $this = this;
        this.cancelNextScheduledImage();
        if (!this.isTransitionInProgress && this.options.autoSwitch)
        {
            this.nextSwitch = setTimeout(function(){
                $this.nextImage();
            }, this.options.pauseOnPictureFor);
        }
    },
    
    handleResizing: function()
    {
        var img = $("figure.active img").css("left","0");
        
        var documentWidth  = $(window).width();
        var documentHeight = $(window).height();
        var imageWidth     = img.width();
        var imageHeight    = img.height();
        var imageRatio     = imageWidth/imageHeight;      
        var finalWidth     = documentWidth;
        var finalHeight    = Math.round(finalWidth/imageRatio);
        
        if (finalHeight < documentHeight)
        {
            finalHeight = documentHeight;
            finalWidth  = Math.round(finalHeight*imageRatio);
            var widthOffset = Math.round((finalWidth - documentWidth) / 2);
            img.css("left", -widthOffset + "px");
        }
    
        img.width (finalWidth );
        img.height(finalHeight);
    }
};

function flashIsLoaded()
{
	site.flashPlayerLoaded();
}

function imageLoaded()
{
    if(!$("figure.active img").get(0).complete)
    {
        site.isTransitionInProgress = true;
        setTimeout(imageLoaded, 100);     
        return;
    }
    
    site.handleResizing();
    site.hideLoading();
}