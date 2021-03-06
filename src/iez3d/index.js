import Cesium from 'cesium/Cesium'
import iezNavi from '@iezview/iez-navi/viewerCesiumNavigationMixin'
// import CesiumMeasure from '../utils/CesiumMeasure'
import LocalGeocoder from '../utils/LocalGeocoder'
import Vue from 'vue'
import store from '../store/store'
import CesiumToolBarExtend from '../components/widget/ToolBarExtend/CesiumToolBarExtend'
import imageryViewModels from './layers/DefaultImageryProvider'
import {eventBus} from '../components/eventbus/EventBus'
import {error, info} from '../utils/util'
import LayerManagerEventHandler from './eventhandler/LayerManagerEventHandler'
import {Event} from '../utils/constant'
import FileSaver from 'file-saver'
import ToolCaseEventHandler from './eventhandler/ToolCaseEventHandler'
import SettingEventHandler from './eventhandler/SettingEventHandler'
import MeasureUtilNew from '../utils/MeasureUtilNew'
import path_pinggu3 from '../sampledata/path_pinggu3.js'
import FlyManUtil_VUE2 from '../utils/FlyManUtil_VUE2'
import JsonDataSource from './JsonDataSource'

/**
 *@time: 2018/8/10上午9:48
 *@author:QingMings(1821063757@qq.com)
 *@desc:   放置一下和 cesium 相关方法
 *@param {viewerSelector} viewer Cesium.Viewer Dom Element
 *@param {{}} options  The Options
 */
const iez3d = function (options) {

  MeasureUtilNew.moduleDef()
  FlyManUtil_VUE2.moduleDef()
  this.init(options)
}

/***
 * 初始化函数
 *@param {{}} options  The Options
 */
iez3d.prototype.init = function (options) {
  if (!Cesium.defined(options) || !Cesium.defined(options.container)) {
    throw new Cesium.DeveloperError('options.container 是必须的')
  }
  if (!Cesium.defined(options.viewerOptions)) {
    throw new Cesium.DeveloperError('options.viewerOptions 是必须的')
  }
  // 设置默认视图矩形
  this.defaultViewRectangle(73, 4, 135, 53)
  this.viewer = new Cesium.Viewer(options.container, options.viewerOptions)
  this.options = options
  this.camera = this.viewer.camera
  this.scene = this.viewer.scene
  this.handler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas)
  this.imageryLayers = this.viewer.imageryLayers
  this.eventbus = eventBus
  // this.viewer.terrainProvider =Cesium.createWorldTerrain();
  // this.scene.globe.depthTestAgainstTerrain = true

  // this.drawTool = new Cesium.DrawTool({
  //     contextObj: this.viewer,
  //     useMea: true,
  //     useClampGrd: true
  // })
  // this.flyTool = new Cesium.FlyManTool({
  //   contextObj: this.viewer
  // });

  this.flyManTool = new Cesium.FlyManTool({
    contextObj: this.viewer

  })

  // 显示帧率
  if (Cesium.defined(options.viewerOptions.geocoder) && (options.viewerOptions.geocoder instanceof LocalGeocoder)) {
    options.viewerOptions.geocoder.viewer = this.viewer
    // geoCoder 注入
    this.geocoder = options.viewerOptions.geocoder.viewer
  }
  // 导航插件
  if (Cesium.defined(options.naviOptions)) {
    iezNavi(this.viewer, options.naviOptions)
    this.showLatLonHeightProprety()
  }
  // 持有 CesiumViewer.vue 组件对象
  if (Cesium.defined(options.debug) && options.debug === true) {
    this.viewer.scene.debugShowFramesPerSecond = true
  }
  if (Cesium.defined(options.vue)) {
    this.vueComponent = options.vue
  }
  // 扩展 cesium toolbar 对象
  this.extendCesiumToolBar()
  // console.info(this.imageryLayers)
  // this.addTdtImgAnnoLayer()
  this.baseLayerPicker()
  this.eventHandler()
  // this.test('data/Cesium_Air.gltf', 5000.0)
}

/**
 *@time: 2018/8/14上午11:38
 *@author:QingMings(1821063757@qq.com)
 *@desc: 扩展 cesium ToolBar
 */
iez3d.prototype.extendCesiumToolBar = function () {
  var ToolBarExt = Vue.extend(CesiumToolBarExtend)
  var component = new ToolBarExt({store: store, parent: this.vueComponent}).$mount()
  document.getElementsByClassName('cesium-viewer-toolbar').item(0).appendChild(component.$el)
}
/**
 *@time: 2018/8/15下午1:54
 *@author:QingMings(1821063757@qq.com)
 *@desc: 设置 cesium.Viewer 默认朝向
 * @param {Number} [west=0.0] The westernmost longitude in degrees in the range [-180.0, 180.0].
 * @param {Number} [south=0.0] The southernmost latitude in degrees in the range [-90.0, 90.0].
 * @param {Number} [east=0.0] The easternmost longitude in degrees in the range [-180.0, 180.0].
 * @param {Number} [north=0.0] The northernmost latitude in degrees in the range [-90.0, 90.0].
 */
iez3d.prototype.defaultViewRectangle = function (west, south, east, north) {
  Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(west, south, east, north)
}
/**
 * @time: 2018/8/22下午1:59
 * @author:QingMings(1821063757@qq.com)
 * @desc: 将 canvas 坐标转换
 * @param {Number} x   canvas  X coordinates
 * @param {Number} y   canvas  Y coordinates
 */
iez3d.prototype.canvasPositionToCartesian3 = function (x, y) {
  let cartesian3 = this.scene.globe.pick(this.camera.getPickRay(new Cesium.Cartesian2(x, y)), this.scene)
  return cartesian3
}
/**
 * @time: 2018/8/23上午9:48
 * @author:QingMings(1821063757@qq.com)
 * @desc: 天地图中文标注
 *
 */
iez3d.prototype.addTdtImgAnnoLayer = function () {
  this.viewer.imageryLayers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
    url: 'http://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles',
    layer: '全球影像中文注记服务',
    style: 'default',
    format: 'image/jpeg',
    tileMatrixSetID: 'GoogleMapsCompatible',
    show: false
  }))
}

/**
 * @time: 2018/8/23上午11:38
 * @author:QingMings(1821063757@qq.com)
 * @desc: 创建 Cesium BaseLayerPicker 控件
 *
 */
iez3d.prototype.baseLayerPicker = function () {
  const baseLayersPicker = new Cesium.BaseLayerPicker('BaseLayersPicker', {
    globe: this.scene.globe,
    imageryProviderViewModels: imageryViewModels
  })
}
/**
 * @time: 2018/8/27下午2:24
 * @author:QingMings(1821063757@qq.com)
 * @desc: 显示经纬度和高度信息
 *
 */
iez3d.prototype.showLatLonHeightProprety = function () {
  this.handler.setInputAction((movement) => {
    const scene = this.scene
    if (scene.mode !== Cesium.SceneMode.MORPHING) {
      const pickedObject = scene.pick(movement.endPosition)
      if (scene.pickPositionSupported && Cesium.defined(pickedObject)) {
        // 在模型上显示
        const cartesian = scene.pickPosition(movement.endPosition)
        if (Cesium.defined(cartesian)) {
          const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
          const longStr = Cesium.Math.toDegrees(cartographic.longitude).toFixed(8)
          const latStr = Cesium.Math.toDegrees(cartographic.latitude).toFixed(8)
          const heightStr = cartographic.height.toFixed(2)
          this.eventbus.$emit('updateLatLon', `经度：${longStr} 纬度：${latStr} 高度：${heightStr}米`)
        }
      } else {
        // 再球上显示经纬度
        const cartesian = this.camera.pickEllipsoid(movement.endPosition, scene.globe.ellipsoid)
        if (cartesian) {
          const cartographic = this.scene.globe.ellipsoid.cartesianToCartographic(cartesian)
          const longStr = Cesium.Math.toDegrees(cartographic.longitude).toFixed(8)
          const latStr = Cesium.Math.toDegrees(cartographic.latitude).toFixed(8)
          this.eventbus.$emit('updateLatLon', `经度：${longStr} 纬度：${latStr}`)
        } else {
          this.eventbus.$emit('updateLatLon', '')
        }
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
}

/**
 * @time: 2018/8/29上午10:52
 * @author:QingMings(1821063757@qq.com)
 * @desc: 图层、数据管理
 *
 */
iez3d.prototype.layerManager = function () {
  this.dataManager = new LayerManagerEventHandler(this)
}

/**
 * @time: 2018/8/30下午2:04
 * @author: QingMings(1821063757@qq.com)
 * @desc: 错误提示 依赖 {vue}  {iview.Message}
 *
 */
iez3d.prototype.error = function (message) {
  this.vueComponent.$Message.error(error(message))
}
/**
 * @time: 2018/8/30下午2:05
 * @author: QingMings(1821063757@qq.com)
 * @desc: 消息提示 依赖 {vue}  {iview.Message}
 *
 */
iez3d.prototype.info = function (message) {
  this.vueComponent.$Message.info(info(message))
}
// 测试加载 gltf
iez3d.prototype.test = function (url, height) {
  var position = Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, height)
  var heading = Cesium.Math.toRadians(135)
  var pitch = 0
  var roll = 0
  var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll)
  var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr)

  var entity = this.viewer.entities.add({
    name: url,
    position: position,
    orientation: orientation,
    model: {
      uri: url,
      minimumPixelSize: 128,
      maximumScale: 20000

    }
  })
  this.viewer.trackedEntity = entity
}
// 事件处理程序集合
iez3d.prototype.eventHandler = function () {
  this.layerManager()
  this.screenshotsSupport()
  this.toolCaseSupport()
  this.settingsSupport()
}
// 常用工具事件处理
iez3d.prototype.toolCaseSupport = function () {
  this.toolcase = new ToolCaseEventHandler(this)
}
// 设置 事件处理程序
iez3d.prototype.settingsSupport = function () {
  this.settings = new SettingEventHandler(this)
}
// 场景截图事件监听
iez3d.prototype.screenshotsSupport = function () {
  this.eventbus.$on(Event.ScreenShots, () => {
    this.screenshots()
  })
}
// 场景截图
iez3d.prototype.screenshots = function () {
  let canvas = this.scene.canvas
  // const ctx = canvas.getContext('2d')
  canvas.toBlob(blob => {
    FileSaver.saveAs(blob, '场景截图.png')
  })
}
export default iez3d
