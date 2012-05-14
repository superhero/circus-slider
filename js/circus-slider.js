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
     * - thumbnailsWrapper [selector]
     */
    $.fn.circusSlider = function( options )
    {
        /* Updating the default options with user defined
         */
        
        options = $.extend(
            {
                // Cashes events
                'eventCash':
                    true,
                
                // Determines if the buttons should be displayed
                'showButtons':
                    false,
                
                // Determines if thumbnails should be displayed
                'showThumbnails':
                    false,
                
                // Allows the user to specify a wrapper that containes the
                // thumbnail container
                // ..defaults to viewport
                'thumbnailsWrapper':
                    undefined
            },
            options );
        
        /* The function that calculates the animation movement
         */
        
        var halfMoonAnimation = function( distance, speed )
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

                    var ani = false;
                    
                    /* Determines what view we are currently viewing
                     */
                    
                    var viewIndex = 0;
                    
                    /* Cashes event if animation is currently running.
                     */
                    
                    var eventCash = null;
                    
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
                                    $( 'li:nth(' + ( iniLiLength - 1 ) + ')', ul )
                                        .clone( true, true ) )
                                        
                                : ul.append(
                                    $( 'li:nth(' + n + ')', ul )
                                        .clone( true, true ) );

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
                        var i  = 0,
                            l  = animation.length,
                            id = setInterval(
                            function()
                            {
                                // Will clear interval if we reached the end
                                if( i == l )
                                {
                                    clearInterval( id );
                                    
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
                            },
                            20 );
                    }
                    
                    /* Adding the buttons if specifyed in options
                     */
                    
                    if( options.showButtons )
                    {
                        /* Creating the buttons
                         */
                        
                        var leftButton = $( '<div />' )
                                .addClass( 'circus-slider-left-button' ),
                            
                            rightButton = $( '<div />' )
                                .addClass( 'circus-slider-right-button' );
                                
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
                                thumbnailsWrapper = $( options.thumbnailsWrapper );
                                break;
                                
                            case 'object':
                                thumbnailsWrapper = options.thumbnailsWrapper;
                                break;
                            
                            case 'undefined':
                                thumbnailsWrapper = ul.parent();
                                break;
                        }
                        
                        thumbnailsWrapper.append( thumbnailContainer );
                    }
                });
        
        return this;
    }
})( jQuery );