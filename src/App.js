import React, {Component} from 'react';
import './App.css';
import {Input} from "antd";
import {Idioms} from "./moudle/idioms";
import {Github} from "./components/github";

const Search = Input.Search;

class App extends Component {

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
                <Idioms ref="content"/>
            </div>
        );
    }
}

export default App;
