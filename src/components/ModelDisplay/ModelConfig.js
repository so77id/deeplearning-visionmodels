import {
  CocoSsdDisplay,
  YoloV1TinyDisplay,
  YoloV2TinyDisplay,
  YoloV3TinyDisplay,
  YoloV3Display
} from '../ObjectDetectors';

import {
  PoseNetDisplay,
  BlazePoseDisplay,
  MoveNetDisplay
} from '../PoseDetectors';

import {
  MediaPipeFaceDetectorDisplay
} from '../FaceDetectors';

const modelConfig = {
  "Object Detection": {
    "Label": "Object Detection",
    "models": {
      'COCO-SSD': CocoSsdDisplay,
      'YOLO-V1-Tiny': YoloV1TinyDisplay,
      'YOLO-V2-Tiny': YoloV2TinyDisplay,
      'YOLO-V3-Tiny': YoloV3TinyDisplay,
      'YOLO-V3': YoloV3Display,
    },
    "Description": "",
  },
  "Pose Detection": {
    "Label": "Pose Detection",
    "models": {
      'PoseNet': PoseNetDisplay,
      'BlazeNet': BlazePoseDisplay,
      'MoveNet': MoveNetDisplay,
    },
    "Description": "",
  },
  "Face Detection and Landmarks": {
    "Label": "Face Detection and Landmarks",
    "models": {
      'MediaPipeFaceDetector': MediaPipeFaceDetectorDisplay
    },
    "Description": "",
  }
};

export default modelConfig;