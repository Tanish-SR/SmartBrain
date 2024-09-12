import React from "react"
import './ImageLinkForm.css'

const ImageLinkForm = ({onInputChange, onButtonSubmit}) => {
  return (
    <div>
        <p className="f3 center">
            {'This Magic brain will detect faces in your pictures give it a try'}
        </p>
        <div className="center">
            <div className="pa4 br3 shadow-2 form"> 
                <input placeholder="Enter URL.." className='f4 pa2 w-70 center' type="text" onChange={onInputChange} />
                <button className="w-30 grow f4 link ph3 pv2 dib white bg-light-purple" onClick={onButtonSubmit}>Detect</button>
            </div>
        </div>
    </div>
  )
};

export default ImageLinkForm;
