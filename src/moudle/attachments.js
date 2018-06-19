import React, {Component} from 'react';
import $ from "jquery";
import {Avatar, Upload, Icon, List, message} from "antd";
import es from "../config/es";

const Dragger = Upload.Dragger;

class Attachments extends Component {
    state = {
        fileData: []
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


    render() {
        const IconText = ({type, text}) => (
            <span style={{marginRight: 10}}>
                <Icon type={type} style={{marginRight: 8}}/>
                {text}
            </span>
        );

        const data = [
            {
                title: 'Ant Design Title 1',
            },
            {
                title: 'Ant Design Title 2',
            },
            {
                title: 'Ant Design Title 3',
            },
            {
                title: 'Ant Design Title 4',
            },
        ];

        const props = {
            name: 'file',
            multiple: false,
            // action: 'http://192.168.10.74:9200/file_attachment/attachment/1?pipeline=single_attachment&refresh=true&pretty=1',
            action: "/upload",
            // headers: {'content-type': 'application/cbor'},
            // data: {"asd": "21"},
            onChange(info) {
                let file = info.fileList[0];
                const fileSize = (file.size / (1024 * 1024)).toFixed(2);  //获得文件大小
                const fileName = file.name;  //获得文件名
                const status = info.file.status;
                if (status !== 'uploading') {
                    // console.log(info.file, info.fileList);
                }
                if (status === 'done') {
                    message.success(`${info.file.name} file uploaded successfully.`);

                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = function (e) {
                        let base64Data = e.target.result.split(",")[1];
                        es.index({
                            index: 'myindex', //相当于database
                            type: 'mytype2',  //相当于table
                            id: JSON.stringify(new Date().getTime()),// 数据到唯一标示，id存在则为更新，不存在为插入
                            body: {
                                title: 'Test 1',
                                tags: ['y', 'z'],
                                published: true,
                                published_at: '2013-01-01',
                                counter: 1,
                                name: '999'
                            }//文档到内容
                        }, (error, response)=>{
                            //
                            console.log(error)
                            console.log(response)
                        })

                    }
                } else if (status === 'error') {
                    message.error(`${info.file.name}: ${info.file.response.error.message}`);
                }
            },
            // beforeUpload: (file) => {
            //     const reader = new FileReader();
            //     reader.readAsDataURL(file);
            //     const that = this;
            //     reader.onload = function (e) {
            //         that.setState({
            //             fileData: this.result.split(",")[1]
            //         });
            //         console.info(this.result.split(",")[1])
            //     }
            // }
        };

        return (
            <div style={{position: "relative"}}>
                <List
                    bordered={true}
                    itemLayout="horizontal"
                    dataSource={data}
                    style={{position: "absolute", right: 5, top: 10, zIndex: 10, maxWidth: '30%'}}
                    renderItem={item => (
                        <List.Item
                            actions={[<a>预览</a>, <a>下载</a>]}
                        >
                            <List.Item.Meta
                                avatar={<Avatar shape="square" size="large" icon="file-word"/>}
                                title={<a href="https://ant.design">{item.title}</a>}
                                description={<div><p>2018-06-14 10:53:49</p>
                                    <div>{[<IconText type="eye-o" key="1" text="156"/>,
                                        <IconText type="download" key="2" text="3"/>]}</div>
                                </div>}
                            />
                        </List.Item>
                    )}
                />

                <div style={{margin: '30px auto', width: '40%', height: 400}}>
                    <Dragger {...props}>
                        <p className="ant-upload-drag-icon">
                            <Icon type="cloud-upload"/>
                        </p>
                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                        <p className="ant-upload-hint">Support for a single or bulk upload. Support
                            files：TXT,WORD,EXCEL,PPT,PDF,HTML</p>
                    </Dragger>
                </div>
            </div>
        )
    }
}

export {Attachments}