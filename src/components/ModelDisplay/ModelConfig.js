import {
  CocoSsdDisplay,
  YoloV1TinyDisplay,
  YoloV2TinyDisplay,
  YoloV3TinyDisplay,
  YoloV3Display
} from '../ObjectDetectors';

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
  }
};

export default modelConfig;