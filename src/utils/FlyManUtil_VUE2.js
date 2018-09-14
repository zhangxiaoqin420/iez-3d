import Cesium from 'cesium/Cesium';
var FlyManTool = {
	moduleDef() {
		var e = function(e) {
			e.contextObj || new Error("请检查函数参数");
			this._contextObj = e.contextObj
		};
		e.prototype.runFlyOnPath = function(e) {
			var a = this;
			var i = e.start || Cesium.JulianDate.fromDate(new Date(2017, 2, 25, 16));
			var t = e.duringTime || 3600;
			var r = Cesium.JulianDate.addSeconds(i, t, new Cesium.JulianDate);
			var o = e.multiplier || 1;
			var l = e.flyHeight || 1e4;
			var n = e.staticPos || [117.244548, 40.21395];
			var m = e.modelUrl || "./sampledata/model/CesiumAir/Cesium_Air.gltf";
			var s = e.modelMinimumPixelSize || 54;
			var u = e.modelMaximumScale || 5;
			var c = e.pathGeoJsonUrl || "./sampledata/map97geo.json";
			var v = e.pathShow || !!1;
			var p = e.pathLeadTime || 0;
			var d = e.pathTrailTime || 60;
			var C = e.pathWidth || 1;
			var h = e.pathResolution || 1;
			var w = e.pathColor || Cesium.Color.PALEGOLDENROD;
			var y = e.pathGlowPower || .3;
			var f = e.flySpeed || 50;
			a._contextObj.clock.startTime = i.clone();
			a._contextObj.clock.stopTime = r.clone();
			a._contextObj.clock.currentTime = i.clone();
			a._contextObj.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
			a._contextObj.clock.multiplier = o;
			var O = Cesium.Cartesian3.fromDegrees(n[0], n[1], l);
			var T = a._contextObj.entities.add({
				availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
					start: i,
					stop: r
				})]),
				model: {
					uri: m,
					color: k("red", 1),
					minimumPixelSize: s,
					maximumScale: u
				},
				position: O,
				path: {
					show: v,
					leadTime: p,
					trailTime: d,
					width: C,
					resolution: h,
					material: new Cesium.PolylineGlowMaterialProperty({
						glowPower: y,
						color: w
					})
				}
			});
			a._contextObj.trackedEntity = T;
			Cesium.loadJson(c).then(function(e) {
				var a = e.features[0].geometry.coordinates;
				var t = J(i, l, f, a);
				T.position = t;
				T.orientation = new Cesium.VelocityOrientationProperty(t)
			}).otherwise(function(e) {
				console.log(e)
			})
		};
		e.prototype.runFlyOnPath2 = function(e) {
			var a = this;
			var t = e.start || Cesium.JulianDate.fromDate(new Date(2017, 2, 25, 16));
			var r = e.duringTime || 3600;
			var o = Cesium.JulianDate.addSeconds(t, r, new Cesium.JulianDate);
			var l = e.multiplier || 1;
			var n = e.flyHeight || 1e4;
			var m = e.staticPos || [117.244548, 40.21395];
			var s = e.modelUrl || "./sampledata/model/CesiumAir/Cesium_Air.gltf";
			var u = e.modelMinimumPixelSize || 54;
			var c = e.modelMaximumScale || 5;
			var v = e.pathGeoJsonUrl || "./sampledata/map97geo.json";
			var p = e.pathShow || !!1;
			var d = e.pathLeadTime || 0;
			var C = e.pathTrailTime || 60;
			var h = e.pathWidth || 1;
			var w = e.pathResolution || 1;
			var y = e.pathColor || Cesium.Color.PALEGOLDENROD;
			var f = e.pathGlowPower || .3;
			var O = e.flySpeed || 50;
			var T = e.flyPathJsVar || {
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
			a._contextObj.clock.stopTime = o.clone();
			a._contextObj.clock.currentTime = t.clone();
			a._contextObj.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
			a._contextObj.clock.multiplier = l;
			var g = Cesium.Cartesian3.fromDegrees(m[0], m[1], n);
			var P = a._contextObj.entities.add({
				availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
					start: t,
					stop: o
				})]),
				model: {
					uri: s,
					color: k("red", 1),
					minimumPixelSize: u,
					maximumScale: c
				},
				position: g,
				path: {
					show: p,
					leadTime: d,
					trailTime: C,
					width: h,
					resolution: w,
					material: new Cesium.PolylineGlowMaterialProperty({
						glowPower: f,
						color: y
					})
				}
			});
			a._contextObj.trackedEntity = P;
			var _ = T.features[0];
			var x = _.geometry.coordinates;
			var D = [];
			for (var i = 0; i < x.length; i++) {
				var S = x[i][0];
				var b = x[i][1];
				D.push([S, b])
			}
			var j = J(t, n, O, D);
			P.position = j;
			P.orientation = new Cesium.VelocityOrientationProperty(j)
		};

		function k(e, a) {
			var t = Cesium.Color[e.toUpperCase()];
			return Cesium.Color.fromAlpha(t, parseFloat(a))
		}

		function J(e, a, t, i) {
			var r = new Cesium.SampledPositionProperty;
			var o = t || 50;
			for (var l = 0; l < i.length; l++) {
				if (l == 0) {
					var n = Cesium.JulianDate.addSeconds(e, l, new Cesium.JulianDate);
					var m = Cesium.Cartesian3.fromDegrees(i[l][0], i[l][1], a);
					r.addSample(n, m)
				}
				if (l < 1e4 && l > 0) {
					var s = new Cesium.Cartesian3(r._property._values[l * 3 - 3], r._property._values[l * 3 - 2], r._property._values[l * 3 - 1]);
					var m = Cesium.Cartesian3.fromDegrees(i[l][0], i[l][1], a);
					var u = [Cesium.Ellipsoid.WGS84.cartesianToCartographic(s), Cesium.Ellipsoid.WGS84.cartesianToCartographic(m)];
					var c = new Cesium.EllipsoidGeodesic(u[0], u[1]);
					var v = c.surfaceDistance;
					var p = v / o;
					var n = Cesium.JulianDate.addSeconds(r._property._times[l - 1], p, new Cesium.JulianDate);
					r.addSample(n, m)
				}
			}
			return r
		}
		Cesium.FlyManTool = e
	}
}
export default FlyManTool;