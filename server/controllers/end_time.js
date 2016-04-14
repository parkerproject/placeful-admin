'use strict'
module.exports = (endTime) => {
  // let endTime = '9:00 AM'
  let endTimeString
  if (endTime.includes('PM')) {
    let res = endTime.replace('PM', '')
    res = res.trim()
    let hh = res.split(':')[0]
    let mm = res.split(':')[1]
    hh = Number(hh) + 12
    let timeStr = String(hh) + ':' + mm
    endTimeString = timeStr
  }
  if (endTime.includes('AM')) {
    let str = endTime.replace('AM', '')
    str = str.trim()
    let hh = str.split(':')[0]
    let mm = str.split(':')[1]
    hh = '0' + hh
    let timeStr = hh + ':' + mm
    endTimeString = timeStr
  }
  return endTimeString
}
