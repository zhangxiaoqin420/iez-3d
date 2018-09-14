import Cesium from 'cesium/Cesium';
var FlyManTool = {
	moduleDef() {
		var e = function(e) {
			e.contextObj || new Error("请检查函数参数");
			this._contextObj = e.contextObj;
			this._entityId = undefined;
			this._entityId2 = undefined;
			this._openFlyMode = false;
			this._flyTotalTime = 0;
			this._alertCallback = undefined;
			this._basierSmooth = false
		};
		
		e.prototype.closeFlyOnPath2 = function(e) {
			var a = this;
			if (!a._openFlyMode) {
				if (e.alertCallback) {
					a._alertCallback = e.alertCallback;
					a._alertCallback("飞行模式还没有启动！")
				} else {
					alert("飞行模式还没有启动！")
				}
				return
			}
			a._contextObj.trackedEntity = undefined;
			console.log("_self._entityId=", a._entityId);
			a._contextObj.entities.removeById(a._entityId);
			if (a._basierSmooth) {
				a._contextObj.entities.removeById(a._entityId2)
			}
			a._contextObj.clock.shouldAnimate = false;
			a._openFlyMode = false
		};
		e.prototype.runFlyOnPath2 = function(e) {
			var a = this;
			if (a._openFlyMode) {
				alert("飞行模式已启动！");
				return
			}
			a._openFlyMode = true;
			var t = e.start || Cesium.JulianDate.fromDate(new Date(2017, 2, 25, 16));
			var r = e.duringTime || 3600;
			var i = Cesium.JulianDate.addSeconds(t, r, new Cesium.JulianDate);
			var o = e.multiplier || 1;
			var l = e.flyHeight || 1e4;
			var n = e.staticPos || [117.244548, 40.21395];
			var s = e.modelUrl || "./sampledata/model/CesiumAir/Cesium_Air.gltf";
			var m = e.modelMinimumPixelSize || 54;
			var c = e.modelMaximumScale || 5;
			var u = e.pathGeoJsonUrl || "./sampledata/map97geo.json";
			var v = e.pathShow || !!1;
			var p = e.pathLeadTime || 0;
			var d = e.pathTrailTime || 60;
			var h = e.pathWidth || 1;
			var C = e.pathResolution || 1;
			var y = e.pathColor || Cesium.Color.PALEGOLDENROD;
			var w = e.pathGlowPower || .3;
			var _ = e.flySpeed || 50;
			var f = new Date;
			var x = "id" + f.getTime();
			var T = e.entityId || x;
			var b = e.flyPathJsVar || {
				type: "FeatureCollection",
				features: [{
					type: "Feature",
					properties: {},
					geometry: {
						type: "LineString",
						coordinates: [
							[117.24326, 40.21185],
							[117.24289, 40.21263],
							[117.24259, 40.2138]
						]
					}
				}]
			};
			a._contextObj.clock.startTime = t.clone();
			a._contextObj.clock.stopTime = i.clone();
			a._contextObj.clock.currentTime = t.clone();
			a._contextObj.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
			a._contextObj.clock.multiplier = o;
			a._contextObj.clock.canAnimate = true;
			a._contextObj.clock.shouldAnimate = false;
			var O = Cesium.Cartesian3.fromDegrees(n[0], n[1], l);
			var g = a._contextObj.entities.add({
				id: T,
				availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
					start: t,
					stop: i
				})]),
				model: {
					uri: s,
					minimumPixelSize: m,
					maximumScale: c
				},
				position: O,
				path: {
					show: v,
					leadTime: p,
					trailTime: d,
					width: h,
					resolution: C,
					material: new Cesium.PolylineGlowMaterialProperty({
						glowPower: w,
						color: y
					})
				}
			});
			a._contextObj.trackedEntity = g;
			a._entityId = T;
			var S = b.features[0];
			var P = S.geometry.coordinates;
			var D = [];
			for (var k = 0; k < P.length; k++) {
				var M = P[k][0];
				var j = P[k][1];
				D.push([M, j])
			}
			var J = new Object;
			var G = I.call(J, t, l, _, D);
			a._flyTotalTime = J.totalTime;
			i = Cesium.JulianDate.addSeconds(t, a._flyTotalTime, new Cesium.JulianDate);
			a._contextObj.clock.stopTime = i.clone();
			a._contextObj.clock.shouldAnimate = true;
			console.log("tmpObj=", J);
			g.position = G;
			g.orientation = new Cesium.VelocityOrientationProperty(G)
		};
		

		function T(e, a) {
			var t = Cesium.Color[e.toUpperCase()];
			return Cesium.Color.fromAlpha(t, parseFloat(a))
		}

		function ee(e, a, t, r) {
			var i = 0;
			var o = 0;
			var l = new Cesium.SampledPositionProperty;
			var n = t || 50;
			for (var s = 0; s < r.length; s++) {
				if (s == 0) {
					var m = Cesium.JulianDate.addSeconds(e, s, new Cesium.JulianDate);
					var c = Cesium.Cartesian3.fromDegrees(r[s].x, r[s].y, a);
					l.addSample(m, c);
					o = o + 1
				}
				if (s < 1e4 && s > 0) {
					var u = new Cesium.Cartesian3(l._property._values[o * 3 - 3], l._property._values[o * 3 - 2], l._property._values[o * 3 - 1]);
					var c = Cesium.Cartesian3.fromDegrees(r[s].x, r[s].y, a);
					var v = [Cesium.Ellipsoid.WGS84.cartesianToCartographic(u), Cesium.Ellipsoid.WGS84.cartesianToCartographic(c)];
					var p = new Cesium.EllipsoidGeodesic(v[0], v[1]);
					var d = p.surfaceDistance;
					var h;
					if (Cesium.defined(d)) {
						h = d / n;
						if (h > 1e-6) {
							i = i + h;
							var m = Cesium.JulianDate.addSeconds(l._property._times[o - 1], h, new Cesium.JulianDate);
							l.addSample(m, c);
							o = o + 1
						}
					}
				}
			}
			this.totalTime = i;
			return l
		}

		function I(e, a, t, r) {
			var i = 0;
			var o = new Cesium.SampledPositionProperty;
			var l = t || 50;
			for (var n = 0; n < r.length; n++) {
				if (n == 0) {
					var s = Cesium.JulianDate.addSeconds(e, n, new Cesium.JulianDate);
					var m = Cesium.Cartesian3.fromDegrees(r[n][0], r[n][1], a);
					o.addSample(s, m)
				}
				if (n < 1e4 && n > 0) {
					var c = new Cesium.Cartesian3(o._property._values[n * 3 - 3], o._property._values[n * 3 - 2], o._property._values[n * 3 - 1]);
					var m = Cesium.Cartesian3.fromDegrees(r[n][0], r[n][1], a);
					var u = [Cesium.Ellipsoid.WGS84.cartesianToCartographic(c), Cesium.Ellipsoid.WGS84.cartesianToCartographic(m)];
					var v = new Cesium.EllipsoidGeodesic(u[0], u[1]);
					var p = v.surfaceDistance;
					var d = p / l;
					i = i + d;
					var s = Cesium.JulianDate.addSeconds(o._property._times[n - 1], d, new Cesium.JulianDate);
					o.addSample(s, m)
				}
			}
			this.totalTime = i;
			return o
		}

		function b(e, a, t, r) {
			var i = new Cesium.SampledPositionProperty;
			var o = t || 50;
			for (var l = 0; l < r.length; l++) {
				if (l == 0) {
					var n = Cesium.JulianDate.addSeconds(e, l, new Cesium.JulianDate);
					var s = Cesium.Cartesian3.fromDegrees(r[l][0], r[l][1], a);
					i.addSample(n, s)
				}
				if (l < 1e4 && l > 0) {
					var m = new Cesium.Cartesian3(i._property._values[l * 3 - 3], i._property._values[l * 3 - 2], i._property._values[l * 3 - 1]);
					var s = Cesium.Cartesian3.fromDegrees(r[l][0], r[l][1], a);
					var c = [Cesium.Ellipsoid.WGS84.cartesianToCartographic(m), Cesium.Ellipsoid.WGS84.cartesianToCartographic(s)];
					var u = new Cesium.EllipsoidGeodesic(c[0], c[1]);
					var v = u.surfaceDistance;
					var p = v / o;
					var n = Cesium.JulianDate.addSeconds(i._property._times[l - 1], p, new Cesium.JulianDate);
					i.addSample(n, s)
				}
			}
			return i
		}

		function ae(e) {
			var a = [];
			var t = e.length;
			var r = e.length;
			var i = 1e-21;
			if (Math.abs(e[0].x - e[t - 1].x) < i && Math.abs(e[0].y - e[t - 1].y) < i) {
				for (var o = 0; o < r; o++) {
					if (o <= r - 4) {
						for (var l = 0; l <= 1; l += .1) {
							var n = Math.pow(1 - l, 3) / 6;
							var s = (3 * Math.pow(l, 3) - 6 * Math.pow(l, 2) + 4) / 6;
							var m = (-3 * Math.pow(l, 3) + 3 * Math.pow(l, 2) + 3 * l + 1) / 6;
							var c = Math.pow(l, 3) / 6;
							var u = n * e[o].x + s * e[o + 1].x + m * e[o + 2].x + c * e[o + 3].x;
							var v = n * e[o].y + s * e[o + 1].y + m * e[o + 2].y + c * e[o + 3].y;
							a.push({
								x: u,
								y: v
							})
						}
					} else if (o == r - 3) {
						for (var l = 0; l <= 1; l += .1) {
							var n = Math.pow(1 - l, 3) / 6;
							var s = (3 * Math.pow(l, 3) - 6 * Math.pow(l, 2) + 4) / 6;
							var m = (-3 * Math.pow(l, 3) + 3 * Math.pow(l, 2) + 3 * l + 1) / 6;
							var c = Math.pow(l, 3) / 6;
							var u = n * e[o].x + s * e[o + 1].x + m * e[o + 2].x + c * e[0].x;
							var v = n * e[o].y + s * e[o + 1].y + m * e[o + 2].y + c * e[0].y;
							a.push({
								x: u,
								y: v
							})
						}
					} else if (o == r - 2) {
						for (var l = 0; l <= 1; l += .1) {
							var n = Math.pow(1 - l, 3) / 6;
							var s = (3 * Math.pow(l, 3) - 6 * Math.pow(l, 2) + 4) / 6;
							var m = (-3 * Math.pow(l, 3) + 3 * Math.pow(l, 2) + 3 * l + 1) / 6;
							var c = Math.pow(l, 3) / 6;
							var u = n * e[o].x + s * e[o + 1].x + m * e[0].x + c * e[1].x;
							var v = n * e[o].y + s * e[o + 1].y + m * e[0].y + c * e[1].y;
							a.push({
								x: u,
								y: v
							})
						}
					} else if (o == r - 1) {
						for (var l = 0; l <= 1; l += .1) {
							var n = Math.pow(1 - l, 3) / 6;
							var s = (3 * Math.pow(l, 3) - 6 * Math.pow(l, 2) + 4) / 6;
							var m = (-3 * Math.pow(l, 3) + 3 * Math.pow(l, 2) + 3 * l + 1) / 6;
							var c = Math.pow(l, 3) / 6;
							var u = n * e[o].x + s * e[0].x + m * e[1].x + c * e[2].x;
							var v = n * e[o].y + s * e[0].y + m * e[1].y + c * e[2].y;
							a.push({
								x: u,
								y: v
							})
						}
					}
				}
			} else {
				a.push({
					x: e[0].x,
					y: e[0].y
				});
				for (var o = 0; o < r; o++) {
					if (o <= r - 4) {
						for (var l = 0; l <= 1; l += .1) {
							var n = Math.pow(1 - l, 3) / 6;
							var s = (3 * Math.pow(l, 3) - 6 * Math.pow(l, 2) + 4) / 6;
							var m = (-3 * Math.pow(l, 3) + 3 * Math.pow(l, 2) + 3 * l + 1) / 6;
							var c = Math.pow(l, 3) / 6;
							var u = n * e[o].x + s * e[o + 1].x + m * e[o + 2].x + c * e[o + 3].x;
							var v = n * e[o].y + s * e[o + 1].y + m * e[o + 2].y + c * e[o + 3].y;
							a.push({
								x: u,
								y: v
							})
						}
					}
				}
				a.push({
					x: e[r - 1].x,
					y: e[r - 1].y
				})
			}
			return a
		}
		Cesium.FlyManTool = e
	}
}
export default FlyManTool;