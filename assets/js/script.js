
    
$(document).ready(function() {
    $('#chat-support-container').MessagingChatSupport({
        useLocalStorage: false, // Use local storage for tracking
        timezone: 'Asia/Jakarta', // Example timezone
        button: {
            position: 'right', // left or right
            style: 2, // 1,2,3,4,5,6,7
            src: '<img src="https://img.freepik.com/premium-photo/female-customer-service-3d-cartoon-avatar-portrait_839035-194113.jpg" alt="candil kuya">', // Example icon or <i class="fa-brands fa-whatsapp"></i>
            speechBubble: 'Butuh bantuan? Ngobrol dengan kami!',
            pulseEffect: true,
            text: {
                title: 'Need help? Chat with us',
                description: 'Customer Support',
                online: 'We are online',
                offline: 'We are offline'
            },
          onlineDay: {
              'sunday': '00:00-23:59', 
              'monday': '00:00-23:59',
              'tuesday': '00:00-23:59',
              'wednesday': '00:00-23:59',
              'thursday': '00:00-23:59',
              'friday': '00:00-23:59',
             'saturday': '00:00-23:59',
          }, // 00:00-12:00 13:00-17:00 or 00:00-23:59 or closed           data JSON
          
            platform: 'whatsapp', // Platform to use (whatsapp, messenger, telegram, viber, snapchat, email, sms, link)
            customLink: 'https://candilkuya.com', // this if platform (link)
            customLinkClore: '#b200e9', // this if platform (link)
            number: '+6283815432987', // Contact number or username (whatsapp, messenger, telegram, viber, snapchat, email, sms,) not for link
        },
    });
}); 


(function ($) {
    'use strict';
    $.fn.MessagingChatSupport = function (options) {
        // Default settings
        const defaults = {
            button: {
                position: 'right',
                style: 2,
                src: '<i class="fab fa-whatsapp"></i>',
                notificationNumber: '1',
                speechBubble: 'How can we help you?',
                pulseEffect: true,
                text: {
                    title: 'Need help? Chat with us',
                    description: 'Customer Support',
                    online: 'I\'m Online',
                    offline: 'I will be back soon'
                },
                customLink: '',
                customLinkClore: '#000',
                platform: 'whatsapp', // Default to WhatsApp
                number: '', // Contact number or username for the selected platform
                delay: true
            },
            useLocalStorage: true,
            timezone: false,
            onLoad: () => {},
            onClick: () => {}
        };

        const settings = $.extend(true, {}, defaults, options);

        // Background color mapping for different platforms
        const backgroundColorMap = {
            whatsapp: '#25D366',
            messenger: '#0084FF',
            telegram: '#0088CC',
            viber: '#665CAC',
            snapchat: '#FFFC00',
            email: '#007BFF',
            sms: '#FF5722',
            link: settings.button.customLinkClore,
        };

        // Set the background color based on the platform
        const buttonBackgroundColor = backgroundColorMap[settings.button.platform] || '#000000';

        // Timezone setup
        const mtimezone = window.moment ? moment().tz(settings.timezone || moment.tz.guess()) : null;

        return this.each(function () {
            const $MessagingID = $(this);
            let buttonOnline = true;
            let buttonLink;

            // Handle local storage settings only if useLocalStorage is true
            let localStorageData = null;
            if (settings.useLocalStorage) {
                localStorageData = getLocalStorage('MessagingBubbles');
                if (localStorageData) {
                    const data = JSON.parse(localStorageData);
                    // Use data from localStorage to manage bubbles
                    if (data && data.notificationShown) {
                        settings.button.notificationNumber = false; // Hide notification
                    }
                    if (data && data.speechBubbleShown) {
                        settings.button.speechBubble = false; // Hide speech bubble
                    }
                }
            }

            // Execute onLoad callback
            if (typeof settings.onLoad === 'function') {
                settings.onLoad.call(this);
            }

            // Validate button position
            if (!['right', 'left'].includes(settings.button.position)) {
                settings.button.speechBubble = false;
            }

            // Initialize button
            $MessagingID
                .addClass(`Messaging-chat-support Messaging-chat-support-${settings.button.style}`)
                .prepend('<div class="Messaging-button"></div>')
                .addClass(`Messaging-fixed Messaging-${settings.button.position}`);

            // Apply animation delay
            if (settings.button.delay) {
                const effect = [2, 4, 5, 7].includes(settings.button.effect) ? `${settings.button.effect}__${settings.button.position === 'right' ? '1' : '2'}` : settings.button.effect;
                $MessagingID.addClass('Messaging-chat-support-show');
                $('.Messaging-button', $MessagingID)
                    .addClass(`animate__animated animate__${effect}`)
                    .on('animationend', function () {
                        $(this).removeClass(`animate__animated animate__${effect}`);
                    });
            } else {
                $MessagingID.addClass('Messaging-chat-support-show');
            }

            // Check online status
            if (settings.button.platform && settings.button.number) {
                if (window.moment && mtimezone) {
                    const day = mtimezone.format('dddd').toLowerCase();
                    const schedule = settings.button.onlineDay[day];

                    if (!schedule) {
                        buttonOnline = false;
                    } else {
                        const now = mtimezone.clone().startOf('second');
                        const schedules = schedule.split(' ').map(range => range.split('-'));

                        buttonOnline = schedules.some(([start, end]) => {
                            let startTime = moment(start, 'HH:mm');
                            let endTime = moment(end, 'HH:mm');

                            // Handle cases where the end time is midnight or the next day
                            if (endTime.isBefore(startTime)) {
                                endTime.add(1, 'day');
                            }

                            return now.isBetween(startTime, endTime);
                        });
                    }
                }
            }

            // Configure button appearance and functionality
            $('.Messaging-button', $MessagingID)
                .css('background-color', buttonBackgroundColor)
                .append(`<div class="Messaging-button-person-avatar">${settings.button.src}</div>`);

            if ([3, 5].includes(settings.button.style)) {
                $('.Messaging-button').append(`<div class="Messaging-button-content"><div class="Messaging-button-content-title">${settings.button.text.title}</div></div>`);
            } else if ([2, 4, 6, 7].includes(settings.button.style)) {
                const description = settings.button.text.description ? `<div class="Messaging-button-content-description">${settings.button.text.description}</div>` : '';
                const onlineOfflineText = buttonOnline ? settings.button.text.online : settings.button.text.offline;
                $('.Messaging-button').append(`<div class="Messaging-button-content"><div class="Messaging-button-content-title">${settings.button.text.title}</div>${description}<div class="Messaging-button-content-online-offline-text">${onlineOfflineText}</div></div>`);
            }

            if (settings.button.src.includes('img')) {
                $('.Messaging-button').addClass('Messaging-button-image');
            }

            if (!buttonOnline) {
                $('.Messaging-button').addClass('Messaging-button-offline');
            }

            // Button click handler
            if (settings.button.platform && settings.button.number && buttonOnline) {
                $('.Messaging-button').click(function () {
                    buttonLink = getPlatformLink(settings.button.platform, settings.button.number);
                    if (buttonLink) {
                        window.open(buttonLink, '_blank');
                        if (typeof settings.onClick === 'function') {
                            settings.onClick.call(this);
                        }
                    }
                });
            }

            // Pulse effect
            if (settings.button.pulseEffect && buttonOnline && settings.button.style === 1) {
                $('.Messaging-button').append('<div class="Messaging-pulse"></div><div class="Messaging-pulse"></div>').find('.Messaging-pulse').css('background-color', buttonBackgroundColor);
            }

            // Notification
            if (settings.button.notificationNumber && buttonOnline) {
                let showNotification = true;

                if (settings.useLocalStorage && localStorageData) {
                    const data = JSON.parse(localStorageData);
                    showNotification = !data.notificationShown;
                }

                if (showNotification) {
                    $('.Messaging-button').append('<div class="Messaging-notify"><div class="Messaging-notify-circle"></div></div>');
                    setTimeout(() => {
                        $('.Messaging-notify-circle').addClass('Messaging-notify-circle-show Messaging-bounce').text(settings.button.notificationNumber);
                        setInterval(() => $('.Messaging-notify-circle').toggleClass('Messaging-bounce'), 2000);
                    }, 4000);

                    if (settings.useLocalStorage) {
                        // Update local storage to mark notification as shown
                        const data = JSON.parse(localStorageData || '{}');
                        data.notificationShown = true;
                        setLocalStorage('MessagingBubbles', JSON.stringify(data));
                    }
                }
            }

            // Speech bubble
            if (settings.button.speechBubble && buttonOnline) {
                let showSpeechBubble = true;

                if (settings.useLocalStorage && localStorageData) {
                    const data = JSON.parse(localStorageData);
                    showSpeechBubble = !data.speechBubbleShown;
                }

                if (showSpeechBubble) {
                    displaySpeechBubble();
                    if (settings.useLocalStorage) {
                        // Update local storage to mark speech bubble as shown
                        const data = JSON.parse(localStorageData || '{}');
                        data.speechBubbleShown = true;
                        setLocalStorage('MessagingBubbles', JSON.stringify(data));
                    }
                }
            }

            function displaySpeechBubble() {
                $MessagingID.prepend('<div class="Messaging-speech-bubble"><span class="Messaging-speech-bubble-close"></span><div class="Messaging-speech-bubble-text"></div></div>');
                setTimeout(() => {
                    $('.Messaging-speech-bubble').addClass('Messaging-speech-bubble-show');
                    $('.Messaging-speech-bubble-text').html('<div class="Messaging-speech-bubble-typing"><div></div><div></div><div></div></div>');
                    setTimeout(() => {
                        $('.Messaging-speech-bubble-close').addClass('Messaging-speech-bubble-close-show');
                        $('.Messaging-speech-bubble-text').text(settings.button.speechBubble);
                    }, 3000);
                }, 1000);

                $('.Messaging-speech-bubble-close').click(() => {
                    $('.Messaging-speech-bubble').removeClass('Messaging-speech-bubble-show');
                });
            }

            // Local storage functions
            function setLocalStorage(key, value) {
                localStorage.setItem(key, value);
            }

            function getLocalStorage(key) {
                return localStorage.getItem(key);
            }

            // Generate platform-specific link
            function getPlatformLink(platform, number) {
                const encodedNumber = encodeURIComponent(number);
                switch (platform) {
                    case 'whatsapp':
                        return `https://wa.me/${encodedNumber}`;
                    case 'messenger':
                        return `https://m.me/${encodedNumber}`;
                    case 'telegram':
                        return `https://t.me/${encodedNumber}`;
                    case 'viber':
                        return `viber://chat?number=${encodedNumber}`;
                    case 'snapchat':
                        return `https://www.snapchat.com/add/${encodedNumber}`;
                    case 'email':
                        return `mailto:${encodedNumber}`;
                    case 'sms':
                        return `sms:${encodedNumber}`;
                    case 'link':
                        return settings.button.customLink;
                    default:
                        return '';
                }
            }
        });
    };
}(jQuery));

var swiper = new Swiper(".slide-content", {
    slidesPerView: 3,
    spaceBetween: 25,
    loop: true,
    centerSlide: 'true',
    fade: 'true',
    grabCursor: 'true',
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
      dynamicBullets: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    breakpoints:{
        0: {
            slidesPerView: 1,
        },
        520: {
            slidesPerView: 2,
        },
        950: {
            slidesPerView: 3,
        },
    },
  });
