import * as React from 'react'
import { IWidgetMetric, IChartStyles } from '../Widget'
import { ILegend } from './Pivot'
import { IDataParamProperty } from '../Workbench/OperatingPanel'
import { DEFAULT_SPLITER } from 'app/globalConstants'
import { decodeMetricName } from 'containers/Widget/components/util'

const styles = require('./Pivot.less')

interface ICellProps {
  colKey?: string
  rowKey?: string
  width: number
  height?: number
  interacting?: boolean
  metrics: IWidgetMetric[]
  chartStyles: IChartStyles
  color: IDataParamProperty
  legend: ILegend
  data: any[]
  ifSelectedTdToDrill: (obj: any) => any
  isDrilling?: boolean
}

interface ICellState {
  isSelected?: boolean
}

export class Cell extends React.PureComponent<ICellProps, ICellState> {
  constructor(props) {
    super(props)
    this.state = {
      isSelected: false
    }
  }
  public componentWillReceiveProps(nextProps) {
    if (nextProps.isDrilling === false) {
      this.setState({
        isSelected: false
      })
    }
    if (this.props.interacting !== nextProps.interacting && !nextProps.interacting) {
      this.setState({ isSelected: false })
    }
  }
  private selectTd = (event) => {
    const pagex = event.pageX
    const pagey = event.pageY
    const { ifSelectedTdToDrill, data, isDrilling, colKey = '', rowKey = '' } = this.props
    this.setState({
      isSelected: !this.state.isSelected
    }, () => {
      const { isSelected } = this.state
      const key = [colKey, rowKey].join(String.fromCharCode(0))
      let obj = null
      if (ifSelectedTdToDrill && isSelected) {
        obj = {
          data: { [key]: data && data.length === 1 ? data[0] : data },
          range: [[pagex, pagex], [pagey, pagey]]
        }
      } else {
        obj = {
          data: { [key]: false }
        }
      }
      ifSelectedTdToDrill(obj)
    })
  }
  public render() {
    const { colKey = '', rowKey = '', width, height, data, chartStyles, color, legend } = this.props
    const { isSelected } = this.state
    const {
      color: fontColor,
      fontSize,
      fontFamily,
      lineColor,
      progressBarColor,
      startProgressBar,
      lineStyle
    } = chartStyles.pivot
    let metrics = this.props.metrics
    if (colKey.includes(DEFAULT_SPLITER) && rowKey.includes(DEFAULT_SPLITER)) {
      const metricColKey = getMetricKey(colKey)
      const metricRowKey = getMetricKey(rowKey)
      if (metricColKey === metricRowKey) {
        const [name, id] = metricColKey.split(DEFAULT_SPLITER)
        metrics = metrics.filter((m) => m.name === `${name}${DEFAULT_SPLITER}${id}`)
      } else {
        metrics = []
      }
    } else if (colKey.includes(DEFAULT_SPLITER)) {
      const [name, id] = getMetricKey(colKey).split(DEFAULT_SPLITER)
      metrics = metrics.filter((m) => m.name === `${name}${DEFAULT_SPLITER}${id}`)
    } else if (rowKey.includes(DEFAULT_SPLITER)) {
      const [name, id] = getMetricKey(rowKey).split(DEFAULT_SPLITER)
      metrics = metrics.filter((m) => m.name === `${name}${DEFAULT_SPLITER}${id}`)
    }
    var label=undefined
    const content = metrics.map((m) => {
      const decodedMetricName = decodeMetricName(m.name)
      const currentColorItem = color.items.find((i) => i.config.actOn === m.name) || color.items.find((i) => i.config.actOn === 'all')
      return data && data.map((d, index) => {
        let styleColor
        if (currentColorItem) {
          const legendSelectedItem = legend[currentColorItem.name]
          if (!(legendSelectedItem && legendSelectedItem.includes(d[currentColorItem.name]))) {
            styleColor = {
              color: currentColorItem.config.values[d[currentColorItem.name]]
            }
          }
        }
        if(startProgressBar){
          label=d[`${m.agg}(${decodedMetricName})`]+"%"
        }else{
          label=d[`${m.agg}(${decodedMetricName})`]
        }
        return (
          <p
            key={`${m.name}${index}`}
            className={styles.cellContent}
            style={{ ...styleColor }}
          >
            {label}
          </p>
        )
      })
    })
    var cellStyles = {
      width,
      ...(height && { height }),
      color: fontColor,
      fontSize: Number(fontSize),
      fontFamily,
      borderColor: lineColor,
      borderStyle: lineStyle
    }
    //console.log(cellStyles)
    if(startProgressBar){
      cellStyles.backgroundColor=isSelected ? '#d2eafb' : '#fff'
      //backgroundImage: "linear-gradient(to right, rgba(0,102,255, 1) 0%, rgba(0,109,255, 1) 17%, rgba(0,117,255, 1) 33%, rgba(0,124,255, 1) 67%, rgba(0,131,255, 1) 83%, rgba(0,138,255, 1) 100%)",
      //background: "rgb(2,0,36)",
      //linear-gradient(90deg, rgba(7,45,145,1) 0%, rgba(6,72,163,1) 24%, rgba(5,102,182,1) 42%, rgba(4,117,192,1) 61%, rgba(4,123,196,1) 82%, rgba(2,155,217,1) 100%)
      //`linear-gradient(90deg, rgba(4,123,196,0.36458333333333337) 0%, rgba(2,155,217,0.4514180672268907) 100%)`,
      cellStyles.backgroundImage= `linear-gradient(90deg, ${progressBarColor} 0%, ${progressBarColor} 100%)`
      cellStyles.backgroundRepeat= "no-repeat"
      if(label!=undefined){
        cellStyles.backgroundSize=`${label} 100%`
      }else{
        cellStyles.backgroundSize=`0% 100%`
      }
      if(content[0]==undefined){
        content[0]=(
          <p style={{textAlign:"right"}}>0%</p>
        )
      }
    }
    return (
      <td style={cellStyles} onClick={this.selectTd}>
        {content}
      </td>
    )
    
    
  }
}

export default Cell

function getMetricKey(key) {
  return key.split(String.fromCharCode(0))
    .filter((k) => k.includes(DEFAULT_SPLITER))[0]
}



