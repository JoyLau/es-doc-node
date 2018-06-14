import React, {Component} from 'react';
import './App.css';
import {Input} from "antd";
import {Idioms} from "./moudle/idioms";
import {Github} from "./components/github";
import { Button, Icon } from 'antd';
import {Attachments} from "./moudle/attachments";
const ButtonGroup = Button.Group;
const Search = Input.Search;

class App extends Component {

    state={
        buttonChecked:false,
    };

    getData(value){
        this.refs.content.getData(value);
    }

    render() {
        return (
            <div className="App">
                <Github/>
                <div style={{margin: '30px auto', width: '30%'}}>
                    <Search
                        placeholder="Search Subject"
                        enterButton="Search"
                        size="large"
                        onSearch={value => this.getData(value)}
                        onInput={event => this.getData(event.target.value)}
                    />
                </div>
                <div style={{margin: '30px auto',width: 230}}>
                    <ButtonGroup>
                        <Button type={this.state.buttonChecked ? "primary" : null} onClick={()=>{this.setState({buttonChecked:!this.state.buttonChecked})}}>
                            <Icon type="credit-card" />Idioms
                        </Button>
                        <Button type={!this.state.buttonChecked ? "primary" : null} onClick={()=>{this.setState({buttonChecked:!this.state.buttonChecked})}}>
                            Attachments<Icon type="file-text" />
                        </Button>
                    </ButtonGroup>
                </div>
                {
                    this.state.buttonChecked ? <Idioms ref="content"/> : <Attachments ref="content"/>
                }
            </div>
        );
    }
}

export default App;
