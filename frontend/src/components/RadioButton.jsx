import React from 'react'

function RadioButton(props) {
  return (
    <div>
        <label htmlFor="">
            <input type="radio" name="ans" id="" className=''/>
            <span>{props.text?props.text:""}</span>
        </label>
    </div>
  )
}

export default RadioButton