(function() {

    "use strict";

    function context(config, handler) {

        let settings = JSON.parse(config),
            build_menu, statusMenu = false;

        /**
         * Initialization main functions
         */
        function init() {

            /**
             * Initialization methods
             */
            buildMenu(settings.menu_items);
            contextMenuInit();
            documentEvent();
        }

        /**
         * We hail an event to an element
         */
        function contextMenuInit() {
            document.addEventListener("contextmenu", function (e) {
                if (clickOnItem(e, settings.element)) {
                    e.preventDefault();
                    contextMenuOn();
                    setContextMenuFitted();
                    setContextMenuPosition();
                } else contextMenuOff();
            });
        }

        /**
         * Click on document
         */
        function documentEvent() {
            document.addEventListener("click", function (e) {
                if (!clickOnItem(e, 'submenu') && !clickOnItem(e, 'arrow')) contextMenuOff();
            });
        }

        /**
         * Render menu with settings
         *
         * @param menu
         * @param element
         */
        function buildMenu(menu, element) {
            let ul = document.createElement("UL");

            for (let i = 0; i < menu.length; i++) {

                let li = document.createElement("LI");
                let node_text = document.createTextNode(menu[i].title);
                li.appendChild(node_text);

                ul.appendChild(li);

                if (!menu[i].disabled) {
                    if (menu[i].submenu) {
                        buildMenu(menu[i].submenu, li);
                        itemBehavior(li, 'submenu');
                    }
                    if (menu[i].click_handler) itemBehavior(li, 'handler');

                }

                if (menu[i].disabled) itemBehavior(li, 'disabled');

            }

            if (element) {
                element.appendChild(ul);
                element.setAttribute("class", "submenu");
            }

            build_menu = ul;
        }

        /**
         * Add event to items
         *
         * @param element
         * @param type
         */
        function itemBehavior(element, type) {
            switch (type) {
                case 'submenu': {
                    element.addEventListener("click", function (e) {
                        if (e.target.classList.contains('submenu')) {
                            e.stopPropagation();
                            let node = element.getElementsByTagName('ul')[0];
                            node.style.display === 'block'
                                ? node.style.display = "none"
                                : node.style.display = "block";
                        }
                    });
                }; break;
                case 'disabled': {
                    element.style.background = "#fafafa";
                    element.style.cursor = "none";
                    element.style.color = "#cecece";
                }; break;
                case 'handler': {
                    element._handlerOn = true;
                    element.onclick = function (e) {
                        if (e.target._handlerOn) handler(e);
                    };
                }; break;
            }
        }

        /**
         * Function to show context menu
         */
        function contextMenuOn() {
            if (statusMenu) build_menu.style.display = "block";
            else {
                document.getElementById(settings.element).appendChild(build_menu);
                statusMenu = true;
            }
        }


        /**
         * Set context menu position
         * @param e
         */
        function setContextMenuPosition(e) {

            let position_x = 0, position_y = 0, event = e || window.event,
                offsetHeight = build_menu.offsetHeight,
                offsetWidth = build_menu.offsetWidth,
                windowHeight = window.innerHeight,
                clientY = event.clientY,
                element_width = document.getElementById(settings.element).offsetWidth;

            if (event.pageX || event.pageY) {
                position_x = event.pageX;
                position_y = event.pageY;
            } else if (event.clientX || event.clientY) {
                position_x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                position_y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }

            if ((clientY + offsetHeight) > windowHeight) {
                position_y -= (clientY + offsetHeight) - windowHeight + 10;
                if (event.offsetX > element_width / 2) {
                    position_x -= offsetWidth + 5;
                }
            }
            build_menu.style.top = position_y + "px";
            build_menu.style.left = position_x + "px";
        }

        /**
         * Close context menu
         */
        function contextMenuOff() {

            build_menu.style.display = "none";

            let sub = build_menu.getElementsByTagName('ul');
            for (let i = 0; i < sub.length; i++) {
                sub[i].style.display = "none";
            }
        }

        /**
         * Menu fitted
         */
        function setContextMenuFitted() {
            if (build_menu.offsetHeight > window.innerHeight) {

                for (let i = build_menu.childNodes.length - 1; i > 0; i--) {
                    if ((build_menu.offsetHeight + build_menu.childNodes[0].offsetHeight / 2) > window.innerHeight) {
                        build_menu.childNodes[i].style.display = "none"
                    }
                }

                if (!build_menu.getElementsByClassName('arrow').length) {
                    let arrow_top = document.createElement("A");
                    arrow_top.className = "arrow top";
                    arrow_top.style.display = "none";
                    build_menu.insertBefore(arrow_top, build_menu.childNodes[0]);

                    let arrow_bottom = document.createElement("A");
                    arrow_bottom.className = "arrow bottom";
                    build_menu.appendChild(arrow_bottom);

                    arrow_bottom.addEventListener("click", function () {

                        let b_pos_bottom;

                        for (let i = 0; i < build_menu.childNodes.length; i++) {
                            if (!build_menu.childNodes[i].classList.contains('arrow') && (build_menu.childNodes[i].style.display === "block" || !build_menu.childNodes[i].style.display)) {
                                build_menu.childNodes[i].style.display = "none";
                                b_pos_bottom = i;
                                break;
                            }
                        }
                        for (let i = b_pos_bottom; i < build_menu.childNodes.length; i++) {
                            if (build_menu.childNodes[i].style.display === "none" && i > b_pos_bottom) {
                                arrow_top.style.display = "block";
                                build_menu.childNodes[i].style.display = "block";
                                if (i === build_menu.childNodes.length - 2) {
                                    arrow_bottom.style.display = "none";
                                }
                                break;
                            }
                        }

                    });

                    arrow_top.addEventListener("click", function () {

                        let b_pos_top;

                        for (let i = build_menu.childNodes.length - 1; i > 0; i--) {
                            if (!build_menu.childNodes[i].classList.contains('arrow') && build_menu.childNodes[i].style.display === "block") {
                                build_menu.childNodes[i].style.display = "none";
                                b_pos_top = i;
                                break;
                            }
                        }
                        for (let i = b_pos_top; i > 0; i--) {
                            if (build_menu.childNodes[i].style.display === "none" && b_pos_top > i) {
                                build_menu.childNodes[i].style.display = "block";
                                arrow_bottom.style.display = "block";
                                if (i === 1) {
                                    arrow_top.style.display = "none";
                                }
                                break;
                            }
                        }


                    });
                }
            }
        }

        /**
         * Helper function
         *
         * @param e
         * @param itemById
         * @returns {*}
         */
        function clickOnItem(e, itemById) {

            let el = e.srcElement || e.target;
            switch (itemById) {
                case 'submenu': {
                    while ((el = el.parentNode) && el.id !== 'context_menu') ;
                    return el && e.target.classList.contains('submenu');
                }; break;
                case 'arrow': {
                    return e.target.classList.contains('arrow');
                };break;
                default: {
                    while ( el = el.parentNode ) {
                        if ( el.id && el.id === itemById) {
                            return el;
                        }
                    }
                }
            }
            return false;
        }

        /**
         * Init application
         */
        init();
    }
    context('{"element":"context_menu","menu_items":[{"click_handler":false,"title":"Item 1","disabled":false,"submenu":[{"click_handler":true,"title":"Item 1","disabled":false},{"click_handler":false,"title":"Item 2","disabled":false,"submenu":[{"click_handler":true,"title":"Item 77","disabled":false}]}]},{"click_handler":true,"title":"Item 2","disabled":false,"submenu":false},{"click_handler":false,"title":"Item 3","disabled":false,"submenu":false},{"click_handler":false,"title":"Item 4","disabled":false,"submenu":false},{"click_handler":false,"title":"Item 5","disabled":false,"submenu":false},{"click_handler":false,"title":"Item 6","disabled":false,"submenu":false},{"click_handler":false,"title":"Item 7","disabled":false,"submenu":false},{"click_handler":false,"title":"Item 8","disabled":true,"submenu":false},{"click_handler":false,"title":"Item 9","disabled":false,"submenu":false},{"click_handler":false,"title":"Item 10","disabled":false,"submenu":false},{"click_handler":false,"title":"Item 11","disabled":false,"submenu":false},{"click_handler":false,"title":"Item 12","disabled":false,"submenu":false}]}', function (e) {alert('This is handler')});
})();
