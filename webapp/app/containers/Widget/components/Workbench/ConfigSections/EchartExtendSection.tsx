import React from 'react'
import { Row, Col, Input, InputNumber } from 'antd'
const { TextArea } = Input;
const styles = require('../Workbench.less')

export interface IEchartExtendConfig {
  extendJson: string
}

interface IEchartExtendSectionProps {
  title: string
  config: IEchartExtendConfig
  onChange: (prop: string, value: any) => void
}

export class EchartExtendSection extends React.PureComponent<IEchartExtendSectionProps, {}> {


  private propChange = (prop) => (event) => {
    let value = event.target.value
    this.props.onChange(prop, value)
  }
  public render() {
    const { title, config } = this.props

    const {
      extendJson,
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
              <TextArea
                rows={10}
                placeholder="请输入要覆盖的echart option配置（json格式）"
                defaultValue={extendJson}
                onChange={this.propChange('extendJson')}
              />
            </Col>
          </Row>

        </div>
      </div>
    )
  }
}

export default EchartExtendSection
