import React, { useCallback, useEffect, useRef } from 'react'
import PropTypes from 'prop-types';
import { addClass, removeClass } from '../../_utils/dom'

export interface CollapseTransitionProps extends React.HTMLAttributes<HTMLElement> {
  duration?: number
  isActive?: boolean
}

const defaultProps: CollapseTransitionProps = {
  duration: 300
}

const CollapseTransition: React.FC<CollapseTransitionProps> = ({ isActive, duration, children, ...props }) => {
  const rootRef = useRef<HTMLDivElement>()
  const enterTimerRef = useRef<NodeJS.Timeout>()
  const leaveTimerRef = useRef<NodeJS.Timeout>()

  const beforeEnter = useCallback(() => {
    const el = rootRef.current

    addClass(el, 'collapse-transition')
    if (!el.dataset) { (el.dataset as any) = {} }

    el.dataset.oldPaddingTop = el.style.paddingTop
    el.dataset.oldPaddingBottom = el.style.paddingBottom

    el.style.height = '0'
    el.style.paddingTop = '0'
    el.style.paddingBottom = '0'
  }, [])

  const enter = useCallback(() => {
    const el = rootRef.current
    el.dataset.oldOverflow = el.style.overflow
    if (el.scrollHeight !== 0) {
      el.style.height = el.scrollHeight + 'px'
      el.style.paddingTop = el.dataset.oldPaddingTop
      el.style.paddingBottom = el.dataset.oldPaddingBottom
    } else {
      el.style.height = ''
      el.style.paddingTop = el.dataset.oldPaddingTop
      el.style.paddingBottom = el.dataset.oldPaddingBottom
    }

    el.style.overflow = 'hidden'
  }, [])

  const afterEnter = useCallback(() => {
    const el = rootRef.current
    // for safari: remove class then reset height is necessary
    removeClass(el, 'collapse-transition')
    el.style.height = ''
    el.style.overflow = el.dataset.oldOverflow
  }, [])

  const beforeLeave = useCallback(() => {
    const el = rootRef.current

    if (!el.dataset) (el.dataset as any) = {}
    el.dataset.oldPaddingTop = el.style.paddingTop
    el.dataset.oldPaddingBottom = el.style.paddingBottom
    el.dataset.oldOverflow = el.style.overflow

    el.style.height = el.scrollHeight + 'px'
    el.style.overflow = 'hidden'
  }, [])

  const leave = useCallback(() => {
    const el = rootRef.current
    if (el.scrollHeight !== 0) {
      // for safari: add class after set height, or it will jump to zero height suddenly, weired
      addClass(el, 'collapse-transition')
      // fix #968 collapse animation failure.
      // in vue3.0.4, transitionProperty is set 'none' to avoid 'v-leave-from' issue
      el.style.transitionProperty = 'height'
      el.style.height = '0'
      el.style.paddingTop = '0'
      el.style.paddingBottom = '0'
    }
  }, [])

  const afterLeave = useCallback(() => {
    const el = rootRef.current
    removeClass(el, 'collapse-transition')
    el.style.height = ''
    el.style.overflow = el.dataset.oldOverflow
    el.style.paddingTop = el.dataset.oldPaddingTop
    el.style.paddingBottom = el.dataset.oldPaddingBottom
  }, [])

  useEffect(() => {
    if (isActive) {
      beforeEnter()
      enter()
      clearTimeout(enterTimerRef.current)
      enterTimerRef.current = setTimeout(afterEnter, duration)
    }
    return () => {
      clearTimeout(enterTimerRef.current)
      clearTimeout(leaveTimerRef.current)
      beforeLeave()
      leave()
      leaveTimerRef.current = setTimeout(afterLeave, duration)
    }
  }, [isActive, duration])

  return <div ref={rootRef} {...props} />
}

CollapseTransition.displayName = 'ElCollapseTransition';
CollapseTransition.defaultProps = defaultProps;
CollapseTransition.propTypes = {
  duration: PropTypes.number,
  isActive: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
  style: PropTypes.object,
};

export default CollapseTransition;
