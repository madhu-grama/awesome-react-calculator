import React from 'react';
import PropTypes from 'prop-types';
import ResultPanel, { replacement } from './ResultPanel';
import ButtonPanel from './ButtonPanel';
import { evaluate } from 'mathjs';

export default class Calculator extends React.Component {
  constructor() {
    super();
    this.state = {
      last: '',
      cur: '0'
    };
    this.onPaste = this.onPaste.bind(this)
    this.onButtonClick = this.onButtonClick.bind(this)
    this.setStateAndNotify = this.setStateAndNotify.bind(this)
  }

  onPaste(event){
    if(event.isTrusted) {
      const data = event.clipboardData || window.clipboardData;
      const pastedData = data.getData('Text')
      let cur;
      replacement.forEach((item) => {
        cur = pastedData.replace(item.dist, item.reg);
      });
      this.setState({
        cur: evaluate(cur).toString(),
        last: cur
      })
    }
  }


  setStateAndNotify(newState) {
    this.setState(newState, this.props.onResultChange ? this.props.onResultChange(newState.cur) : null)
  }

  onButtonClick(type) {
    const {cur} = this.state
    const lastLetter = cur.slice(-1);
    switch (type) {
      case 'c':
        this.setStateAndNotify({
          last: '',
          cur: '0'
        });
        break;
      case 'back':
        this.setState({ cur: cur === '0' ? cur : cur.slice(0, -1) || '0' });
        break;
      case '=':
        try {
          const output = evaluate(cur).toString()
          this.setStateAndNotify({
            last: cur + '=',
            cur: output
          });
        } catch (e) {
          console.log(e)
          this.setState({
            last: cur + '=',
            cur: 'NaN'
          });
        }
        break;
      case '+':
      case '-':
      case '*':
      case '/':
      if(Number(cur) === 0 && type === '-') {
          this.setState({
            cur: type
          })
          break
        }
        if((lastLetter === '*' && type === '-') || (lastLetter === '/' && type=== '-')){
          this.setState({
            cur: cur + type
          })
          break
        }

        if (lastLetter === '+' || lastLetter === '-' || lastLetter === '*' || lastLetter === '/')
          this.setState({
            cur: cur.slice(0, -1) + type
          });
        else
          this.setState({
            cur: cur + type
          });
        break;
      case '.':
        if (lastLetter !== '.') {
          this.setState({
            cur: cur + type
          });
        }
        break;
      default:
        this.setState({
          cur: cur === '0' ? type : cur + type
        });
        break;
      }
      if(this.props.onButtonPress) {
        this.props.onButtonPress(type)
      }
      if(this.props.onKeyPress) {
        this.props.onKeyPress(type)
      }
  }
  render() {
    return (
      <div className="react-calculator" onPaste={this.onPaste}>
        <ResultPanel {...this.state} />
        <ButtonPanel onClick={this.onButtonClick}/>
      </div>
    );
  }
}

Calculator.propTypes = {
  onButtonPress: PropTypes.func,
  onResultChange: PropTypes.func,
  onKeyPress: PropTypes.func
}
