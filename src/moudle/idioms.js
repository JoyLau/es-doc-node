import React, {Component} from 'react';
import {Card} from "antd";
import $ from "jquery";
import {animations} from "../components/animation/animations";
import {slideRightReturn} from "react-magic";

const API = "http://192.168.10.74:9200/idioms-dictionary/_search";

class Idioms extends Component {
    state = {
        data: [],
        searchData: {},
        noDataTips: 'Please enter the keywords to search the dioms'
    };

    componentWillMount() {
    }

    componentDidMount() {
        let that = this;
        $.getJSON("../data/json/search.json", function (data) {
            that.setState({
                searchData: data
            });
        })
    }

    getData(value) {
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
                success: function (res, status, xhr) {
                    let data = [];
                    res.hits.hits.map((item) => {
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
                        data: data,
                        noDataTips: 'Sorry! no data'
                    })
                }
            });
        }
    }

    render() {
        return (
            <div style={{margin: '30px auto', width: '40%'}} className={animations.slideLeftReturn}>
                {
                    this.state.data.length === 0
                        ?
                        <p style={{
                            color: '#00000073',
                            fontSize: "16px",
                            marginTop: '20%',
                            textAlign: 'center'
                        }}>{this.state.noDataTips}</p>
                        :
                        this.state.data.map((item, index) => {
                            return (
                                <Card title={<div>
                                    <div dangerouslySetInnerHTML={{__html: item.chengyu}}/>
                                    <div style={{marginLeft: '-8px'}}>【{item.pinyin}】</div>
                                </div>}
                                      style={{marginTop: 30}}
                                      key={index}
                                      hoverable={true}
                                      className={animations.swap}
                                >
                                    <ul>
                                        <li><span style={{fontWeight: 600}}>出处：</span> {<div
                                            dangerouslySetInnerHTML={{__html: item.chuchu}}/>}</li>
                                        <li><span style={{fontWeight: 600}}>典故：</span> {<div
                                            dangerouslySetInnerHTML={{__html: item.diangu}}/>}</li>
                                        <li><span style={{fontWeight: 600}}>列子: </span> {<div
                                            dangerouslySetInnerHTML={{__html: item.lizi}}/>}</li>
                                    </ul>
                                </Card>
                            )
                        })
                }
            </div>
        )
    }
}

export {Idioms}