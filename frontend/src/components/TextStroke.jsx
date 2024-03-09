import React from 'react'
import "./TextStroke.css"
function TextStroke({text,size}) {
  return (
    <div className='p-5 '><div className="heading relative w-full ">
          
    <h2 className={`text-${size} font-bold z-5`}>{text}</h2>
    <h2 className={`text-${size} font-bold text-white  stroke`}>{text}</h2>
  </div></div>
  )
}

export default TextStroke