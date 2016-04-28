/* global $ */
$(document).ready(function () {
  var navListItems = $('div.setup-panel div a')
  var allWells = $('.setup-content')
  var allNextBtn = $('.nextBtn')

  // allWells.hide()

  navListItems.click(function (e) {
    e.preventDefault()
    var $target = $($(this).attr('href'))
    var $item = $(this)

    if (!$item.hasClass('disabled')) {
      navListItems.removeClass('btn-primary').addClass('btn-default')
      $item.addClass('btn-primary')
      allWells.hide()
      $target.show()
      $target.find('input:eq(0)').focus()
    }
  })

  allNextBtn.click(function () {
    var curStep = $(this).closest('.setup-content')
    var curStepBtn = curStep.attr('id')
    var nextStepWizard = $('div.setup-panel div a[href="#' + curStepBtn + '"]').parent().next().children('a')
    var curInputs = curStep.find("input[type='text'],input[type='phone'], input[type='email'], input[type='password']")
    var isValid = true
    //  var googleRecaptcha = $('#g-recaptcha-response').val()

    $('.form-group').removeClass('has-error')
    for (var i = 0; i < curInputs.length; i++) {
      if (curInputs[i].value === '') {
        isValid = false
        $(curInputs[i]).closest('.form-group').addClass('has-error')
      }
    }

    if (isValid) {
      nextStepWizard.removeAttr('disabled').trigger('click')
    }
  })
  $('div.setup-panel div a.btn-primary').trigger('click')
})
