import * as React from 'react'
import { IChartProps } from './index'
import chartlibs from '../../config/chart'
import * as echarts from 'echarts/lib/echarts'
import { ECharts } from 'echarts'
import chartOptionGenerator from '../../render/chart'
import { getTriggeringRecord } from '../util'
const styles = require('./Chart.less')


export class Chart extends React.PureComponent<IChartProps> {
  private container: HTMLDivElement = null
  private instance: ECharts
  constructor(props) {
    super(props)
  }
  public componentDidMount() {
    this.renderChart(this.props)
  }

  public componentDidUpdate() {
    this.renderChart(this.props)
  }

  private renderChart = (props: IChartProps) => {
    const { selectedChart, renderType, getDataDrillDetail, isDrilling, onSelectChartsItems, onDoInteract, onCheckTableInteract } = props

    if (renderType === 'loading') {
      return
    }
    if (!this.instance) {
      this.instance = echarts.init(this.container, 'default')
    } else {
      if (renderType === 'rerender') {
        this.instance.dispose()
        this.instance = echarts.init(this.container, 'default')
      }
      if (renderType === 'clear') {
        this.instance.clear()
      }
    }
    var option = chartOptionGenerator(
      chartlibs.find((cl) => cl.id === selectedChart).name,
      props,
      {
        instance: this.instance,
        isDrilling,
        getDataDrillDetail,
        selectedItems: this.props.selectedItems
      }
    )
    //console.log(JSON.stringify(option))
    // var lineData = []
    // option.series.forEach(item => {
    //   if (item.name == '升') {
    //     var lastVal = 0
    //     for(var i=0;i<item.data.length;i++){
    //       if (lastVal == 0) {
    //         lineData.push(0)
    //       } else {
    //         lineData.push(val * 100 / lastVal)
    //       }
    //       lastVal = val
    //     }
    //   }
    // })
    // var line = {
    //   yAxisIndex: 1,
    //   type: 'line',
    //   data: lineData
    // }
    // if (lineData.length > 0) {
    //   option.series.push(line)
    //   var temp=option.yAxis
    //   option.yAxis=[]
    //   option.yAxis.push(temp)
    //   option.yAxis.push(
    //     {
    //       name: '百分比',
    //       type: 'value'
    //     })
    // }

    this.instance.setOption(option)


    // if (onDoInteract) {
    //   this.instance.off('click')
    //   this.instance.on('click', (params) => {
    //     const isInteractiveChart = onCheckTableInteract()
    //     if (isInteractiveChart) {
    //       const triggerData = getTriggeringRecord(params, seriesData)
    //       onDoInteract(triggerData)
    //     }
    //   })
    // }

    this.instance.off('click')
    this.instance.on('click', (params) => {
      this.collectSelectedItems(params)
    })
    this.instance.resize()
  }

  public collectSelectedItems = (params) => {
    const { data, onSelectChartsItems, selectedChart, onDoInteract, onCheckTableInteract } = this.props
    let selectedItems = []


    if (this.props.selectedItems && this.props.selectedItems.length) {
      selectedItems = [...this.props.selectedItems]
    }


    const { getDataDrillDetail } = this.props
    let dataIndex = params.dataIndex
    if (selectedChart === 4) {
      dataIndex = params.seriesIndex
    }
    //将之前的查询清空
    if (!(selectedItems.length == 1 && selectedItems[0] == dataIndex)) {
      selectedItems = []
    }
    if (selectedItems.length === 0) {
      selectedItems.push(dataIndex)
    } else {
      const isb = selectedItems.some((item) => item === dataIndex)
      if (isb) {
        for (let index = 0, l = selectedItems.length; index < l; index++) {
          if (selectedItems[index] === dataIndex) {
            selectedItems.splice(index, 1)
            break
          }
        }
      } else {
        selectedItems.push(dataIndex)
      }
    }
    var resultData = selectedItems.map((item) => {
      return data[item]
    })
    //修复柱状图堆叠selectedItems计算错误问题
    if (selectedChart == 3) {
      var selectName = params.name
      for (var i = 0; i < data.length; i++) {
        if (JSON.stringify(data[i]).indexOf(selectName) > -1) {
          resultData[0] = data[i];
          break;
        }
      }
    }
    const brushed = [{ 0: Object.values(resultData) }]
    const sourceData = Object.values(resultData)
    const isInteractiveChart = onCheckTableInteract && onCheckTableInteract()
    if (isInteractiveChart && onDoInteract) {
      const triggerData = sourceData
      //联动功能
      onDoInteract(triggerData)
    }
    setTimeout(() => {
      if (getDataDrillDetail) {
        getDataDrillDetail(JSON.stringify({ range: null, brushed, sourceData }))
      }
    }, 500)
    if (onSelectChartsItems) {
      onSelectChartsItems(selectedItems)
    }
  }
  public render() {
    return (
      <div
        className={styles.chartContainer}
        ref={(f) => this.container = f}
      />
    )
  }
}

export default Chart
