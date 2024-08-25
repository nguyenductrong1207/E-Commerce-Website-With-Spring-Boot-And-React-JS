/**
 /**
 Core script to handle the entire theme and core functions
 **/

var Bookland = function () {
    /* CUSTOM JS */

    $(document).ready(function () {
        // add to cart in book detail
        $("#buttonAddToCart").on("click", function (evt) {
            addToCart();
        });
        // add to cart in other page
        $(document).on("click", ".otherAddToCart", function (evt) {
            var bookId = $(this).data("book-id");
            otherAddToCart(bookId);
        });
        $(".minus").on("click", function (evt) {
            evt.preventDefault();
            decreaseQuantity($(this));
        });
        $(".plus").on("click", function (evt) {
            evt.preventDefault();
            increaseQuantity($(this));
        });
        $(".removeBook").on("click", function (evt) {
            evt.preventDefault();
            removeBook($(this));
        });
        updateNumberOfCartItems();
    });

    /* Show Change Password Form */
    var showChangePasswordForm = () =>{
        var triggerTabList = [].slice.call(document.querySelectorAll('#profile-functions li a'))
        triggerTabList.forEach(function (triggerEl) {
            var tabTrigger = new bootstrap.Tab(triggerEl)

            triggerEl.addEventListener('click', function (event) {
                event.preventDefault()
                tabTrigger.show()
            })
        })
    }

    function handleSelectedItems() {
        $('#selectedItems').on('change', function (){
            if($(this).is(":checked")) {
                let selectedItems = $(this).val();
                let price = $('#row'+selectedItems+' .subtotal').html();
                let total = $('.total').html();
                let newTotal = Number(price.substring(2)) + Number(total.substring(2));
                console.log(selectedItems, price , total, newTotal)

                $('.total').html(newTotal);
            }
        })
    }

    function addToCart() {
        quantity = $("#quantity" + bookId).val();
        url = contextPath + "shop-cart/add/" + bookId + "/" + quantity;

        $.ajax({
            type: "POST",
            url: url,
            beforeSend: function (xhr) {
                xhr.setRequestHeader(csrfHeaderName, csrfValue);
            }
        }).done(function () {
            updateNumberOfCartItems();
            $(".msg").html("Add Successfully")
            toastNotification();
        }).fail(function () {
            $(".alert.error .msg").html("You must login before adding")
            toastNotification();
        });
    }

    function otherAddToCart(bookId) {
        var quantity = 1;
        var url = contextPath + "shop-cart/add/" + bookId + "/" + quantity;

        $.ajax({
            type: "POST",
            url: url,
            beforeSend: function (xhr) {
                xhr.setRequestHeader(csrfHeaderName, csrfValue);
            }
        }).done(function () {
            updateNumberOfCartItems();
            $(".msg").html("Add Successfully");
            toastNotification();
        }).fail(function () {
            $(".alert.error .msg").html("You must login before adding");
            toastNotification();
        });
    }

    function decreaseQuantity(link) {
        bookId = link.attr("pid");
        quantityInput = $("#quantity" + bookId);
        // newQuantity = parent(quantityInput.val()) - 1;
        newQuantity = parseInt(quantityInput.val()) - 1;

        if (newQuantity > 0) {
            quantityInput.val(newQuantity);
            updateQuantity(bookId, newQuantity);
        } else {
            alert("Minimum quantity is 1");
        }
    }

    function increaseQuantity(link) {
        bookId = link.attr("pid");
        quantityInput = $("#quantity" + bookId);
        // newQuantity = parent(quantityInput.val()) + 1;
        newQuantity = parseInt(quantityInput.val()) + 1;


        if (newQuantity <= 20) {
            quantityInput.val(newQuantity);
            updateQuantity(bookId, newQuantity);
        } else {
            alert("Maximum quantity is 20");
        }
    }

    function updateQuantity(bookId, quantity) {
        url = contextPath + "shop-cart/update/" + bookId + "/" + quantity;

        $.ajax({
            type: "POST",
            url: url,
            beforeSend: function (xhr) {
                xhr.setRequestHeader(csrfHeaderName, csrfValue);
            }
        }).done(function (updatedSubtotal) {
            updateSubtotal(updatedSubtotal, bookId);
            updateTotal();
            updateNumberOfCartItems();
        }).fail(function () {
            alert("Error while updating book to shopping cart.");
        });
    }

    function updateSubtotal(updatedSubtotal, bookId) {
        // formattedSubtotal = $.number(updatedSubtotal, 2);
        formattedSubtotal = updatedSubtotal;
        $("#subtotal" + bookId).text("$ " + formattedSubtotal);
    }

    function updateTotal() {
        total = 0.0;
        bookCount = 0;

        $(".subtotal").each(function (index, element) {
            bookCount++;
            total += parseFloat(element.innerHTML.replaceAll("$ ", ""));
        });

        if (bookCount < 1) {
            showEmptyShoppingCart();
        } else {
            // formattedTotal = $.number(total, 2);
            formattedTotal = total;
            $("#total").text("$ " + formattedTotal);
        }
    }

    function removeBook(link) {
        url = link.attr("href");

        $.ajax({
            type: "DELETE",
            url: url,
            beforeSend: function (xhr) {
                xhr.setRequestHeader(csrfHeaderName, csrfValue);
            }
        }).done(function (response) {
            rowNumber = link.attr("rowNumber");
            removeBookHTML(rowNumber);
            updateTotal();
            updateCountNumbers();
            updateNumberOfCartItems();
            $(".msg").html("Remove Book Successfully.");
            toastNotification();
        }).fail(function () {
            alert("Error while removing book.");
        });
    }

    function removeBookHTML(rowNumber) {
        $("#row" + rowNumber).remove();
    }

    function updateCountNumbers() {
        $(".divCount").each(function (index, element) {
            element.innerHTML = "" + (index + 1);
        });
    }

    function showEmptyShoppingCart() {
        $("#sectionTotal").hide();
    }

    function updateNumberOfCartItems() {
        $.ajax({
            type: "GET",
            url: contextPath + "shop-cart/total-items",
            beforeSend: function (xhr) {
                xhr.setRequestHeader(csrfHeaderName, csrfValue);
            }
        }).done(function (numberOfItems) {
            $(".numberOfCartItems").text(numberOfItems);
        }).fail(function () {
            alert("Error while fetching number of items in the cart.");
        });
    }


    /* Add the "active" class.*/
    function addActiveClass(path) {
        var current = location.pathname.split("/").slice(-1)[0];
        var navLinks = document.querySelectorAll(path);

        for (var i = 0; i < navLinks.length; i++) {
            if (navLinks[i].getAttribute("href") == current) {
                navLinks[i].classList.add("active");
                break;
            }
        }
    }

    /* Show password */
    var showPassword = function () {
        $(".toggle-password").click(function () {
            $(this).toggleClass("fa-eye fa-eye-slash");
            var input = $($(this).attr("toggle"));
            if (input.attr("type") === "password") {
                input.attr("type", "text");
            } else {
                input.attr("type", "password");
            }
        });
    }

    /* Toast Notification*/
    var toastNotification = () => {
        $('.alert').removeClass("hide").addClass("show showAlert");
        setTimeout(function () {
            $('.alert').addClass("hide").removeClass("show");
        }, 3000);

        $('.alert .close-btn').on("click", function () {
            console.log("click")
            $('.alert').addClass("hide").removeClass("show");
        });
    }

    /* check Password Match */
    var checkPassword = () => $('#confirm-password').on("input", function () {
        console.log($(this).val());
        if ($(this).val() !== $("#reset-password").val()) {
            $('.warning-text').text("* Passwords do not match!").css("display", "block");
            $('#confirm-change-password button').prop("disabled", true);
        } else {
            $('.warning-text').text("").css("display", "none");
            $('#confirm-change-password button').prop("disabled", false);
        }
    })

    /* Get location using fetch API */
    var locationAPI = function () {
        $.getJSON('https://esgoo.net/api-tinhthanh/1/0.htm', function (provinceData) {
            if (provinceData.error == 0) {

                $.each(provinceData.data, function (provinceKey, provinceVal) {
                    $("#province").append('<option value="' + provinceVal.id + ' '
                        + provinceVal.full_name_en + '">' + provinceVal.full_name_en + '</option>');
                });

                $("#province").change(function (e) {
                    var provinceId = $(this).val().slice(0, 2);
                    $(".province-text").html($(this).val().slice(2));

                    //fetch Province
                    $.getJSON('https://esgoo.net/api-tinhthanh/2/' + provinceId + '.htm', function (districtData) {
                        if (districtData.error == 0) {
                            $.each(districtData.data, function (districtKey, districtVal) {
                                $("#district").append('<option value="' + districtVal.id + ' '
                                    + districtVal.full_name_en + '">' + districtVal.full_name_en + '</option>');
                            });

                            //fetch Ward
                            $("#district").change(function (e) {
                                var districtId = $(this).val().slice(0, 3);
                                $(".district-text").html($(this).val().slice(3));

                                $.getJSON('https://esgoo.net/api-tinhthanh/3/' + districtId + '.htm', function (wardData) {
                                    if (wardData.error == 0) {
                                        $.each(wardData.data, function (wardKey, wardVal) {
                                            $("#ward").append('<option value="' + wardVal.full_name_en + '">' + wardVal.full_name_en + '</option>');
                                        });
                                    }

                                    $("#ward").change(function (e) {
                                            $(".ward-text").html($(this).val());
                                        }
                                    );
                                });
                            });
                        }
                    });
                });
            }
        });
    }

    // update profile image using cloudinary
    var myWidget = () => {
        // const securityContextString = sessionStorage.getItem('SPRING_SECURITY_CONTEXT');
        // if (securityContextString) {
        //     const securityContext = JSON.parse(securityContextString);
        //     const authentication = securityContext.authentication;
        //     const userDetails = authentication.principal;
        //     var userId = userDetails.user.id;
        // }
        //
        // window.cloudinary.createUploadWidget({
        //         cloudName: 'dggujnlln',
        //         apiKey: '235581846542298',
        //         folder: `/Client/${userId}`
        //     }, (error, result) => {
        //         if (!error && result && result.event === "success") {
        //             var url = result.info.secure_url;
        //
        //             $.ajax({
        //                 url: `http://localhost:8080/profile/update-avatar/${url}`,
        //                 type: 'POST',
        //                 success : function (){
        //                     document.querySelector(".avatar")
        //                         .setAttribute("src", url);
        //                     $(".alert.success .msg").html("Update your avatar successfully")
        //                 }
        //             })
        //         }else {
        //             $(".alert.error .msg").html(error)
        //         }
        //         toastNotification();
        //     }
        // )
        // document.querySelector(".my-image").addEventListener("click", function(){
        //     myWidget.open();
        // }, false);
    }

    var checkLocation = function () {
        var currentType = location.pathname.split("/").slice(-1)[0].slice(0, 5);

        if (currentType !== "books") {
            // add active class to nav bar.
            addActiveClass(".header-nav .nav>li>a");
        } else {
            // add active class to books nav link.
            addActiveClass(".filter-area .grid-area .nav .nav-item .nav-link");
        }
    }

    /*Connect to admin*/
    var connectToAdmin = function () {
        $('#admin').on("click", function () {
            $('#admin').attr('href', '../Admin/admin-dashboard.html');
        });
    };

    /* Responsive Categories*/
    var responsiveCategories = function () {
        if ($(window).width() <= 992) {
            $(".category-sub-menu").addClass("sub-menu");
            $(".nav-categories").css("display", "none");
        } else {
            $(".category-sub-menu").removeClass("sub-menu");
            $(".nav-categories").css("display", "block");
        }
    }

    jQuery(window).resize(() => {
        if ($(window).width() <= 992) {
            $(".category-sub-menu").addClass("sub-menu");
            $(".nav-categories").css("display", "none");
        } else {
            $(".category-sub-menu").removeClass("sub-menu");
            $(".nav-categories").css("display", "block");
        }
    });

    /* JS FROM BOOKLAND*/
    /* Search Bar ============ */
    siteUrl = '';

    var screenWidth = $(window).width();

    var homeSearch = function () {
        'use strict';
        /* top search in header on click function */
        var quikSearch = jQuery("#quik-search-btn");
        var quikSearchRemove = jQuery("#quik-search-remove");

        quikSearch.on('click', function () {
            jQuery('.dz-quik-search').fadeIn(500);
            jQuery('.dz-quik-search').addClass('On');
        });

        quikSearchRemove.on('click', function () {
            jQuery('.dz-quik-search').fadeOut(500);
            jQuery('.dz-quik-search').removeClass('On');
        });
        /* top search in header on click function End*/
    }

    /* WOW ANIMATION ============ */
    var wow_animation = function () {
        if ($('.wow').length > 0) {
            var wow = new WOW(
                {
                    boxClass: 'wow',      // animated element css class (default is wow)
                    animateClass: 'animated', // animation css class (default is animated)
                    offset: 50,          // distance to the element when triggering the animation (default is 0)
                    mobile: false       // trigger animations on mobile devices (true is default)
                });
            wow.init();
        }
    }

    /* One Page Layout ============ */
    var onePageLayout = function () {
        'use strict';
        var headerHeight = parseInt($('.onepage').css('height'), 10);

        $(".scroll").unbind().on('click', function (event) {
            event.preventDefault();

            if (this.hash !== "") {
                var hash = this.hash;
                var seactionPosition = $(hash).offset().top;
                var headerHeight = parseInt($('.onepage').css('height'), 10);


                $('body').scrollspy({target: ".navbar", offset: headerHeight + 2});

                var scrollTopPosition = seactionPosition - (headerHeight);

                $('html, body').animate({
                    scrollTop: scrollTopPosition
                }, 800, function () {

                });
            }
        });
        $('body').scrollspy({target: ".navbar", offset: headerHeight + 2});
    }

    /* Header Height ============ */
    var handleResizeElement = function () {
        var headerTop = 0;
        var headerNav = 0;

        $('.header .sticky-header').removeClass('is-fixed');
        $('.header').removeAttr('style');

        if (jQuery('.header .top-bar').length > 0 && screenWidth > 991) {
            headerTop = parseInt($('.header .top-bar').outerHeight());
        }

        if (jQuery('.header').length > 0) {
            headerNav = parseInt($('.header').height());
            headerNav = (headerNav == 0) ? parseInt($('.header .main-bar').outerHeight()) : headerNav;
        }

        var headerHeight = headerNav + headerTop;

        jQuery('.header').css('height', headerHeight);
    }

    var handleResizeElementOnResize = function () {
        var headerTop = 0;
        var headerNav = 0;

        $('.header .sticky-header').removeClass('is-fixed');
        $('.header').removeAttr('style');


        setTimeout(function () {

            if (jQuery('.header .top-bar').length > 0 && screenWidth > 991) {
                headerTop = parseInt($('.header .top-bar').outerHeight());
            }

            if (jQuery('.header').length > 0) {
                headerNav = parseInt($('.header').height());
                headerNav = (headerNav == 0) ? parseInt($('.header .main-bar').outerHeight()) : headerNav;
            }

            var headerHeight = headerNav + headerTop;

            jQuery('.header').css('height', headerHeight);

        }, 500);
    }

    /* Load File ============ */
    var dzTheme = function () {
        'use strict';
        var loadingImage = '<img src="images/loading.gif">';
        jQuery('.dzload').each(function () {
            var dzsrc = siteUrl + $(this).attr('dzsrc');
            //jQuery(this).html(loadingImage);
            jQuery(this).hide(function () {
                jQuery(this).load(dzsrc, function () {
                    jQuery(this).fadeIn('slow');
                });
            })

        });


        if (screenWidth <= 991) {
            jQuery('.navbar-nav > li > a, .sub-menu > li > a').unbind().on('click', function (e) {
                if (jQuery(this).parent().hasClass('open')) {
                    jQuery(this).parent().removeClass('open');
                } else {
                    jQuery(this).parent().parent().find('li').removeClass('open');
                    jQuery(this).parent().addClass('open');
                }
            });
        }

        jQuery('.menu-btn, .openbtn').on('click', function () {
            jQuery('.contact-sidebar').addClass('active');
        });
        jQuery('.menu-close').on('click', function () {
            jQuery('.contact-sidebar').removeClass('active');
            jQuery('.menu-btn').removeClass('open');
        });

    }

    /* Magnific Popup ============ */
    var MagnificPopup = function () {
        'use strict';

        if (jQuery('.mfp-gallery').length > 0) {
            /* magnificPopup function */
            jQuery('.mfp-gallery').magnificPopup({
                delegate: '.mfp-link',
                type: 'image',
                tLoading: 'Loading image #%curr%...',
                mainClass: 'mfp-img-mobile',
                gallery: {
                    enabled: true,
                    navigateByImgClick: true,
                    preload: [0, 1] // Will preload 0 - before current, and 1 after the current image
                },
                image: {
                    tError: '<a href="%url%">The image #%curr%</a> could not be loaded.',
                    titleSrc: function (item) {
                        return item.el.attr('title') + '<small></small>';
                    }
                }
            });
            /* magnificPopup function end */
        }

        if (jQuery('.mfp-video').length > 0) {
            /* magnificPopup for Play video function */
            jQuery('.mfp-video').magnificPopup({
                type: 'iframe',
                iframe: {
                    markup: '<div class="mfp-iframe-scaler">' +
                        '<div class="mfp-close"></div>' +
                        '<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>' +
                        '<div class="mfp-title">Some caption</div>' +
                        '</div>'
                },
                callbacks: {
                    markupParse: function (template, values, item) {
                        values.title = item.el.attr('title');
                    }
                }
            });

        }

        if (jQuery('.popup-youtube, .popup-vimeo, .popup-gmaps').length > 0) {
            /* magnificPopup for Play video function end */
            $('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
                disableOn: 700,
                type: 'iframe',
                mainClass: 'mfp-fade',
                removalDelay: 160,
                preloader: false,

                fixedContentPos: false
            });

        }

    }

    /* Scroll To Top ============ */
    var scrollTop = function () {
        'use strict';
        var scrollTop = jQuery("button.scroltop");
        /* page scroll top on click function */
        scrollTop.on('click', function () {
            jQuery("html, body").animate({
                scrollTop: 0
            }, 1000);
            return false;
        })

        jQuery(window).bind("scroll", function () {
            var scroll = jQuery(window).scrollTop();
            if (scroll > 900) {
                jQuery("button.scroltop").fadeIn(1000);
            } else {
                jQuery("button.scroltop").fadeOut(1000);
            }
        });
        /* page scroll top on click function end*/
    }

    /* Header Fixed ============ */
    var headerFix = function () {
        'use strict';
        /* Main navigation fixed on top  when scroll down function custom */
        jQuery(window).on('scroll', function () {
            if (jQuery('.sticky-header').length > 0) {
                var menu = jQuery('.sticky-header');
                if ($(window).scrollTop() > menu.offset().top) {
                    menu.addClass('is-fixed');
                } else {
                    menu.removeClass('is-fixed');
                }
            }
        });
        /* Main navigation fixed on top  when scroll down function custom end*/
    }

    /* Masonry Box ============ */
    var masonryBox = function () {
        'use strict';
        /* masonry by  = bootstrap-select.min.js */
        if (jQuery('#masonry, .masonry').length > 0) {
            var self = jQuery("#masonry, .masonry");

            if (jQuery('.card-container').length > 0) {
                var gutterEnable = self.data('gutter');

                var gutter = (self.data('gutter') === undefined) ? 0 : self.data('gutter');
                gutter = parseInt(gutter);


                var columnWidthValue = (self.attr('data-column-width') === undefined) ? '' : self.attr('data-column-width');
                if (columnWidthValue != '') {
                    columnWidthValue = parseInt(columnWidthValue);
                }

                self.imagesLoaded(function () {
                    self.masonry({
                        //gutter: gutter,
                        //columnWidth:columnWidthValue,
                        gutterWidth: 15,
                        isAnimated: true,
                        itemSelector: ".card-container",
                        //percentPosition: true
                    });

                });
            }
        }
        if (jQuery('.filters').length) {
            jQuery(".filters li:first").addClass('active');

            jQuery(".filters").on("click", "li", function () {
                jQuery('.filters li').removeClass('active');
                jQuery(this).addClass('active');

                var filterValue = $(this).attr("data-filter");
                self.isotope({filter: filterValue});
            });
        }
        /* masonry by  = bootstrap-select.min.js end */
    }

    /* Counter Number ============ */
    var counter = function () {
        if (jQuery('.counter').length) {
            jQuery('.counter').counterUp({
                delay: 10,
                time: 3000
            });
        }
    }

    /* Video Popup ============ */
    var handleVideo = function () {
        /* Video responsive function */
        jQuery('iframe[src*="youtube.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>');
        jQuery('iframe[src*="vimeo.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>');
        /* Video responsive function end */
    }

    /* Gallery Filter ============ */
    var handleFilterMasonary = function () {
        /* gallery filter activation = jquery.mixitup.min.js */
        if (jQuery('#image-gallery-mix').length) {
            jQuery('.gallery-filter').find('li').each(function () {
                $(this).addClass('filter');
            });
            jQuery('#image-gallery-mix').mixItUp();
        }
        ;
        if (jQuery('.gallery-filter.masonary').length) {
            jQuery('.gallery-filter.masonary').on('click', 'span', function () {
                var selector = $(this).parent().attr('data-filter');
                jQuery('.gallery-filter.masonary span').parent().removeClass('active');
                jQuery(this).parent().addClass('active');
                jQuery('#image-gallery-isotope').isotope({filter: selector});
                return false;
            });
        }
        /* gallery filter activation = jquery.mixitup.min.js */
    }

    /* Resizebanner ============ */
    var handleBannerResize = function () {
        $(".full-height").css("height", $(window).height());
    }

    /* BGEFFECT ============ */
    var reposition = function () {
        'use strict';
        var modal = jQuery(this),
            dialog = modal.find('.modal-dialog');
        modal.css('display', 'block');

        /* Dividing by two centers the modal exactly, but dividing by three
         or four works better for larger screens.  */
        dialog.css("margin-top", Math.max(0, (jQuery(window).height() - dialog.height()) / 2));
    }

    var handelResize = function () {

        /* Reposition when the window is resized */
        jQuery(window).on('resize', function () {
            jQuery('.modal:visible').each(reposition);


        });
    }

    /* Countdown ============ */
    var handleCountDown = function (WebsiteLaunchDate) {
        /* Time Countr Down Js */
        if ($(".countdown").length) {
            $('.countdown').countdown({date: WebsiteLaunchDate + ' 23:5'}, function () {
                $('.countdown').text('we are live');
            });
        }
        /* Time Countr Down Js End */
    }

    /* Website Launch Date */
    var WebsiteLaunchDate = new Date();
    monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    WebsiteLaunchDate.setMonth(WebsiteLaunchDate.getMonth() + 1);
    WebsiteLaunchDate = WebsiteLaunchDate.getDate() + " " + monthNames[WebsiteLaunchDate.getMonth()] + " " + WebsiteLaunchDate.getFullYear();
    /* Website Launch Date END */

    var handleFinalCountDown = function () {
        if (jQuery('.countdown-timer').length > 0) {
            var startTime = new Date("Jan 25 2021 17:02:37"); // Put your website start time here
            startTime = startTime.getTime();

            var currentTime = new Date();
            currentTime = currentTime.getTime();

            var endTime = new Date("Dec 31 2022 17:02:37"); // Put your website end time here
            endTime = endTime.getTime();

            $('.countdown-timer').final_countdown({

                'start': (startTime / 1000),
                'end': (endTime / 1000),
                'now': (currentTime / 1000),
                selectors: {
                    value_seconds: '.clock-seconds .val',
                    canvas_seconds: 'canvas-seconds',
                    value_minutes: '.clock-minutes .val',
                    canvas_minutes: 'canvas-minutes',
                    value_hours: '.clock-hours .val',
                    canvas_hours: 'canvas-hours',
                    value_days: '.clock-days .val',
                    canvas_days: 'canvas-days'
                },
                seconds: {
                    //borderColor:'#c90103',
                    borderColor: $('.type-seconds').attr('data-border-color'),
                    borderWidth: '5',
                },
                minutes: {
                    //borderColor:'#c90103',
                    borderColor: $('.type-minutes').attr('data-border-color'),
                    borderWidth: '5'
                },
                hours: {
                    //borderColor:'#c90103',
                    borderColor: $('.type-hours').attr('data-border-color'),
                    borderWidth: '5'
                },
                days: {
                    //borderColor:'#c90103',
                    borderColor: $('.type-days').attr('data-border-color'),
                    borderWidth: '5'
                }
            });
        }
    }

    var boxHover = function () {
        jQuery('.box-hover').on('mouseenter', function () {
            var selector = jQuery(this).parent().parent();
            selector.find('.box-hover').removeClass('active');
            jQuery(this).addClass('active');
        });
    }

    var handleCurrentActive = function () {
        for (var nk = window.location,
                 o = $("ul.navbar a").filter(function () {

                     return this.href == nk;

                 })
                     .addClass("active")
                     .parent()
                     .addClass("active"); ;) {

            if (!o.is("li")) break;

            o = o.parent()
                .addClass("show")
                .parent('li')
                .addClass("active");
        }
    }

    /* Mini Cart Function*/
    var handleShopCart = function () {
        $(".remove").on('click', function () {
            $(this).closest(".mini_cart_item").hide('500');
        });
        $('.cart-btn').unbind().on('click', function () {
            $(".cart-list").slideToggle('slow');
        })

    }

    /* Range ============ */
    var priceslider = function () {
        if ($("#slider-tooltips").length > 0) {
            var tooltipSlider = document.getElementById('slider-tooltips');
            noUiSlider.create(tooltipSlider, {
                start: [40, 80],
                connect: true,
                tooltips: [wNumb({decimals: 1}), true],
                range: {
                    'min': 0,
                    'max': 100
                }
            });
        }
    }

    /* handle Bootstrap Touch Spin ============ */
    var handleBootstrapTouchSpin = function () {
        if ($("input[name='demo_vertical2']").length > 0) {
            jQuery("input[name='demo_vertical2']").TouchSpin({
                verticalbuttons: true,
                verticalupclass: 'ti-plus',
                verticaldownclass: 'ti-minus'
            });
        }
        if ($(".quantity-input").length > 0) {
            jQuery(".quantity-input").TouchSpin({
                verticalbuttons: true,
                verticalupclass: 'ti-plus',
                verticaldownclass: 'ti-minus'
            });
        }
    }

    var handleSmartWizard = function () {
        if (jQuery('#smartwizard').length > 0) {
            $('#smartwizard').smartWizard();
        }
    }


    var handleSelectpicker = function () {
        if (jQuery('.default-select').length > 0) {
            jQuery('.default-select').selectpicker();
        }
    }

    // custom
    var dzCategoryToggle = function () {
        jQuery('.toggle-btn').on('click', function () {
            $(".toggle-items").slideToggle("slow");
            jQuery(this).toggleClass('active');
        });

        /* accordion-button */

    }

    var heartBlast = function () {
        $(".heart").on("click", function () {
            $(this).toggleClass("heart-blast");
        });
    }

    /* Mini Cart Function*/
    var handleShopPannel = function () {
        $(".panel-btn").on('click', function () {
            $(".shop-filter").addClass('show');
        });
        $('.panel-close-btn').on('click', function () {
            $(".shop-filter").removeClass('show');
        })
    }

    var cartButton = function () {
        $(".item-close").on('click', function () {
            $(this).closest(".cart-item").hide('500');
        });
        $('.cart-btn').unbind().on('click', function () {
            $(".cart-list").slideToggle('slow');
        })

    }
    /*---------------------------------------------------------------------
             Datatables
          -----------------------------------------------------------------------*/
    var loadData = () => {
        if (jQuery('.data-tables').length) {
            return new DataTable('.data-tables');
        }
    }
    /* Mini Cart Function*/
    var handleHeaderMenuItem = function () {
        $(".menu-item").on('click', function () {
            $(".dzdrop-menu").toggleClass('show');
        });
    }

    /* Function ============ */
    return {
        init: function () {
            boxHover();
            wow_animation();
            onePageLayout();
            dzTheme();
            homeSearch();
            MagnificPopup();
            scrollTop();
            headerFix();
            handleVideo();
            handleFilterMasonary();
            handleCountDown(WebsiteLaunchDate);
            handleBannerResize();
            handelResize();
            jQuery('.modal').on('show.bs.modal', reposition);
            priceslider();
            handleCurrentActive();
            handleShopCart();
            handleBootstrapTouchSpin();
            handleSelectpicker();
            handleSmartWizard();
            dzCategoryToggle();
            heartBlast();
            handleShopPannel();
            handleHeaderMenuItem();
            handleFinalCountDown();
            cartButton();
            // custom js
            checkLocation();
            connectToAdmin();
            responsiveCategories();
            showPassword();
            checkPassword();
            locationAPI();
            loadData();
            myWidget();
            handleSelectedItems();
            showChangePasswordForm();
        },

        load: function () {
            counter();
            masonryBox();
        },

        resize: function () {
            screenWidth = $(window).width();
            dzTheme();
            handleFinalCountDown();
            // custom
            responsiveCategories();
        }
    }

}();

/* Document.ready Start */
jQuery(document).ready(function () {
    'use strict';

    Bookland.init();

    $('a[data-bs-toggle="tab"]').click(function () {
        // todo remove snippet on bootstrap v4
        $('a[data-bs-toggle="tab"]').click(function () {
            $($(this).attr('href')).show().addClass('show active').siblings().hide();
        })
    });

    jQuery('.navicon').on('click', function () {
        $(this).toggleClass('open');
    });

});
/* Document.ready END */

/* Window Load START */
jQuery(window).on('load', function () {
    'use strict';

    Bookland.load();

    setTimeout(function () {
        jQuery('#loading-area').remove();
    }, 2000);

});
/*  Window Load END */

/* Window Resize START */
jQuery(window).on('resize', function () {
    'use strict';
    Bookland.resize();
});
/*  Window Resize END */

