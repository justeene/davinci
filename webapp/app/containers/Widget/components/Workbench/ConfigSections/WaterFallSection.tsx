import React from 'react'
import { Row, Col, Checkbox } from 'antd'
const styles = require('../Workbench.less')

export interface IWaterFallConfig {
  showIncrease: boolean
  showFluctuate: boolean
}

interface IWaterFallSectionProps {
  title: string
  config: IWaterFallConfig
  onChange: (prop: string, value: any) => void
}

export class WaterFallSection extends React.PureComponent<IWaterFallSectionProps, {}> {

  private checkboxChange = (prop) => (e) => {
    //console.log(e.target.checked)
    this.props.onChange(prop, e.target.checked)
  }
  public render() {
    const { title, config } = this.props

    const {
      showIncrease,
      showFluctuate,
    } = config

    return (
      <div className={styles.paneBlock}>
        <h4>{title}</h4>
        <div className={styles.blockBody}>
          <Row key="title" gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={24}>
              <Checkbox
                checked={showIncrease}
                onChange={this.checkboxChange('showIncrease')}
              >
                显示增长率
              </Checkbox>
            </Col>
          </Row>
          <Row key="title" gutter={8} type="flex" align="middle" className={styles.blockRow}>
            <Col span={24}>
              <Checkbox
                checked={showFluctuate}
                onChange={this.checkboxChange('showFluctuate')}
              >
                显示波动率
              </Checkbox>
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}

export default WaterFallSection
