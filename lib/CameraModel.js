"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CameraModel = function CameraModel(camera) {
    _classCallCheck(this, CameraModel);

    this.id = camera.deviceId;
    this.label = camera.label;
};

exports.default = CameraModel;