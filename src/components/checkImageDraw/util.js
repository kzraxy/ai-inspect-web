
function drawInfoParamsPolygon(data) {
  if (!data || !data.polygons || !(data.polygons instanceof Array)) {
    return null
    // return {
    //   type: 'polygon',
    //   points: []
    // }
  }
  const _polygons = data.polygons.map((item) => {
    return {
      x: item.x,
      y: item.y
    }
  })
  return {
    type: 'polygon',
    color: data.color,
    points: _polygons
  }
}

export {
  drawInfoParamsPolygon
}

