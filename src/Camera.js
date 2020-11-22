import CameraModel from "./CameraModel";
import OutputType from './OutputType';
export class Constraints {
    constructor() {
        this.video = {
            facingMode: 'user'
        };
        this.audio = false;
    }
    switchFacingMode(tryAgain = false) {
        if(this.video.facingMode === 'user') {
            this.video.facingMode = 'environment';
        } else if(tryAgain) {
            this.video.facingMode = {
                exact: 'environment'
            }
        } else {
            this.video.facingMode = 'user';
        }
        return this;
    }
    getConstraint() {
        return {
            video: this.video,
            audio: this.audio
        }
    }
}

export default class Camera {
    constructor(video, canvas) {
        this.devices = [];
        this.stream = null;
        this.canvasElement = canvas;
        this.videoElement = video;
        this.constraints = new Constraints();
    }
    getDevices() {
        return new Promise(async (resolve, reject) => {
            if(this.devices.length > 0) {
                resolve(this.devices);
                return;
            }
            try {
                let devices = await navigator.mediaDevices.enumerateDevices();
                devices.forEach(device => {
                    if(device.kind && device.kind.toLocaleLowerCase() === 'videoinput')
                        this.devices.push(new CameraModel(device));
                });
                resolve(this.devices);
            } catch(error) {
                console.error('GetDevices', error);
                reject(error);
            }
        });
    }
    setVideoConstraints(videoConstraints) {
        if(!this.constraints) {
            this.constraints = new Constraints();
        }
        this.constraints.video = videoConstraints;
        return this;
    }
    snap() {
        this.canvasElement.width = this.videoElement.scrollWidth;
        this.canvasElement.height = this.videoElement.scrollHeight;
        let context = this.canvasElement.getContext('2d');
        context.clearRect(0 , 0, this.canvasElement.width, this.canvasElement.height);
        context.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
        return this.canvasElement;
    }
    /**
     * @return String
     */
    snapAsBase64() {
        this.snap();
        let data = this.canvasElement.toDataURL('image/png');
        return data;
    }
    /**
     * @return Promise
     */
    snapAsBlob() {
        this.snap();
        new Promise((resolve) => {
            this.canvasElement.toBlob((blob) => {
                resolve(blob);
            }, 'image/png', 1);
        });
    }
    start() {
        return new Promise(async (resolve, reject) => {
            try {
                await this.getDevices();
                let stream = await navigator.mediaDevices.getUserMedia(this.constraints.getConstraint());
                this.videoElement.srcObject = stream;
                this.stream = stream;
                resolve();
            }
            catch(error) {
                console.error('StartCamera', error);
                reject(error);
            }
        });
    }
    stop() {
        if(!this.stream) return;
        let tracks = this.videoElement.srcObject.getTracks();
        tracks.forEach(track => track.stop());
    }
    switch(tryAgain = false) {
        return new Promise(async (resolve, reject) => {
            this.constraints = this.constraints.switchFacingMode(tryAgain);
            this.stop();
            try {
                await this.start();
                resolve();
            }
            catch(error) {
                console.error('SwitchCamera', error);
                reject(error);
            }
        });
    }
    
    static isCameraSupported() {
        return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
    }
    static tryInvokePermission(video, canvas) {
        return new Promise(async (resolve, reject) => {
            try {
                await navigator.mediaDevices.getUserMedia(new Constraints());
                resolve(new Camera(video, canvas));
            } catch(error) {
                console.error('MediaDevices', error);
                reject(error);
            }
        });
    }
}