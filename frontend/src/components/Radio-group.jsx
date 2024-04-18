import React from 'react'
import RadioButton from './RadioButton'

function RadioGroup({options,id,register}) {
  return (
    <div className='w-full h-[500px] grid grid-cols-2 gap-9'>
        {options.map((option,idx)=>(
          <>            
            <RadioButton text={option} id={`${id}`} key={id} idx={idx} register={{...register(`answers.${id}`)}}/>
          </>
        ))}
    </div>
  )
}

export default RadioGroup