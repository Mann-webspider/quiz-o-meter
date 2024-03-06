import React from 'react'
import "./Button.css"
function Button(props) {
  return (
    <div><button className="button-50" role="button"  onClick={props.click?props.click:()=>null}>
    {props.text}
  </button></div>
  )
}

export default Button