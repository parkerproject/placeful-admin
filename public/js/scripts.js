$(function() {

    (function(b, r, a, n, c, h, _, s, d, k) {
        if (!b[n] || !b[n]._q) {
            for (; s < _.length;) c(h, _[s++]);
            d = r.createElement(a);
            d.async = 1;
            d.src = "https://cdn.branch.io/branch-v1.5.6.min.js";
            k = r.getElementsByTagName(a)[0];
            k.parentNode.insertBefore(d, k);
            b[n] = h
        }
    })(window, document, "script", "branch", function(b, r) {
        b[r] = function() {
            b._q.push([r, arguments])
        }
    }, {
        _q: [],
        _v: 1
    }, "init data setIdentity logout track link sendSMS referrals credits creditHistory applyCode validateCode getCode redeem banner closeBanner".split(" "), 0);

    branch.init('key_live_ogmxPPLkaGEAMzcr8aur5gmbvzp1rzF3');


    //swal("Extra 20% off Groupon Local deals", "enter email to get code");
    window._hash = window.location.hash;

    var navigation = responsiveNav(".nav-collapse", {
        animate: true, // Boolean: Use CSS3 transitions, true or false
        transition: 284, // Integer: Speed of the transition, in milliseconds
        label: "Menu", // String: Label for the navigation toggle
        insert: "after", // String: Insert the toggle before or after the navigation
        customToggle: "", // Selector: Specify the ID of a custom toggle
        closeOnNavClick: false, // Boolean: Close the navigation when one of the links are clicked
        openPos: "relative", // String: Position of the opened nav, relative or static
        navClass: "nav-collapse", // String: Default CSS class. If changed, you need to edit the CSS too!
        navActiveClass: "js-nav-active", // String: Class that is added to <html> element when nav is active
        jsClass: "js", // String: 'JS enabled' class which is added to <html> element
        init: function() {}, // Function: Init callback
        open: function() {}, // Function: Open callback
        close: function() {} // Function: Close callback
    });



    $('a[href*=#]:not([href=#])').click(function() {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                $('html,body').animate({
                    scrollTop: target.offset().top
                }, 1000);
                return false;
            }
        }
    });


});

function sendSMS(form) {
    var phone = form.phone.value;
    var linkData = {
        tags: [],
        channel: 'Website',
        feature: 'TextMeTheApp',
        data: {
            "foo": "bar"
        }
    };
    var options = {};
    var callback = function(err, result) {
        var smsVal;
        if (err) {
            smsVal = "Sorry, something went wrong.";
            jAlert(smsVal);
        } else {
            smsVal = "SMS has been sent!";
            jAlert(smsVal);
        }


    };

    branch.sendSMS(phone, linkData, options, callback);
    form.phone.value = "";

}


function animationBoxedSales() {
    $('.move-1').addClass('bounceInDown');
}