import React from 'react'
import "./TextStroke.css"
function TextStroke({text,size}) {
  return (
    <div><div className="heading relative">
          
    <h1 className={`text-${size} font-bold z-5`}>{text}</h1>
    <h1 className={`text-${size} font-bold text-white  stroke`}>{text}</h1>
  </div></div>
  )
}

export default TextStroke