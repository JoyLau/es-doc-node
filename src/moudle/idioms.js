import React, {Component} from 'react';
import {Card} from "antd";
import {animations} from "../components/animation/animations";
import es from "../config/es";
import {message} from "antd/lib/index";

class Idioms extends Component {
    state = {
        data: [],
        searchData: {},
        noDataTips: 'Please enter the keywords to search the dioms'
    };

    componentWillMount() {
    }

    componentDidMount() {
    }

    getData(value) {
        let that = this;
        if (value.toString().trim()) {
            es.search({
                index: 'idioms-dictionary',
                type:'idioms',
                body:{
                    "query": {
                        "bool": {
                            "should": [
                                {
                                    "match": {
                                        "chengyu": value
                                    }
                                },
                                {
                                    "match": {
                                        "chuchu": value
                                    }
                                },
                                {
                                    "match": {
                                        "diangu": value
                                    }
                                },
                                {
                                    "match": {
                                        "lizi": value
                                    }
                                },
                                {
                                    "match": {
                                        "spinyin": value
                                    }
                                }
                            ]
                        }
                    },
                    "highlight": {
                        "pre_tags": [
                            "<span style = 'color:red'>"
                        ],
                        "post_tags": [
                            "</span>"
                        ],
                        "fields": {
                            "chengyu": {},
                            "chuchu": {},
                            "diangu": {},
                            "lizi": {},
                            "spinyin": {}
                        }
                    }
                }
            },(error, response)=>{
                if (error) {
                    message.error("查询失败!");
                    return;
                }
                if(response){
                    let data = [];
                    response.hits.hits.map((item) => {
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