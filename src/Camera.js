import CameraModel from "./CameraModel";

class Constraints {
    constructor() {
        this.video = {
            facingMode: 'user'
        };
        this.audio = false;
    }
    switchFacingMode() {
        if(this.video.facingMode === 'user') {
            this.video.facingMode = 'environment';
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
        let data = this.canvasElement.toDataURL('image/png');
        return data;
    }
    start() {
        return new Promise(async (resolve, reject) => {
            try {
                await this.getDevices();
                console.log('Constraints', this.constraints);
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
        this.videoElement.srcObject = null;
        this.stream = null;
    }
    switch() {
        return new Promise(async (resolve, reject) => {
            this.constraints = this.constraints.switchFacingMode();
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