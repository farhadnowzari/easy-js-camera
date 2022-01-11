# Intro
This package helps you to add camera support to your web application easily and support front and rear camera out of the box.

```bash
npm install easy-js-camera
```
**Note:** For `typescript` version please check here, <a href="https://github.com/farhadnowzari/easy-ts-camera">easy-ts-camera</a>
# Usage
Add your video and canvas as follow,
```html
<video autoplay playsinline></video>
<canvas></canvas>
```
Import the Camera class as follow,
```js
import Camera from 'easy-js-camera';
```
To be able to access to all Video Inputs you first need to get the permission from the user. <br>
**Note:** On some devices it is not needed to first get the permission but it is better to do that first since on some devices if the permission is not granted it doesn't return all the devices.
```js
var video = document.getElementsByTagName('video')[0];
var canvas = document.getElementsByTagName('canvas')[0];
Camera
    .tryInvokePermission(video, canvas)
    .then(camera => {
        camera.start()
    })
    .catch(error => {
        // Mostly happens if the user blocks the camera or the media devices are not supported
    });
```
**Note:** In order to make sure that the browser supports MediaDevices you can do as follow.
```js
import Camera from 'easy-js-camera';

Camera.isCameraSupported();
```

## Props
* **devices:** Contains an array of available VideoInput devices
* **stream:** Contains the current stream object. Gets initialized after the first camera start

## Methods
* **getDevices:** Returns a promise which if is successfull will deliver an array of CameraModels and if not logs an error
* **setVideoConstraints:** By default only `facingMode` key of the video constraints is set. With this method you can expand the constraints and add your own costraints but please **NOTICE** that the `facingMode` is being used in switch method.
* **snap:** This method will take a picture and will return the canvasElement so you can extract the picture as whatever format you like.
* **snapAsBase64:** This method will take a picture and will return it as a base64 string.
* **snapAsBlob:** This method will take a picture and will return a promise which on resolve will deliver a `blob`.
* **start:** This method starts the camera and will return a promise for the result of the action.
* **stop:** This method is responsible for stoping the stream.
* **switch:** This method switches the camera between `front` and `rear`. This method returns a promise. It is better that you disable the switch camera button while it is doing its job because on some phones with `motorized` selfie camera if the user press the button multiple times the camera will hang and will just stickout and no longer works unless he/she restarts the phone. Please **Note** that this method accept a boolean which is called `tryAgain` and it basically tries to access the rear camera. Sometime the rear camera is not accessible and on catch you can do something like below
```js
function switchCamera(tryAgain = false) {
    this.camera.switch(tryAgain)
        .catch(() => {
            if(tryAgain) return; // This line prevents loops. Because the tryAgain may also fail
            this.camera.switch(true);
        });
}
```
