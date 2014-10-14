'use strict';

;(function() {

    var wrapper = $('.main'),
        isDragging = false,
        map = wrapper.find('.map'),
        mapParent = map.parent(),
        zoomer = wrapper.find('.zoom-button'),
        originmapW = map.width(),
        originmapH = map.height(),
        isZoomed = false,
        clickPos = [],
        left,
        top;

    // Центрируем карту
    setByCenter();
    $(window).on('resize', setByCenter);


    // Меняем флаг isDragging при нажатии/отпускании мыши
    map.on('mousedown', function(e) {

        if ( $(e.target).is(map) || $(e.target).is('img', map) ) {
            
            isDragging = true;

            clickPos[0] = e.pageX;
            clickPos[1] = e.pageY;

            left = +map.css('left').slice(0, -2);
            top = +map.css('top').slice(0, -2);

            return false;
            
        }

    });

    mapParent.on('mouseup', function( e ) {

        var target = $(e.target);

        isDragging = false;
        if ( target.is( $('img', map) ) || target.is( map ) ) animate();
        toStartPosition();

    });

    // Увеличиваем масштаб по клику по кнопке
    zoomer.on('click', zoom);

    // Перетаскивание карты
    map.on('mousemove', function( e ) {

        if (isDragging) {

            map.css({
                left: e.clientX - clickPos[0] + left,
                top: e.clientY - clickPos[1] + top
            });

        }
        cursorOn();

    });


    /**
     * Центрирует элемент
     * 
     */
    function setByCenter() {

        map.css({
            top: ( mapParent.height() - map.height() ) / 2,
            left: ( mapParent.width() - map.width() ) / 2
        })

    }


    /**
     * Возвращает маркеры если они есть на карте
     */
    function getMarkers() {
        return $('.mini-mark');
    }

    /**
     * Проверяет флаг
     * Увеличивает либо уменьшает карту
     * 
     */
    function zoom() {

        if ( !isZoomed ) {

            zoomer.addClass('btn-style2_enable').find('.icon').toggleClass('icon-zoom-out-1 icon-zoom-in-1');
            isZoomed = true;

            map.width( originmapW * 2 )
            .height( originmapH * 2 );


            getMarkers().each(function() {
                var self = $(this);
                self.css({
                    left: self.position().left * 2 + self.width() / 2,
                    top: self.position().top * 2 + self.height()
                })
            })

        } else {
            
            zoomer.removeClass('btn-style2_enable').find('.icon').toggleClass('icon-zoom-out-1 icon-zoom-in-1');
            isZoomed = false;

            map.width( originmapW )
            .height( originmapH );

            getMarkers().each(function() {
                var self = $(this);
                self.css({
                    left: self.position().left / 2 - (self.width() / 2) / 2,
                    top: self.position().top / 2 - self.height() / 2
                })
            })

        }
        setByCenter();
        animate();

    }


    /**
     * Добавляет класс для анимации
     * После проигрывания класс удаляется
     *
     */
    function animate() {

        var cl = 'animate';

        map.addClass(cl);
        setTimeout( function() {
            map.removeClass(cl);
        }, 300);

    }

    /**
     * Возвращает карту в исходную позицию
     *
     */
    function toStartPosition() {

        var posX = map.offset().left,
            posY = map.offset().top,
            mapW = map.width(),
            mapH = map.height(),
            viewportW = mapParent.width(),
            viewportH = mapParent.height();

        // Если карта меньше вьюопрта по ширине
        if ( mapW < viewportW ) map.css('left', ( viewportW - mapW ) / 2 );
        else {
            // Если карта оттягивается, то возвращать ее кначалу вьюпорта
            // по горизонтали
            animate();
            if ( posX > 0 ) {
                map.css('left', 0);
            }
            if ( mapW + posX <= viewportW ) map.css('left', -( mapW - viewportW ) );
        }

        // Если карта меньше вьюпорта по высоте
        if ( mapH < viewportH ) map.css('top', ( viewportH - mapH ) / 2 );
        else {
            // Если карта оттягивается, то возвращать ее кначалу вьюпорта
            // по вертикали
            animate();
            if ( posY > 0 ) {
                map.css('top', 0);
            }
            if ( mapH + posY <= viewportH ) map.css('top', -( mapH - viewportH ) );

        }
    }

    /**
     * Устанавливает курсор в виде тянужей руки
     *
     * @param {state} boolean
     */
    function cursorOn() {

        if (!isDragging) {
            map.removeClass('is-dragging');
            return;
        }
        map.addClass('is-dragging');

    }

 
})();