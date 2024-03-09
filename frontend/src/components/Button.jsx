import React from 'react'
import "./Button.css"
function Button(props) {
  return (
    <div><input type={props.type?"submit":"button"} className="button-50" role="button"  onClick={props.click?props.click:()=>null} value={props.text}/>
    
  </div>
  )
}

export default Button