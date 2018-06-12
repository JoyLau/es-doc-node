import React, { Component } from 'react';
import './App.css';
import {Card, Input} from "antd";
import $ from "jquery";
import {swap} from 'react-magic';
import { StyleSheet, css } from 'aphrodite';
const Search = Input.Search;
const API = "http://192.168.10.74:9200/idioms-dictionary/_search";

class App extends Component {

    state={
        data:[],
        searchData : {}
    };

    componentWillMount() {
    }

    componentDidMount() {
        let that = this;
        $.getJSON("../data/json/search.json",function (data) {
            that.setState({
                searchData : data
            });
        })
    }

    getData(value){
        let that = this;
        if (value.toString().trim()) {
            let searchData = this.state.searchData;
            searchData.query.bool.should[0].match.chengyu = value;
            searchData.query.bool.should[1].match.chuchu = value;
            searchData.query.bool.should[2].match.diangu = value;
            searchData.query.bool.should[3].match.lizi = value;
            searchData.query.bool.should[4].match.spinyin = value;
            $.ajax({
                url: API,
                type: 'POST',
                contentType: 'application/json; charset=UTF-8',
                dataType: 'json',
                data: JSON.stringify(searchData),
                success: function(res, status, xhr) {
                    let data = [];
                    res.hits.hits.map((item)=>{
                        let obj = item._source;
                        if (item.highlight.chengyu) {
                            obj.chengyu = item.highlight.chengyu
                        }
                        if (item.highlight.chuchu) {
                            obj.chuchu = item.highlight.chuchu
                        }
                        if (item.highlight.diangu) {
                            obj.diangu = item.highlight.diangu
                        }
                        if (item.highlight.lizi) {
                            obj.lizi = item.highlight.lizi
                        }
                        if (item.highlight.spinyin) {
                            obj.spinyin = item.highlight.spinyin
                        }

                        data.push(obj)
                    });

                    that.setState({
                        data:data,
                    })
                }
            });
        }
    }

  render() {
  const styles = StyleSheet.create({
      swap: {
          animationName: swap,
          animationDuration: '0.4s'
      },
  });
    return (
      <div className="App">
          <div style={{margin: '30px auto',width:'30%'}}>
              <Search
                  placeholder="Search Subject"
                  enterButton="Search"
                  size="large"
                  onSearch={value => this.getData(value)}
                  onInput={event => this.getData(event.target.value)}
              />
          </div>
          <div style={{margin: '30px auto',width:'40%'}}>
              {
                  this.state.data.map((item,index)=>{
                      return (
                          <Card title={<div><div dangerouslySetInnerHTML={{__html: item.chengyu}} /><div style={{marginLeft:'-8px'}}>【{item.pinyin}】</div></div>}
                                style={{marginTop:30}}
                                key = {index}
                                hoverable = {true}
                                className={css(styles.swap)}
                          >
                              <ul>
                                  <li><span style={{fontWeight:600}}>出处：</span> {<div dangerouslySetInnerHTML={{__html: item.chuchu}} />}</li>
                                  <li><span style={{fontWeight:600}}>典故：</span> {<div dangerouslySetInnerHTML={{__html: item.diangu}} />}</li>
                                  <li><span style={{fontWeight:600}}>列子: </span> {<div dangerouslySetInnerHTML={{__html: item.lizi}} />}</li>
                              </ul>
                          </Card>
                      )
                  })
              }
          </div>
      </div>
    );
  }
}

export default App;
