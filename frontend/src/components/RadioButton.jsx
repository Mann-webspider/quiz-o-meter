import React from 'react'
// import "./Button.css"
function RadioButton(props) {
  return (
    <div className='min-w-[400px] min-h-[200px] flex relative '>
        <input type="radio" name={`${props.id}/ans`} id={`${props.id}/${props.idx}`} className={`hidden peer`} value={props.idx} {...props.register}/>
        <label htmlFor={`${props.id}/${props.idx}`} className= {`z-[10] p-4 pl-8 text-center peer-checked:bg-black peer-checked:text-white bg-white  text-4xl flex justify-center transition duration-500 items-center absolute min-w-[450px] min-h-[250px]  placeholder:text-gray-600 tracking-wider rounded-lg border-2 border-black`}>
            {props.text?props.text:null}
        </label>
        <div className={`z-[1] absolute top-[6px] min-w-[450px] min-h-[250px] left-[6px] bg-black block peer-checked:bg-white peer-checked:text-black border-2 border-black h-16  rounded-lg`}>
        {" "}
      </div>
    </div>
  )
}

export default RadioButton