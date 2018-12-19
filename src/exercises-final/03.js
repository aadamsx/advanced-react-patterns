// Flexible Compound Components with context
// This allows you to avoid unecessary rerenders

import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react'
import {Switch} from '../switch'

const ToggleContext = React.createContext()

function useEffectAfterMount(callback, dependencies) {
  const justMounted = useRef(false)

  // useEffect is async, won't block rendering
  useEffect(() => {
    if (!justMounted.current) {
      return callback()
    }
    justMounted.current = false
  }, dependencies)
}

function Toggle(props) {
  const [on, setOn] = useState(false)
  // const toggle = () => setOn(oldOn => !oldOn)
  // for rerendering concerns useCallback
  const toggle = useCallback(() => setOn(oldOn => !oldOn), [])
  useEffectAfterMount(
    () => {
      props.onToggle(on)
    },
    [on],
  )
  // for rerendering concerns useMemo
  const value = useMemo(() => ({on, toggle}), [on])
  return (
    <ToggleContext.Provider value={value}>
      {props.children}
    </ToggleContext.Provider>
  )
}

// This is the way we Use Context and Hooks in Real App. Make a context, then make a custom hook for consuming that context
// rather than exposing the whole contex itself.
// Then . you could hook into, make sure ppl are using the context properly (make an abstration around the context) or
// filter down the pices of the context you provide via an argument or whatever

// Throws error if there is no context, meaning we havn't actually rendered it yet.
function useToggleContext() {
  const context = useContext(ToggleContext)
  if (!context) {
    throw new Error(
      `Toggle compound components cannot be rendered outside the Toggle component`,
    )
  }

  return context
}

// custom function components here.
const On = ({children}) => {
  const {on} = useToggleContext()
  return on ? children : null
}
Toggle.On = On

const Off = ({children}) => {
  const {on} = useToggleContext()
  return on ? null : children
}
Toggle.Off = Off

const Button = props => {
  const {on, toggle} = useToggleContext()
  return <Switch on={on} onClick={toggle} {...props} />
}
Toggle.Button = Button

function Usage({
  onToggle = (...args) => console.log('onToggle', ...args),
}) {
  return (
    <Toggle onToggle={onToggle}>
      <Toggle.On>The button is on</Toggle.On>
      <Toggle.Off>The button is off</Toggle.Off>
      <div>
        <Toggle.Button />
      </div>
    </Toggle>
  )
}
Usage.title = 'Flexible Compound Components'

export {Toggle, Usage as default}
