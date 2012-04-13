/*
    Circus Slider - jQuery plugin - Image slider 
    Copyright (C) 2011  Erik Landvall
    
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
     * Has the following options:
     * - showButtons
     */
    $.fn.circusSlider = function( options )
    {
        /* Updating the default options with user defined
         */
        
        options = $.extend(
            {
                // Determines if the buttons should be displayed
                'showButtons':
                    false,
                
                // Determines if thumbnails should be displayed
                'showThumbnails':
                    false
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
                    
                    /* Cloning elements
                     * 
                     * We need 5 li element for a nice flow and a good looking
                     * floded view.
                     */
                    
                    for( var i = li.length; i < 5; )
                        li.each(
                            function()
                            {
                                i++;
                                ul.append( $( this ).clone( true ));
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
                    
                    /* Defines the animation function that slides the slider
                     */
                        
                    var slide = function( slide )
                    {
                        // Prevents this animation from starting if there's
                        // already an animation running
                        if( ani )
                            return;

                        // Prevents other animations from starting
                        ani = true;
                        
                        // Calculating the new viewIndex
                        var liLength = $( '> li', ul ).length;
                        viewIndex += slide;
                        
                        // Keeping the view index relevent
                        while( viewIndex >= liLength )
                            viewIndex -= liLength;
                        while( viewIndex < 0 )
                            viewIndex = liLength + viewIndex;
                        
                        var // Calculating the animation length
                            length = width * Math.abs( slide ),
                        
                            // Calculating new position value
                            left = slide < 0
                                 ? ul.position().left - length
                                 : ul.position().left + length,
                            
                            // Retrives the animation array
                            animation = halfMoonAnimation( length );

                        // Moves the endblock up front or vice versa
                        for( var n = 0; n < Math.abs( slide ); n++ )
                            slide < 0
                                ? ul.prepend( $( '> li', ul ).last() )
                                : ul.append( $( '> li', ul ).first() );
                            
                        // Positioning the content accordingly
                        ul.css( 'left', left + 'px' );

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
                                    ani = false;
                                    return;
                                }

                                // Sets the new position value
                                ul.css(
                                    'left',
                                    ( slide < 0
                                    ? left + animation[ i++ ]
                                    : left - animation[ i++ ] )
                                    + 'px' );
                            },
                            20 );
                    }
                    
                    /* Adding the buttons if so desired by the user
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
                    
                    if( options.showThumbnails )
                    {
                        /* Creating the thumbnail container
                         */
                        
                        var thumbnailContainer = $( '<div />' )
                                .addClass(
                                    'circus-slider-thumbnail-container' );
                        
                        /* Adding the thumbnails to the container
                         */
                        
                        for( var i = 0, l = $( '> li', ul ).length; i < l; i++ )
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
                        
                        /* Adding the thumbnail container
                         */
                        
                        ul.parent()
                            .append( thumbnailContainer );
                    }
                });
        
        return this;
    }
})( jQuery );