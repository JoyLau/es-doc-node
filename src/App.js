import React, { Component } from 'react';
import './App.css';
import searchData from "../data/json/search.json";
import {Card, Input} from "antd";
import $ from "jquery";
const Search = Input.Search;

const API = "http://192.168.3.74:9200";

class App extends Component {

    state={
        data:[],
    };

    getData(value){
        if (value.toString().trim()) {
            $.getJSON(API + "/ik-index/_search",searchData,function (data) {
                console.info(data)
            })
        }
    }

  render() {
    return (
      <div className="App">
          <div style={{margin: '30px auto',width:'30%'}}>
              <Search
                  placeholder="Search Subject"
                  enterButton="Search"
                  size="large"
                  onSearch={value => console.log(value)}
                  onInput={event => this.getData(event.target.value)}
              />
          </div>
          <div style={{margin: '30px auto',width:'40%'}}>
              <Card title="Card title">
                  <p>Card content</p>
                  <p>Card content</p>
                  <p>Card content</p>
              </Card>
          </div>
      </div>
    );
  }
}

export default App;
