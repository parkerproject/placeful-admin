/* global $, location, Stripe, jQuery */
var businessFound = 'false'
// Stripe.setPublishableKey('pk_live_9xZBCqxsOvcil3BXQjT5lpPl')
$(function () {
  // function addInputNames () {
  //   $('.card-number').attr('name', 'number')
  //   $('.cvc').attr('name', 'cvc')
  //   $('.expiry').attr('name', 'expiry')
  // }
  //
  // function removeInputNames () {
  //   $('.card-number').removeAttr('name', 'number')
  //   $('.cvc').removeAttr('name', 'cvc')
  //   $('.expiry').removeAttr('name', 'expiry')
  // }

  $('a[href*=#]:not([href=#])').click(function () {
    if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
      var target = $(this.hash)
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']')
      if (target.length) {
        $('html,body').animate({
          scrollTop: target.offset().top
        }, 1000)
        return false
      }
    }
  })

  function validateEmail (email) {
    var re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(email)
  }

  function submit (form) {
    // remove the input field names for security
    // we do this *before* anything else which might throw an exception
    // removeInputNames() // THIS IS IMPORTANT!
    // given a valid form, submit the payment details to stripe
    $('.cta').attr('disabled', 'disabled')
    form.submit()

    // Stripe.createToken({
    //   number: $('.card-number').val(),
    //   cvc: $('.cvc').val(),
    //   exp_month: document.querySelector('.expiry').value.split('/')[0].trim(),
    //   exp_year: document.querySelector('.expiry').value.split('/')[1].trim()
    // }, function (status, response) {
    //   if (response.error) {
    //     // re-enable the submit button
    //     $('.cta').removeAttr('disabled')
    //
    //     // show the error
    //   //  $('.payment-errors').html(response.error.message)
    //     // we add these names back in so we can revalidate properly
    //     //addInputNames()
    //   } else {
    //     // token contains id, last4, and card type
    //     //var token = response['id']
    //     // insert the stripe token
    //     //var input = $("<input name='stripeToken' value='" + token + "' style='display:none;' />")
    //     //form.appendChild(input[0])
    //     // and submit
    //
    //     form.submit()
    //   }
    // })

    return false
  }

  // add custom rules for credit card validating
  // jQuery.validator.addMethod('cardNumber', Stripe.validateCardNumber, 'Please enter a valid card number')
  // jQuery.validator.addMethod('cardCVC', Stripe.validateCVC, 'Please enter a valid security code')
  // jQuery.validator.addMethod('cardExpiry', function () {
  //   return Stripe.validateExpiry(document.querySelector('.expiry').value.split('/')[0].trim(), document.querySelector('.expiry').value.split('/')[1].trim())
  // }, 'Please enter a valid expiration')
  //
  $('#register-form').validate({
    submitHandler: submit,
    rules: {
      'business_email': {
        email: true,
        required: true
      },
      'password': {
        password: true,
        required: true
      }
    }
  })

  $('#edit-form').validate({
    submitHandler: submit,
    rules: {
      'title': {
        required: true
      },
      'description': {
        required: true
      },
      'fine_print': {
        required: true
      }
    }
  })

  $('#updateProfileForm').validate({
    submitHandler: submit,
    rules: {
      'business_name': {
        required: true
      },
      'description': {
        required: true
      }
    }
  })

  /*----------------------------------------
Upload btn
------------------------------------------*/
  var SITE = SITE || {}

  SITE.fileInputs = function () {
    var $this = $(this),
      $val = $this.val(),
      valArray = $val.split('\\'),
      newVal = valArray[valArray.length - 1],
      $button = $this.siblings('.btn'),
      $fakeFile = $this.siblings('.file-holder')
    if (newVal !== '') {
      $button.text('Photo Chosen')
      if ($fakeFile.length === 0) {
        $button.after('<span class="file-holder">' + newVal + '</span>')
      } else {
        $fakeFile.text(newVal)
      }
    }
  }

  $('.file-wrapper input[type=file]').bind('change focus click', SITE.fileInputs)

  function readURL (input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader()
      var tmppath = URL.createObjectURL(event.target.files[0])

      reader.onload = function (e) {
        $('#img-uploaded').attr('src', e.target.result)
        $('input.img-path').val(tmppath)
      }

      reader.readAsDataURL(input.files[0])
    }
  }

  $('.uploader').change(function () {
    readURL(this)
  })
})
