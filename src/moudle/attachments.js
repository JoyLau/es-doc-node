import React, {Component} from 'react';
import $ from "jquery";
import {Avatar, Upload, Icon, List, message} from "antd";

const Dragger = Upload.Dragger;

class Attachments extends Component {


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
            multiple: true,
            action: '//jsonplaceholder.typicode.com/posts/',
            onChange(info) {
                const status = info.file.status;
                if (status !== 'uploading') {
                    console.log(info.file, info.fileList);
                }
                if (status === 'done') {
                    message.success(`${info.file.name} file uploaded successfully.`);
                } else if (status === 'error') {
                    message.error(`${info.file.name} file upload failed.`);
                }
            },
        };

        return (
            <div style={{position: "relative"}}>
                <List
                    bordered={true}
                    itemLayout="horizontal"
                    dataSource={data}
                    style={{position: "absolute", right: 5, top: 10,zIndex:10,maxWidth: '30%'}}
                    renderItem={item => (
                        <List.Item
                            actions={[<a>预览</a>, <a>下载</a>]}
                        >
                            <List.Item.Meta
                                avatar={<Avatar shape="square" size="large" icon="file-word"/>}
                                title={<a href="https://ant.design">{item.title}</a>}
                                description={<div><p>2018-06-14 10:53:49</p><div>{[<IconText type="eye-o" key="1" text="156"/>, <IconText type="download" key="2" text="3"/>]}</div></div>}
                            />
                        </List.Item>
                    )}
                />

                <div style={{margin: '30px auto',width: '40%',height:400}}>
                    <Dragger {...props}>
                        <p className="ant-upload-drag-icon">
                            <Icon type="cloud-upload" />
                        </p>
                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                        <p className="ant-upload-hint">Support for a single or bulk upload. Support files：WORD,EXCEL,PPT,PDF,HTML</p>
                    </Dragger>
                </div>
            </div>
        )
    }
}

export {Attachments}