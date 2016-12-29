'use babel'

import $ from 'jquery'
import React, { Component } from 'react'
import BannerAnim, { Element } from 'rc-banner-anim'
import EventEmitter from 'events'
import TweenOne from 'rc-tween-one'
import ReactPlayer from 'react-player'

import slides from './slides'
import render from '../react-render'

const emitter = new EventEmitter()
const titleAnim = { y: -30, opacity: 0, type: 'from' }
const contentAnim = { y: 30, opacity: 0, type: 'from' }
const noteAnim = { y: 30, opacity: 0, type: 'from' }

let item, player

const currentSlide = key => {
  emitter.emit('play-video')
  $(item).find('.efd-guide-slide').each(function () {
    if ($(this).attr('data-id') === key) {
      process.nextTick(() => $(this).css('z-index', 1))
    } else {
      $(this).css('z-index', 0)
    }
  })
}

class Intro extends Component {
  constructor (props) {
    super(props)

    emitter.on('play-video', () => {
      this.setState({
        playing: true,
        titleAnim: {},
        contentAnim: {},
        noteAnim: {}
      })
    })

    this.state = {
      playing: false,
      titleAnim: {},
      contentAnim: {},
      noteAnim: {}
    }
  }

  render () {
    return (
      <BannerAnim prefixCls='app'
        type='across'
        ref={node => (player = node)}
        onChange={
          (event, num) => {
            if (event === 'after') {
              currentSlide(slides[num].key)
              this.setState({
                titleAnim,
                contentAnim,
                noteAnim
              })
            }
          }
        }
      >
        {
          slides.map(slide => (
            <Element
              prefixCls='efd-guide-slide'
              key={slide.key}
              data-id={slide.key}
            >
              <TweenOne className='efd-guide-slide-title'
                animation={this.state.titleAnim}
              >
                <div className='efd-guide-slide-title-line'>
                  <span className={slide.tagClass}>
                    {slide.tag}
                  </span>
                  {slide.title}
                </div>
              </TweenOne>
              <TweenOne className='efd-guide-slide-content'
                animation={this.state.contentAnim}
              >
                <ReactPlayer url={slide.video}
                  playing={this.state.playing}
                  volume={0}
                  controls
                />
              </TweenOne>
              <TweenOne className='efd-guide-slide-note'
                animation={this.state.noteAnim}
              >
                {slide.note}
              </TweenOne>
            </Element>
          ))
        }
      </BannerAnim>
    )
  }
}

item = render(Intro, 'efd-intro-view-container')
$(item).find('.banner-anim-arrow').css('top', 270)
item.getTitle = () => 'video intro'
item.play = () => {
  player.slickGoTo(0)
  currentSlide(slides[0].key)
}

export default item
