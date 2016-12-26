'use babel'

import $ from 'jquery'
import noop from './noop'
import { ENABLE_ANIMATION } from './constants'

const animationEnd = 'webkitAnimationEnd animationend'

$.fn.extend({
  animateCss: function (animationName, callback = noop) {
    if (!ENABLE_ANIMATION) {
      callback()
    } else {
      this.addClass('animated ' + animationName).one(animationEnd, function () {
        $(this).removeClass('animated ' + animationName)
        callback && callback()
      })
    }
  }
})
