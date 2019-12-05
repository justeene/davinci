/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

import { IChartProps } from '../../components/Chart'
import {
  decodeMetricName,
  getChartTooltipLabel,
  getAggregatorLocale
} from '../../components/util'
import {
  getDimetionAxisOption,
  getMetricAxisOption,
  getLabelOption,
  getLegendOption,
  getGridPositions,
  makeGrouped,
  distinctXaxis
} from './util'
import { EChartOption } from 'echarts'
import { getFormattedValue } from '../../components/Config/Format'
const defaultTheme = require('assets/json/echartsThemes/default.project.json')
const defaultThemeColors = defaultTheme.theme.color

export default function (chartProps: IChartProps) {
  const {
    data,
    cols,
    metrics,
    chartStyles
  } = chartProps

  const {
    spec,
    label,
    xAxis,
    yAxis,
    splitLine,
    waterFallConfig
  } = chartStyles

  const {
    showVerticalLine,
    verticalLineColor,
    verticalLineSize,
    verticalLineStyle,
    showHorizontalLine,
    horizontalLineColor,
    horizontalLineSize,
    horizontalLineStyle
  } = splitLine

  const labelOption = {
    label: getLabelOption('waterfall', label, metrics)
  }
  labelOption.label.normal.distance = 2
  const xAxisData = data.map((d) => d[cols[0].name] || '')
  let sourceData = []

  const series = []

  metrics.forEach((m) => {
    const metricName = `${m.agg}(${decodeMetricName(m.name)})`
    sourceData = data.map((d) => d[metricName])
    const baseData = []
    const seriesBaseData = [...data]
    const ascendOrder = []
    const discendOrder = []
    const rateOrder = []
    const fluctucateRateOrder = []
    let lastResult = 0
    sourceData.forEach((a, index) => {
      a = parseFloat(a)
      if (index > 0) {
        var lastSource = parseFloat(sourceData[index - 1])

        const result = a - lastSource
        if (result >= 0) {
          ascendOrder.push(result)
          discendOrder.push('-')
          baseData.push(lastSource)
        } else {
          ascendOrder.push('-')
          discendOrder.push(Math.abs(result))
          baseData.push(lastSource - Math.abs(result))
        }
        rateOrder.push(lastSource == 0 ? 0 : result * 100.0 / lastSource)
        let fluctucateRate=lastResult == 0 ? ((result - lastResult) * 100.0 / 1) : ((result - lastResult) * 100.0 / lastResult)
        if(fluctucateRate>10000){
          fluctucateRate=10000
        }
        fluctucateRateOrder.push(fluctucateRate)
        lastResult = result
        return result
      } else {
        ascendOrder.push(a)
        discendOrder.push('-')
        baseData.push(0)
        rateOrder.push(0)
        fluctucateRateOrder.push(0)
        lastResult = a
        return a
      }
    })
    const totalAscend = ascendOrder.reduce((sum, val) => typeof val === 'number' ? sum + val : sum + 0, 0)
    const totalDiscendOrder = discendOrder.reduce((sum, val) => typeof val === 'number' ? sum + val : sum + 0, 0)
    const difference = totalAscend - totalDiscendOrder
    xAxisData.push('累计')
    baseData.push('-')
    if (difference > 0) {
      ascendOrder.push(difference)
      discendOrder.push('-')
    } else {
      discendOrder.push(Math.abs(difference))
      ascendOrder.push('-')
    }
    const baseDataObj = {
      name: `[${getAggregatorLocale(m.agg)}] ${decodeMetricName(m.name)}`,
      type: 'bar',
      sampling: 'average',
      stack: 'stack',
      data: baseData,
      itemStyle: {
        normal: {
          barBorderColor: 'rgba(0,0,0,0)',
          color: 'rgba(0,0,0,0)'
          // opacity: interactIndex === undefined ? 1 : 0.25
        },
        emphasis: {
          barBorderColor: 'rgba(0,0,0,0)',
          color: 'rgba(0,0,0,0)'
        }
      }
    }

    const ascendOrderObj = {
      name: '升',
      type: 'bar',
      sampling: 'average',
      stack: 'stack',
      data: ascendOrder,
      itemStyle: {
        // normal: {
        //   opacity: interactIndex === undefined ? 1 : 0.25
        // }
      },
      ...labelOption
    }

    const discendOrderObj = {
      name: '降',
      type: 'bar',
      sampling: 'average',
      stack: 'stack',
      data: discendOrder,
      itemStyle: {
        // normal: {
        //   opacity: interactIndex === undefined ? 1 : 0.25
        // }
      },
      ...labelOption
    }
    series.push(baseDataObj)
    series.push(ascendOrderObj)
    series.push(discendOrderObj)


    let count=0
    if (waterFallConfig!=undefined&&waterFallConfig.showIncrease) {
      count++
      const rateLineObj = {
        name: '增长率',
        type: 'line',
        data: rateOrder,
        yAxisIndex: count,
        smooth: true,
        itemStyle: {
          // normal: {
          //   opacity: interactIndex === undefined ? 1 : 0.25
          // }
        },
        ...labelOption
      }
      series.push(rateLineObj)
    }
    if (waterFallConfig!=undefined&&waterFallConfig.showFluctuate) {
      count++
      const fluctucateLineObj = {
        name: '波动率',
        type: 'line',
        data: fluctucateRateOrder,
        yAxisIndex: count,
        smooth: true,
        itemStyle: {
          // normal: {
          //   opacity: interactIndex === undefined ? 1 : 0.25
          // }
        },
        ...labelOption
      }
      series.push(fluctucateLineObj)
    }
    


  })

  const seriesNames = series.map((s) => s.name)

  const xAxisSplitLineConfig = {
    showLine: showVerticalLine,
    lineColor: verticalLineColor,
    lineSize: verticalLineSize,
    lineStyle: verticalLineStyle
  }

  const yAxisSplitLineConfig = {
    showLine: showHorizontalLine,
    lineColor: horizontalLineColor,
    lineSize: horizontalLineSize,
    lineStyle: horizontalLineStyle
  }

  const tooltip: EChartOption.Tooltip = {
    trigger: 'axis',
    formatter(param: EChartOption.Tooltip.Format[]) {
      let color
      const text = param.map((pa, index) => {
        const data = !index ? parseFloat(sourceData[pa.dataIndex]) : pa.data
        if (typeof data === 'number') {
          color = pa.color
        }
        const formattedValue = getFormattedValue(data, metrics[0].format)
        return `${pa.seriesName}: ${formattedValue}`
      })
      const xAxis = param[0]['axisValue']
      if (xAxis === '累计') {
        return ''
      } else {
        text.unshift(xAxis)
        if (color) {
          text[0] = `<span class="widget-tooltip-circle" style="background: ${color}"></span>` + text[0]
        }
        return text.join('<br/>')
      }
    }
  }
  var yAxisTemp = []
  //第一次push是左y
  yAxisTemp.push(getMetricAxisOption(yAxis, yAxisSplitLineConfig, metrics.map((m) => decodeMetricName(m.name)).join(` / `)))
  yAxisTemp[0].splitNumber = 4
  let count=0
  //第二次push的是右y
  if (waterFallConfig!=undefined&&waterFallConfig.showIncrease) {
    count++
    const temp=getMetricAxisOption(yAxis, yAxisSplitLineConfig, metrics.map((m) => decodeMetricName(m.name)).join(` / `))
    temp.name = '增长率'
    temp.max = undefined
    temp.min = undefined
    temp.axisLabel.formatter = '{value} %'
    yAxisTemp.push(temp)
  }
  //第三次push的是右y2
  if (waterFallConfig!=undefined&&waterFallConfig.showFluctuate) {
    count++
    const temp=getMetricAxisOption(yAxis, yAxisSplitLineConfig, metrics.map((m) => decodeMetricName(m.name)).join(` / `))
    temp.name = '波动率'
    temp.max = undefined
    temp.min = undefined
    temp.axisLabel.formatter = '{value} %'
    temp.splitNumber = 4
    if(count>1){
      temp.offset = 60
    }
    yAxisTemp.push(temp)
    
  }
  var gridTemp = getGridPositions({ showLegend: false }, seriesNames, '', false, yAxis, xAxis, xAxisData)
  
  gridTemp.right = (count*60)+'px'
  gridTemp.top = '35px'
  
  return {
    xAxis: getDimetionAxisOption(xAxis, xAxisSplitLineConfig, xAxisData),
    yAxis: yAxisTemp,
    series,
    tooltip,
    grid: gridTemp
  }
}
