/*
    Circus Slider - jQuery plugin - Image slider 
    Copyright (C) 2012  Erik Landvall
    
    This file is part of Circus Slider.

    Circus Slider is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see http://www.gnu.org/licenses/.

    - - -

    Includes animator.js:

        Animator - Javascript
        Copyright (C) 2012  Erik Landvall
        Dual licensed under the MIT and GPL version 3 licenses

 */

( function( $ )
{
    /* Throws 3 exceptions:
     * - No ul element found
     * - More then 1 ul element found
     * - No li elements found
     * 
     * Following options are available:
     * - eventCash [boolean]
     * - showButtons [boolean]
     * - showThumbnails [boolean]
     * - useImagesForThumbnails [boolean]
     * - thumbnailsWrapper [selector]
     */
    $.fn.circusSlider = function( options )
    {
        /**
         * Animator is a class ment to create smother animations when possible
         * 
         * @link http://webstuff.nfshost.com/anim-timing/Overview.html
         * @link https://developer.mozilla.org/en/DOM/window.requestAnimationFrame
         * @link http://dev.chromium.org/developers/design-documents/requestanimationframe-implementation
         */
        var Animator = function()
        {
            var

            // A handler to this instance
            _animator = this,

            // A spcifed element for better optimatation. Usuly the canvas where
            // we are painting
            _element = undefined,

            // The queue
            _queue    = [],

            // A flag that determines if the loop is running
            _running  = false,

            /**
            * Handle to the callback-routine
            */
            _requestAnimationFrame = ( function()
            {
                return window.requestAnimationFrame
                    || window.webkitRequestAnimationFrame
                    || window.mozRequestAnimationFrame
                    || window.oRequestAnimationFrame
                    || window.msRequestAnimationFrame

                    // Fallback
                    || function( callback )
                    {return window.setTimeout( callback, 1000 / 60 );};
            })();

            /**
            * Starts the animation loop, if not already running
            * 
            * @type Animator
            */
            this.start = function()
            {
                if( !_running )
                {
                    _running = true;

                    ( function loop()
                    {
                        if( _running )
                        {
                            _requestAnimationFrame(
                                loop,
                                _animator.getElement() );

                            var queue = _animator.getQueue();

                            for( var i = 0, l = queue.length; i < l; i++ )
                                queue[ i ]();
                        }
                    })();
                }

                return _animator;
            }

            /**
            * Stops/Pauses the animation loop, if running...
            * 
            * @type Animator
            */
            this.stop = function()
            {
                _running = false;

                return _animator;
            }

            /**
            * Returns if animation loop is currently running
            * 
            * @type boolean
            */
            this.isRunning = function()
            {
                return _running;
            }

            /**
            * Adds one ore many functions to the queue
            * 
            * @param fn array|function - The function, or an array of functions,
            * we wish to add to the queue
            * @exception 'Only functions are allowed in the queue'
            * @type int|array
            */
            this.addToQueue = function( fn )
            {
                var r = undefined;

                switch( typeof fn )
                {
                    case 'function':
                        r = _queue.length;
                        _queue[ r ] = fn;

                        break;

                    case 'object':
                        if( fn instanceof Array )
                        {
                            r = [];

                            for( var i = 0, l = fn.length; i < l; i++ )
                                r.push( _animator.addToQueue( fn[ i ] ));

                            break;
                        }

                    default :
                        throw 'Only functions are allowed in the queue';
                }

                return _animator;
            }

            /**
            * Removes a function from the queue
            * 
            * @param fn function - The function we wish to remove from the queue
            * @type Animator
            */
            this.removeFromQueue = function( fn )
            {
                for( var i = 0; i < _queue.length; i++ )
                    if( _queue[ i ] == fn )
                        _animator.removeIndexFromQueue( i-- );

                return _animator;
            }

            /**
            * Removes an item from the queue depending on specified index
            * 
            * @param index integer - The index we wish to remove
            * @type Animator
            */
            this.removeIndexFromQueue = function( index )
            {
                _queue.splice( Math.floor( index ), 1 );

                return _animator;
            }

            /**
            * Returns the current queue
            * 
            * @type array
            */
            this.getQueue = function()
            {
                return _queue;
            }

            /**
            * Clears the old queue and sets a new one
            * 
            * @exception 'Only functions are allowed in the queue'
            * @param queue array - The queue new queue
            * @type Animator
            */
            this.setQueue = function( queue )
            {
                _animator.clearQueue();
                _animator.addToQueue( queue );

                return _animator;
            }

            /**
            * Unsets the queue
            * 
            * @type Animator
            */
            this.clearQueue = function()
            {
                _queue = [];

                return _animator;
            }

            /**
            * Returns the specified element we wish to render on
            *
            * @type Element|undefined
            */
            this.getElement = function()
            {
                return _element;
            }

            /**
            * Not required. If specifyed one may optimize the animation
            *
            * @param element Element - [optional] The element we render in
            * @exception 'Unrecognized element'
            * @type Animator
            */
            this.setElement = function( element )
            {
                if( element == undefined )
                    _animator.removeElement();

                else if( element instanceof Element )
                    _element = element;

                else if( element instanceof jQuery )
                    _element = element.get( 0 );

                else
                    throw 'Unrecognized element';

                return _animator;
            }

            /**
            * Removes the specified Element we render in
            * 
            * @type Animator
            */
            this.removeElement = function()
            {
                _element = undefined;

                return _animator;
            }
        },
        
        /* The function that calculates the animation movement
         */
        
        halfMoonAnimation = function( distance, speed )
        {
            speed = speed || 0.1;

            var animation = [],
                former    = 0,
                ticker    = ( Math.PI / 2 ) * - 1,
                value;

            while( true )
            {
                ticker += speed
                value   = ( Math.sin( ticker ) + 1 ) / 2;

                if( former >= value )
                    break;

                former = value;

                animation.push( Math.round( value * distance ));
            }

            if( animation.length > 0 )
                animation[ animation.length - 1 ] = distance;

            return animation;
        };
        
        /* Updating the default options with user defined
         */
        
        options = $.extend(
            {
                // Cashes browsing events
                'eventCash':
                    true,
                
                // Determines if the buttons for left or right scrolling should
                // be displayed
                'showButtons':
                    false,
                
                // Determines if thumbnails should be displayed
                'showThumbnails':
                    false,
                
                // If this option and 'showThumbnails' is both true, this
                // option will use the first appering image in the li element
                // as a representing thumbnail for that slide.
                'useImagesForThumbnails':
                    false,
                
                // Allows the user to specify a wrapper that containes the
                // thumbnail container
                // ..defaults to viewport
                'thumbnailsWrapper':
                    undefined,
                
                // Allows the user provide the Animator instance if desired
                // .. desfults to a new instance of the Animator class
                'animator':
                    new Animator()
            },
            options );
        
        /* Looping through all elements we wish to create a slider from
         */
        
        $( this )
        
            // Setting class name for all the sliders
            .addClass( 'circus-slider' )
            
            .each(
                function()
                {
                    /* Collecting relative elements
                     */
                    
                    var ul = $( '> ul', this ),
                        li = $( '> li', ul );

                    /* Validates to be sure we got what we need
                     */
                    
                    if( ul.length == 0 )
                        throw 'No ul element found';

                    if( ul.length > 1 )
                        throw 'More then 1 ul element found';

                    if( li.length < 1 )
                        throw 'No li elements found';
                    
                    /* How many li elements exists in the initiation part.
                     * This tells us how many images acctuly existes after
                     * cloning has accured.
                     */
                    
                    var iniLiLength = li.length;
                    
                    /* Cloning elements
                     * 
                     * We need 5 li element for a nice flow and a good looking
                     * floded view.
                     */
                    
                    for( var i = iniLiLength; i < 5; )
                        li.each(
                            function()
                            {
                                i++;
                                ul.append( $( this ).clone( true, true ));
                            });
                    
                    /* Creating the viewport
                     */
                    
                    var viewPort = $( '<div />' )
                            .addClass( 'circus-slider-viewport' );
                    
                    /* Setting sizes
                     */
                    
                    var width = li.first().width();
                    viewPort.width( width );
                    ul.width( width * $( '> li', ul ).length );
                    
                    /* Setting positions so we start from the beginning but
                     * still have two element behind us.
                     */
                    
                    for( var i = 0; i < 2; i++ )
                        ul.prepend( $( '> li', ul ).last() );
                    
                    ul.css( 'left', '-' + ( width * 2 ) + 'px' );
                    
                    /* Setting the viewport
                     */
                        
                    ul.wrap( viewPort );
                    
                    /* A flag that determines if an animation is currently
                     * running.
                     */

                    var ani = false,
                    
                    /* Determines what view we are currently viewing
                     */
                    
                    viewIndex = 0,
                    
                    /* Cashes event if animation is currently running.
                     */
                    
                    eventCash = null;
                    
                    /* Defines the animation function that slides the slider
                     */
                        
                    var slide = function( tick )
                    {
                        // Prevents this animation from starting if there's
                        // already an animation running
                        if( ani )
                        {
                            // Cashed event will run after current animation
                            // has finished
                            eventCash = tick;
                            
                            return;
                        }

                        // Prevents other animations from starting
                        ani = true;
                        
                        // Resets eventual cash
                        eventCash = null;
                        
                        // Calculating the new viewIndex
                        viewIndex += tick;
                        
                        // Keeping the view index relevent
                        while( viewIndex >= iniLiLength )
                            viewIndex -= iniLiLength;
                        while( viewIndex < 0 )
                            viewIndex = iniLiLength + viewIndex;
                        
                        // Setting active class name on correct thumbnail
                        if( options.showThumbnails )
                        {
                            var activeClass = 'circus-slider-thumbnail-active',
                                thumbnailContainer = $(
                                    '> .circus-slider-thumbnail-container',
                                    thumbnailsWrapper );
                            
                            $( '> .circus-slider-thumbnail',
                                thumbnailContainer ).removeClass( activeClass );
                                
                            $( '> .circus-slider-thumbnail:nth('+viewIndex+')',
                                thumbnailContainer ).addClass( activeClass );
                        }
                        
                        var // Calculating the animation length
                            length = width * Math.abs( tick ),
                        
                            // Calculating new position value
                            left = tick < 0
                                 ? ul.position().left - length
                                 : ul.position().left,
                            
                            // Retrives the animation array
                            animation = halfMoonAnimation( length );

                        // Clones the endblocks and prepands it or vice versa
                        for( var n = 0; n < Math.abs( tick ); n++ )
                            tick < 0
                                ? ul.prepend(
                                    $( 'li:nth(' + ( iniLiLength - 1 ) + ')', 
                                        ul )
                                    .clone( true, true ))

                                : ul.append(
                                    $( 'li:nth(' + n + ')', 
                                        ul )
                                    .clone( true, true ));

                        ul.css(
                            {
                                // Positioning the content accordingly
                                'left':
                                    left + 'px',
                                
                                // Setting new size to be able to display
                                // cloned elements
                                'width':
                                    ( ul.width() + length ) + 'px'
                            });

                        // Starts the animation
                        var i    = 0,
                            l    = animation.length,
                            loop = function()
                            {
                                // Will clear interval if we reached the end
                                if( i == l )
                                {
                                    options.animator.removeFromQueue( loop );
                                    
                                    // Removing flooded elements
                                    for( var n = 0; n < Math.abs( tick ); n++ )
                                        tick < 0
                                            ? $( '> li', ul ).last().remove()
                                            : $( '> li', ul ).first().remove();
                                    
                                    ul.css(
                                        {
                                            // Positioning content
                                            'left':
                                                ( tick < 0
                                                ? ul.position().left
                                                : ul.position().left 
                                                + length ) + 'px',
                                            
                                            // Setting new size after the
                                            // dublicates has been removed
                                            'width':
                                                ( ul.width() 
                                                - length ) + 'px'
                                        });

                                    ani = false;
                                    
                                    // Running cashed event
                                    if( options.eventCash )
                                        if( eventCash != null )
                                            slide( eventCash );
                                    
                                    return;
                                }

                                // Sets the new position value
                                ul.css(
                                    'left',
                                    ( tick < 0
                                    ? left + animation[ i++ ]
                                    : left - animation[ i++ ] )
                                    + 'px' );
                            };
                            
                        options.animator.addToQueue( loop ).start();
                    }
                    
                    /* Adding the buttons if specifyed in options
                     */
                    
                    if( options.showButtons )
                    {
                        /* Creating the buttons
                         */
                        
                        var leftButton = $( '<div />' )
                                .addClass( 'circus-slider-left-button' )
                                
                                /* Appending an empty element on the button
                                 * that could be used for styling with CSS.
                                 * ..it has no other purpose
                                 */
                                .append( $( '<div />' )),
                            
                            rightButton = $( '<div />' )
                                .addClass( 'circus-slider-right-button' )
                                .append( $( '<div />' ));
                                
                        /* Setting event listeners for the buttons
                         */

                        leftButton.click(
                            function()
                            {
                                slide( -1 );
                            });

                        rightButton.click(
                            function()
                            {
                                slide( 1 );
                            });
                        
                        /* Adding the buttons
                         */
                        
                        ul.parent()
                            .append( leftButton )
                            .append( rightButton );
                    }
                    
                    /* Adding the thumbnails if specifyed in options
                     */
                    
                    if( options.showThumbnails )
                    {
                        /* Creating the thumbnail container
                         */
                        
                        var thumbnailContainer = $( '<div />' )
                                .addClass(
                                    'circus-slider-thumbnail-container' );
                        
                        /* Adding the thumbnails to the container
                         */
                        
                        for( var i = 0, l = iniLiLength; i < l; i++ )
                            thumbnailContainer.
                                append(
                                    $( '<div />' )
                                        .addClass(
                                            'circus-slider-thumbnail' )
                                        
                                        // Setting the thumbnail index
                                        .attr( 'data-thumbnail', i )
                                        
                                        // Setting the event listener
                                        .click(
                                            function()
                                            {
                                                // Calculating a relevent path
                                                var go = $( this ).attr(
                                                            'data-thumbnail' )
                                                       - viewIndex;
                                                
                                                // Calculating closest path
                                                if( Math.abs( go ) > l / 2 )
                                                    go = go > 0
                                                       ? go - l
                                                       : l  + go;
                                                
                                                // Starts the animation
                                                slide( go );
                                            }));
                                            
                        /* Setting classname for active thumbnail
                         */
                        
                        $( '> .circus-slider-thumbnail:first-child',
                            thumbnailContainer )
                            .addClass( 'circus-slider-thumbnail-active' );
                        
                        /* Adding the thumbnail container to its wrapper
                         */
                        
                        var thumbnailsWrapper;
                        
                        switch( typeof options.thumbnailsWrapper )
                        {
                            case 'string':
                                thumbnailsWrapper = $(
                                    options.thumbnailsWrapper );
                                break;
                                
                            case 'object':
                                thumbnailsWrapper = options.thumbnailsWrapper;
                                break;
                            
                            case 'undefined':
                                thumbnailsWrapper = ul.parent();
                                break;
                        }
                        
                        thumbnailsWrapper.append( thumbnailContainer );
                        
                        /* Setting images as thumbnails if desired by the user,
                         * using first appering image
                         */
                        
                        if( options.useImagesForThumbnails )
                        {
                            var i = 0;
                            
                            // Setting relative pointers
                            thumbnailContainer = $(
                                '> .circus-slider-thumbnail-container', 
                                thumbnailsWrapper );
                            
                            // Looping through every thumbnail
                            $( '> div', thumbnailContainer ).each(
                                function()
                                {
                                    // The first image in the sliding position
                                    // will be represented as the thumbnail
                                    var img = $( 'img:first', li[ i++ ] );
                                    
                                    // Will not set any thumbnail if no image
                                    // is found
                                    if( img.length == 1 )
                                    {
                                        // Creating a new object so that we
                                        // have a relative scope for every
                                        // thumbnail.
                                        new (function( _this, src, w, h )
                                        {
                                            var img    = new Image();
                                            
                                            // Doing the magic onece the image
                                            // is done loading
                                            img.onload = function()
                                            {
                                                // Setting the thumbnail sizes
                                                // with some offset value
                                                var width  = w * 1.2,
                                                    height = h * 1.2;

                                                // Calculating the proportions
                                                if( this.width > this.height )
                                                    width = Math.round( 
                                                        width *
                                                        ( this.width
                                                        / this.height ));

                                                else
                                                    height = Math.round( 
                                                        height *
                                                        ( this.height
                                                        / this.width ));
                                                
                                                // Calculating the offset values
                                                var left = Math.round(
                                                         ( width  - w ) 
                                                         / 2 ),
                                                     
                                                    top  = Math.round(
                                                         ( height - h ) 
                                                         / 2 );
                                                
                                                // Setting the propertys
                                                img = $( img ).css(
                                                    {
                                                        'height':
                                                            height + 'px',
                                                        
                                                        'width':
                                                            width + 'px',
                                                        
                                                        'margin-top':
                                                            '-' + top + 'px',
                                                        
                                                        'margin-left':
                                                            '-' + left + 'px'
                                                    });
                                                
                                                // Adding the thumbnail to its
                                                // container
                                                $( _this ).append( img );
                                            }
                                            
                                            // Setting the image source after
                                            // we sat the onload event handler
                                            img.src = src;
                                            
                                        })( this,
                                            img.attr( 'src' ),
                                            $( this ).width(),
                                            $( this ).height() );
                                    }
                                });
                        }
                    }
                });
        
        return this;
    }
})( jQuery );