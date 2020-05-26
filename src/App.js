import React, { useRef, useCallback, useState } from 'react';
import './App.css';
import Predictions from '@aws-amplify/predictions';
import Storage from '@aws-amplify/storage';
import Webcam from "react-webcam";

function App() {
  const webcamRef = useRef();
  const [images, setImages] = useState([])

  const urltoFile = (url, filename, mimeType) =>{
    return (fetch(url)
        .then(function(res){return res.arrayBuffer();})
        .then(function(buf){return new File([buf], filename,{type:mimeType});})
    );
  }
  const capture = useCallback(
    async () => {
      const imageSrc = webcamRef.current.getScreenshot();
      debugger
      const moreImages = [...images, imageSrc]
      setImages(moreImages)

      const file = await urltoFile(imageSrc, 'img.jpg','image/jpeg')
      debugger
      try {
        debugger
        const { entities } = await Predictions.identify({
          entities: {
            source: {
              file,
            },
            //celebrityDetection: true
            collection: true
          }
        });
        debugger
      } catch (error) {
        debugger
        console.log(error)
      }
    },
    [webcamRef]
  )
  const findFace = async (event) => {
    try {
      const { target: { files } } = event;
      const file = files[0];
      debugger
      const { entities } = await Predictions.identify({
        entities: {
          source: {
            file,
          },
          //celebrityDetection: true
          collection: true
        }
      })
      debugger
    } catch (error) {
      console.log(error)
    }
  }

  const uploadImage = async (event) => {
    try {
      const { target: { files } } = event;
      const [file] = files || [];
      const result = await Storage.put(file.name, file, {
        level: 'protected',
        customPrefix: {
          protected: 'protected/predictions/index-faces/',
        }
      });
      debugger
    } catch (error) {
      console.log(error)
    }
  }



  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  return (
    <div className="App">
      <h2> Find face </h2>
      <input type="file" onChange={ uploadImage } />
      <input type="file" onChange={ findFace } />
      <Webcam 
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
      />
      <button onClick={capture} > Capture</button>
      {
        images.length > 0 && images.map( (image, id) =>(
          <img src={ image } key={ id} alt={ id }/>
        ))
      }

    </div>
  );
}

export default App;
