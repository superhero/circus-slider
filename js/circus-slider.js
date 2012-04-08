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
     * - Too few li elements
     */
    $.fn.circusSlider = function()
    {
        /* The function that calculates the animation
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

                    if( li.length < 5 )
                        throw 'Too few li elements';
                    
                    /* Creating the viewport and buttons
                     */
                    
                    var viewPort   = $( '<div />' )
                            .addClass( 'circus-slider-viewport' ),
                            
                        leftButton = $( '<div />' )
                            .addClass( 'circus-slider-left-button' ),
                            
                        rightButton = $( '<div />' )
                            .addClass( 'circus-slider-right-button' );
                    
                    /* Setting sizes
                     */
                    
                    var width = li.first().width();
                    viewPort.width( width );
                    ul.width( width * li.length );
                    
                    /* Setting positions
                     */
                    
                    ul.css( 'left', '-' + ( width * 2 ) + 'px' );
                            
                    /* Combined variables used in the animation
                     * 
                     * A handle to a flag that determines if an animation is
                     * currently running.
                     * 
                     * Retrives the animation array
                     */
                    
                    var ani       = false,
                        animation = halfMoonAnimation( width );
                            
                    /* Setting event listeners
                     */
                    
                    leftButton.click(
                        function()
                        {
                            // Wont start if animation is currently running
                            if( ani )
                                return;
                            
                            // Stops other animation to start
                            ani = true;
                            
                            // Calculating new position value
                            var left = ul.position().left - width;

                            // Moves the endblock up front
                            ul.prepend( $( 'li', ul ).last() );
                            ul.css( 'left', left + 'px' );

                            // Starts the animation
                            var i       = 0,
                                length  = animation.length,
                                id      = setInterval(
                                function()
                                {
                                    // Will clear interval if we reached the end
                                    if( i == length)
                                    {
                                        clearInterval( id );
                                        ani = false;
                                        return;
                                    }

                                    // Sets the new position value
                                    ul.css(
                                        'left',
                                        ( left + animation[ i++ ] ) + 'px' );
                                },
                                20 );
                        });
                        
                    rightButton.click(
                        // See eventlistenr for left button for documentation
                        function()
                        {
                            if( ani )
                                return;
                            
                            ani = true;
                            
                            var left = ul.position().left + width;

                            ul.append( $( 'li', ul ).first() );
                            ul.css( 'left', left + 'px' );

                            var i       = 0,
                                length  = animation.length,
                                id      = setInterval(
                                function()
                                {
                                    if( i == length)
                                    {
                                        clearInterval( id );
                                        ani = false;
                                        return;
                                    }

                                    ul.css(
                                        'left',
                                        ( left - animation[ i++ ] ) + 'px' );
                                },
                                20 );
                        });
                    
                    /* Adding the viewport and buttons
                     */
                        
                    ul.wrap( viewPort )
                        .parent()
                            .append( leftButton )
                            .append( rightButton );
                    
                });
        
        return this;
    }
})( jQuery );