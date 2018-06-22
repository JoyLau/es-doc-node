import React, {Component} from 'react';
import {Modal, Avatar, Upload, Icon, List, message, Divider} from "antd";
import es from "../config/es";
import md5 from 'md5';
import moment from "moment";
import {animations} from "../components/animation/animations";
const Dragger = Upload.Dragger;
const confirm = Modal.confirm;

class Attachments extends Component {
    state = {
        fileData: [],
        data:[],
        searchValue:'',
    };

    componentWillMount() {
        this.getFileList();
    }

    componentDidMount() {
    }

    getFileList(){
        let that = this;
        es.search({
            index: 'file_attachment',
            type:'attachment',
            body:{
                "_source": [ "filename", "fileSize", "time","attachment.content_type"],
                "from": 0,
                "size":5,
                "sort": [
                    {"time": { "order": "asc"}}
                ],
                "query": {
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
                    data.push({
                        id: item._id,
                        title: item._source.filename,
                        icon: (item => {
                            let contentType = item._source.attachment.content_type;
                            if (contentType === 'application/msword' || contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                                return "file-word"
                            }
                            if (contentType.indexOf('text/plain')>-1) {
                                return "file-text"
                            }
                            if (contentType === 'MsoIrmProtector.xls' || contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                                return "file-excel"
                            }
                            if (contentType === 'application/pdf') {
                                return "file-pdf"
                            }
                            if (contentType.indexOf('text/html')>-1) {
                                return "file"
                            }
                            if (contentType === 'application/vnd.ms-powerpoint' || contentType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
                                return "file-ppt"
                            }
                            return "file-unknown";
                        })(item),
                        time: item._source.time.split(" ")[0],
                        fileSize: item._source.fileSize
                    })
                });
                that.setState({
                    fileData:data
                })
            }
        })
    }

    getData(value){
        let that = this;
        that.setState({
            searchValue:value,
        });
        es.search({
            index: 'file_attachment',
            type:'attachment',
            body:{
                "_source": [ "filename", "fileSize", "time","attachment.author" ],
                "query": {
                    "bool": {
                        "should": [
                            {
                                "match": {
                                    "attachment.content": value
                                }
                            },
                            {
                                "match": {
                                    "filename": value
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
                        "attachment.content": {},
                        "filename": {}
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
                response.hits.hits.map((item)=>{
                    let obj = {
                        id: item._id,
                        filename: item._source.filename,
                        href: '#',
                        title: <div dangerouslySetInnerHTML={{__html: item._source.filename}}/>,
                        description: <div>{item._source.time}<Divider type="vertical" />{item._source.fileSize}{item._source.attachment && item._source.attachment.author ? <span><Divider type="vertical" />{item._source.attachment.author}</span> : ""}</div>,
                    };
                    if (item.highlight.filename) {
                        obj.title = <div dangerouslySetInnerHTML={{__html: item.highlight.filename}}/>;
                    }
                    if (item.highlight["attachment.content"]) {
                        obj.content = <div dangerouslySetInnerHTML={{__html: item.highlight["attachment.content"]}}/>;
                    }
                    data.push(obj)
                });
                that.setState({
                    data:data
                })
            }
        })
    }

    delete(id){
        let that = this;
        confirm({
            title: 'Are you sure delete this attachment?',
            content: 'This is irreversible',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                es.delete({
                    index: 'file_attachment',
                    type:'attachment',
                    id: id,
                    refresh: true,
                },(error, response)=>{
                    if (error) {
                        message.error("删除失败!");
                        return;
                    }
                    if(response){
                        message.success("success !");
                        that.getData(that.state.searchValue)
                    }
                })
            }
        });
    }

    download(filename){
        const element = window.document.createElement("iframe");
        element.src = "http://192.168.10.74/" + filename;
        element.style.display = "none";
        document.body.appendChild(element);
    }

    render() {
        let that = this;
        const IconText = ({type, text,func}) => (
            <span style={{marginRight: 10}} onClick={func}>
                <Icon type={type} style={{marginRight: 8}}/>
                {text}
            </span>
        );

        const props = {
            name: 'file',
            multiple: false,
            // action: 'http://192.168.10.74:9200/file_attachment/attachment/1?pipeline=single_attachment&refresh=true&pretty=1',
            action: "http://192.168.10.74:3000/upload",
            // headers: {'content-type': 'application/cbor'},
            onChange(info) {
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
                                message.error("解析失败!");
                                return;
                            }
                            if (response) {
                                that.getFileList();
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
            <div style={{position: "relative"}} className={animations.slideRightReturn}>
                <List
                    bordered={true}
                    itemLayout="horizontal"
                    dataSource={this.state.fileData}
                    style={{position: "absolute", right: 5, top: 10, zIndex: 10, maxWidth: '28%'}}
                    renderItem={item => (
                        <List.Item
                            actions={[<a>预览</a>, <a onClick={()=>this.download(item.title)}>下载</a>]}
                        >
                            <List.Item.Meta
                                avatar={<Avatar shape="square" size="large" icon={item.icon}/>}
                                title={<a href="#">{item.title}</a>}
                                description={<div>{[<IconText type="clock-circle-o" key="1" text={item.time}/>, <IconText type="link" key="2" text={item.fileSize}/>]}</div>}
                            />
                        </List.Item>
                    )}
                />

                <div style={{margin: '30px auto', width: '40%', height: 400}}>
                    {
                        this.state.data.length !== 0
                            ?
                            <List
                                itemLayout="vertical"
                                size="large"
                                dataSource={this.state.data}
                                renderItem={item => (
                                    <List.Item
                                        key={item.title}
                                        actions={[<IconText type="eye-o" text="预览" />, <IconText type="download" text="下载" func={()=>{this.download(item.filename)}}/>, <IconText type="delete" text="删除" func={()=>{this.delete(item.id)}}/>]}
                                    >
                                        <List.Item.Meta
                                            title={<a href={item.href}>{item.title}</a>}
                                            description={item.description}
                                        />
                                        {item.content}
                                    </List.Item>
                                )}
                            />
                            :
                            <Dragger {...props}>
                                <p className="ant-upload-drag-icon">
                                    <Icon type="cloud-upload"/>
                                </p>
                                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                                <p className="ant-upload-hint">Support for a single upload</p>
                                <p className="ant-upload-hint">Support files：TXT,WORD,EXCEL,PPT,PDF,HTML</p>
                            </Dragger>
                    }
                </div>
            </div>
        )
    }
}

export {Attachments}