'use strict'

module.exports = (dateStr) => {
  let year = new Date(dateStr).getFullYear()
  let month = new Date(dateStr).getMonth()
  let day = new Date(dateStr).getDay()

  var monthArr = []
  monthArr[1] = 'Jan'
  monthArr[2] = 'Feb'
  monthArr[3] = 'Mar'
  monthArr[4] = 'Apr'
  monthArr[5] = 'May'
  monthArr[6] = 'Jun'
  monthArr[7] = 'Jul'
  monthArr[8] = 'Aug'
  monthArr[9] = 'Sep'
  monthArr[10] = 'Oct'
  monthArr[11] = 'Nov'
  monthArr[12] = 'Dec'

  return monthArr[month] + ' ' + day + ', ' + year
}