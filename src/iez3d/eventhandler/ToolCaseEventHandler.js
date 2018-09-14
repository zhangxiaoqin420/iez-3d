// 常用工具 eventBus 处理
import Cesium from 'cesium/Cesium'
import {clear, measureAreaSpace, measureLineSpace} from '../../utils/measure'
import {add_dian,add_line,  add_polygon, add_title, changeTitle, clearBZ} from '../../utils/biaozhu'

import MeasureUtilNew from '../../utils/MeasureUtilNew'
import FlyManUtil_VUE from '../../utils/FlyManUtil_VUE'
import path_pinggu3 from '../../sampledata/path_pinggu3'

export default class ToolCaseEventHandler {
  constructor (iez3d) {
    if (!Cesium.defined(iez3d)) {
      throw new Cesium.DeveloperError('iez3d 参数是必须的')
    }
    this.viewer = iez3d.viewer
    this.camera = iez3d.camera
    this.scene = iez3d.scene
    this.handler = iez3d.handler
    this.eventbus = iez3d.eventbus
    this.iez3d = iez3d
    this.init()
    MeasureUtilNew.moduleDef();//量测
    FlyManUtil_VUE.moduleDef();//飞行
    this.drawTool = new Cesium.DrawTool({
        contextObj: this.viewer,
        useMea: true,
        useClampGrd: true
    })
    this.flyTool = new Cesium.FlyManTool({
      contextObj: this.viewer
    });
  }

  init () {
    this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
    //量测功能
    this.eventbus.$on(ToolsEvent.Measure, target => {
      switch (target) {
        case MeasureType.Line:
          this.drawTool['route_DrS']()
         // measureLineSpace(this.viewer)
          break
        case MeasureType.Area:
          this.drawTool['region_DrS']()
          //measureAreaSpace(this.viewer)
          break
        case MeasureType.Clear:
          this.drawTool['destory']()
         // clear(this.viewer)
          break
        case MeasureType.High:
          //this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK) // 删除默认事件 destory
          this.drawTool['elev_DrS']()
          break
      }

    })
    //标注功能
    this.eventbus.$on(ToolsEvent.Mapping, ({type, status,val}) => {
      switch (type){
        case MarkType.Point:
          add_dian(this.viewer,status)
          break;
        case MarkType.Line:
          add_line(this.viewer,status)
          break;
        case MarkType.Polygon:
          add_polygon(this.viewer,status)
          break;
        case MarkType.Title:
          add_title(this.viewer,status)
          break;
        case MarkType.ChangeTitle:
          changeTitle(val)
          break;
        case MarkType.Clear:
          clearBZ(this.viewer,status)
          break;
      }
    })
    //飞行功能
    this.eventbus.$on(ToolsEvent.Fly, target => {
      var flyOption = {
        //flyPathJsVar: {"type": "FeatureCollection","features": [{"type": "Feature","properties": {},"geometry": {"type": "LineString","coordinates": [[117.24326, 40.21185],[117.24289, 40.21263],[117.24259, 40.21380]]}}]},
        flyPathJsVar:path_pinggu3,
        pathGeoJsonUrl: 'data/map97geo.json',
        staticPos: [117.244548, 40.21395],
        flyHeight: 300,
        multiplier: 2,
        pathWidth: 3,
        flySpeed: 50,
        pathShow: !!1,
        pathLeadTime: 0,
        pathTrailTime: 60,
        modelUrl: 'data/Cesium_Air.gltf'

      };
      switch (target) {
        case FlyType.Fly:
         // this.flyManTool.runFlyOnPath2(flyOption);
          this.flyTool.runFlyOnPath2(flyOption)
        break
        case FlyType.FlyClose:
          this.flyTool.closeFlyOnPath2(flyOption)
          break
      }
    })

  }
}
//量测
export const MeasureType = {
  Line: 'line',
  Area:'area',
  High:'high',
  Clear:'clear'

}
//标注
export const MarkType = {
  Point: 'point',
  Line: 'line',
  Polygon:'polygon',
  Title:'title',
  ChangeTitle:'changeTitle',
  Clear:'clear'

}
export const FlyType = {
  Fly:'fly',
  FlyClose:'flyClose'
}
//ToolsEvent 常用工具事件
export const ToolsEvent = {
  Mapping:'mapping',
  Measure:'measure',
  Fly:'fly'
}
