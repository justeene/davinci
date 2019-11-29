import React from 'react'
import { Row, Col, Checkbox, Select,InputNumber } from 'antd'
const Option = Select.Option
const CheckboxGroup = Checkbox.Group
import ColorPicker from 'components/ColorPicker'
import {
  CHART_LABEL_POSITIONS,
  CHART_PIE_LABEL_POSITIONS,
  CHART_FUNNEL_LABEL_POSITIONS
} from 'app/globalConstants'
import { chartFontFamilyOptions, chartFontSizeOptions } from './constants'
const styles = require('../Workbench.less')

export interface IDataZoomConfig {
  show: boolean
  // labelFontFamily: string
  // labelFontSize: string
  // labelColor: string
  // pieLabelPosition?: string
  // funnelLabelPosition?: string
}

interface IDataZoomSectionProps {
  title: string
  config: IDataZoomConfig
  onChange: (prop: string, value: any) => void
}

export class DataZoomSection extends React.PureComponent<IDataZoomSectionProps, {}> {

  private checkboxChange = (prop) => (e) => {
    this.props.onChange(prop, e.target.checked)
  }

  private selectChange = (prop) => (value) => {
    this.props.onChange(prop, value)
  }

  private colorChange = (prop) => (color) => {
    this.props.onChange(prop, color)
  }

  public render() {
    const { title, config } = this.props

    const {
      show,
      // labelFontFamily,
      // labelFontSize,
      // labelColor,
      // labelParts,
      // pieLabelPosition,
      // funnelLabelPosition
    } = config

    return (
      <div className={styles.paneBlock}>
        <h4>{title}</h4>
        <div className={styles.blockBody}>
          <Row
            gutter={8}
            type="flex"
            align="middle"
            className={styles.blockRow}
          >
            <Col span={24}>
              <Checkbox
                checked={showLabel}
                onChange={this.checkboxChange('showDataZoom')}
              >
                显示标签
              </Checkbox>
            </Col>
          </Row>
          <Row
            gutter={8}
            type="flex"
            align="middle"
            className={styles.blockRow}
          >
            <Col span={14}>start</Col>
            <Col span={10}>
              <InputNumber
                className={styles.blockElm}
                value={0}
                onChange={this.checkboxChange('start')}
              />
            </Col>
          </Row>
          <Row
            gutter={8}
            type="flex"
            align="middle"
            className={styles.blockRow}
          >
            <Col span={14}>end</Col>
            <Col span={10}>
              <InputNumber
                className={styles.blockElm}
                value={100}
                onChange={this.checkboxChange('end')}
              />
            </Col>
          </Row>
          {/* <Row
            gutter={8}
            type="flex"
            align="middle"
            className={styles.blockRow}
          >
            <Col span={10}>
              <Select
                placeholder="字体"
                className={styles.blockElm}
                value={dataZoomFontFamily}
                onChange={this.selectChange('dataZoomFontFamily')}
              >
                {chartFontFamilyOptions}
              </Select>
            </Col>
            <Col span={10}>
              <Select
                placeholder="文字大小"
                className={styles.blockElm}
                value={dataZoomFontSize}
                onChange={this.selectChange('dataZoomFontSize')}
              >
                {chartFontSizeOptions}
              </Select>
            </Col>
            <Col span={4}>
              <ColorPicker
                value={dataZoomColor}
                onChange={this.colorChange('dataZoomColor')}
              />
            </Col>
          </Row>
          {!!dataZoomOptions.length && (
            <Row
              gutter={8}
              type="flex"
              align="middle"
              className={styles.blockRow}
            >
              <Col span={24}>
                <CheckboxGroup
                  value={dataZoomParts}
                  options={dataZoomOptions}
                  onChange={this.selectChange('dataZoomParts')}
                />
              </Col>
            </Row> 
          )}*/}
        </div>
      </div>
    )
  }
}

export default DataZoomSection
