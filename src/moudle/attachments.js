import React, {Component} from 'react';
import $ from "jquery";
import {Avatar, Upload, Icon, List, message} from "antd";
import es from "../config/es";
import md5 from 'md5';
import moment from "moment";
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
            action: "http://192.168.10.74:3000/upload",
            // headers: {'content-type': 'application/cbor'},
            // data: {"asd": "21"},
            onChange(info) {
                console.info(info)
                const status = info.file.status;
                if (status === 'removed') {
                    return;
                }
                let file = info.fileList[info.fileList.length-1];
                const fileSize = (file.size / (1024)).toFixed(1) + "KB";  //获得文件大小
                const fileName = file.name;  //获得文件名
                if (status !== 'uploading') {
                    // console.log(info.file, info.fileList);
                }
                if (status === 'done') {
                    message.success(`${info.file.name} file uploaded successfully.`);

                    const reader = new FileReader();
                    reader.readAsDataURL(file.originFileObj);
                    reader.onload = function (e) {
                        let base64Data = e.target.result.split(",")[1];
                        es.index({
                            index: 'file_attachment',
                            type: 'attachment',
                            id: md5(base64Data),
                            refresh: 'true',
                            pipeline:'single_attachment',
                            body: {
                                filename: fileName,
                                md5: md5(base64Data),
                                fileSize: fileSize,
                                time: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
                                data: base64Data
                            }
                        }, (error, response)=>{
                            if (error) {
                                message.error("解析失败!")
                            }
                        })
                    }
                } else if (status === 'error') {
                    message.error(`${info.file.name}: file upload failed.`);
                }
            },
            beforeUpload:(file)=>{
                const isTxt = file.type === 'text/plain';
                const isWord = file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                const isPPT = file.type === 'application/vnd.ms-powerpoint' || file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
                const isExcel = file.type === 'MsoIrmProtector.xls' || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                const isPDF = file.type === 'application/pdf';
                const isHtml = file.type === 'text/html';
                if (!isTxt && !isWord && !isPPT && !isExcel && !isPDF && !isHtml) {
                    message.error("文件格式错误!");
                    return false;
                }
                const isLt10m = file.size / 1024 / 1024 < 10;
                if (!isLt10m){
                    message.error("文件大于 10M !");
                    return false;
                }
            }
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