'use strict';

;(function() {

    var isEditing = false,
        isVisible = false,
        isClicked = false,
        isDragging = false,
        markerEdit = false,
        mark = $('<ul class="map-mark"><li class="map-mark__item"><div class="btn-style select" data-id="1"><span class="select-txt">МЕСТО</span><i class="select-icn"></i></div></li><li class="map-mark__item"><input type="text" placeholder="Название" class="map-mark__name btn-style"></li><li class="map-mark__item"><button class="js-but btn-style map-mark__button js-add"><i class="icon icon-add"></i></button><button class="js-but btn-style map-mark__button js-cansel"><i class="icon icon-cansel"></i></button></li></ul>'),
        pointObj = {},
        counter = 0,
        editElIndex,
        points = {};


    getSwitcher().on('click', editToggle);

    $(document)
        .on('click', '.js-but', buttonClick)
        .on('keyup', getName(), function() {
            validate(true);
        })
        .on('click', '.js-remove', removePoint)
        // Режим редактирования маркера
        .on('click', '.mini-mark', function() {

            if (!isEditing) return;

            var self = $(this);

            editElIndex = self.attr('data-index');
            pointObj = points[ editElIndex ];

            mark.css({
                left: self.position().left + (self.outerWidth(true) / 2 + 3),
                top: self.position().top + self.height() + 23
            }).addClass('map-mark_edit');

            setid( pointObj.id );
            getName().val( pointObj.name );
            mark.find('.js-add').html('<i class="icon icon-save"></i>');
            if ( !$('.js-remove').length ) mark.find('.js-cansel').after('<button class="map-mark__button btn-style js-remove"><i class="icon icon-remove"></i></button>');
            markerEdit = true;
            
        })
        .on('click', '.select', selectId)
        .on('click', '.js-btn-filter', setFilter)
        .on('keydown', function( e ) {
            if ( e.keyCode == 27 ) canselMark();
        });


    getMap()
        .on('mousedown', function() { isClicked = true })
        .on('mouseup', function() { setTimeout( function() {isClicked = false}, 0) })
        .on('mousemove', function() {
            if ( isClicked ) isDragging = true;
            else isDragging = false;
        })


    /**
     * Возвращает карту
     */
    function getMap() { return $('.map') }

    /**
     * Возвращает переключатель редактирования
     */
    function getSwitcher() { return $('.edit-button') }

    /**
     * Возвращает переключатель редактирования
     */
    function getName() { return $('.map-mark__name') }


    /**
     * Включает/выключает режим редактирования карты
     *
     */
    function editToggle() {

        getSwitcher().toggleClass('btn-style2_enable');

        if ( !isEditing ) {

            getMap().on('click', point);
            isEditing = true;

        } else {

            getMap().off('click', point);
            isEditing = false;

        }

    }

    /**
     * Установка / редактирование точек на карте
     *
     */
    function point( e ) {

        // Если происходит драгинг карты, то ничего не делаем
        if ( isDragging ) return;

        // Если попапа нет в DOM
        // то добавляем его в DOM n показываем 
        if ( !$('.map-mark').length ) {

            mark.appendTo( getMap() );
            setPosition();
            isVisible = true;

        // Если он есть уже в DOM,
        // просто показываем
        } else {

            // Если он в данный момент скрыт,
            // то показываем
            if ( !isVisible ) {

                mark = $('.map-mark');
                mark.show();
                setPosition();
                isVisible = true;

            }
        }


        /**
         * Устанавливает позиции точки
         */
        function setPosition() {
            mark.show().css({
                top: e.pageY - getMap().offset().top,
                left: e.pageX - getMap().offset().left
            });
        }

    }


    /**
     * Отменяет установку метки
     */
    function canselMark() {
        validate(true);
        mark.hide(150);
        isVisible = false;
        markerEdit = false;
        clearPoint();
    }


    function buttonClick( e ) {

        if ( $(this).hasClass('js-cansel') ) {

            canselMark();

        } else {

            if ( getName().val() == '' ) validate(false);
            else pointSaver();

        }

    }

    /**
     * Валидация обязательных полей
     *
     * @param {state} boolean
     */
    function validate( state ) {

        var error = 'map-mark__name_error';

        if (!state) {
            getName().removeClass(error)
            .addClass(error);
        }
        else getName().removeClass(error);

    }

    /**
     * Сохраняет параметры точки
     *
     * @param {string} str
     */
    function pointSaver() {

        pointObj = {
            id: +mark.find('.select').attr('data-id'),
            name: getName().val(),
            position: [mark.position().left, mark.position().top]
        };


        counter++;
        points[counter] = pointObj;

        mark.hide();
        clearPoint();
        isVisible = false;

        buildPoint( pointObj );

    }


    /**
     * Очищает поля попапа создаваемой точки
     *
     */
    function clearPoint() {

        mark.find('.js-add').html('<i class="icon icon-add" />');
        $('.js-remove').remove();
        getName().val('');
        setid(1);
        mark.removeClass('map-mark_edit');

    }


    /**
     * Создает отмеченную точку на карте в виде маркера
     *
     * @param {obj} object
     */
    function buildPoint( obj ) {

        var miniMark = $('<div class="mini-mark" data-id="'+ obj.id +'" data-index="'+ counter +'"><i class="icon mini-mark__icon" /><span class="mini-mark__name">'+ obj.name +'</span></div>');
        
        miniMark.appendTo( getMap() ).css({
            position: 'absolute',
            left: obj.position[0] - (miniMark.outerWidth(true) / 2 + 3),
            top: obj.position[1] - miniMark.outerHeight(true) - 15
        });

        if (obj.id === 1) {
            miniMark.addClass('mini-mark_place')
            .find('.icon').addClass('icon-globe');
        } else {
            miniMark.addClass('mini-mark_human')
            .find('.icon').addClass('icon-male');
        }

        if (markerEdit) removePoint();

    }

    /**
     * Удаляет метку с карты и из списка объектов
     */
    function removePoint() {

        if (isEditing) {

            // Удаляет элемент объекта из общего списка
            delete points[editElIndex];

            // Удаляет маркер с самой карты
            $('.mini-mark[data-index="'+ editElIndex +'"]').remove();

            mark.hide();
            isVisible = false;
            clearPoint();

        }

    }

    /**
     * Контрол выбора id для метки
     */
    function selectId() {

        var self = $(this),
            id = +self.attr('data-id');

        self.toggleClass('select_human');

        if (id === 1) setid( 2 );
        else setid( 1 );

    }

    /**
     * Устанавливает указанный id в поле выбора назначения
     */
    function setid( id ) {
        
        var select = mark.find('.select'),
            field = select.find('.select-txt');

        if (id === 1) {

            field.text('место');
            id = 1;
            getName().attr('placeholder', 'название');
            select.removeClass('select_human');

        } else {

            field.text('человек');
            id = 2;
            getName().attr('placeholder', 'имя');
            select.addClass('select_human');

        }
        select.attr('data-id', id);

    }


    function setFilter() {

        var icon = $(this).find('.icon');

        $(this).toggleClass('btn-style2_enable');

        if ( icon.hasClass('icon-male') ) getMap().toggleClass('map_human_hide');
        else getMap().toggleClass('map_places_hide');

    }

 
})();

// BUG: эффект зумирования карты
// BUG: фильтры некорректно работают