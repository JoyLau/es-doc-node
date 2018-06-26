import React, {Component} from 'react';
import {Modal, Avatar, Upload, Icon, List, message, Divider} from "antd";
import es from "../config/es";
import md5 from 'md5';
import moment from "moment";
import {animations} from "../components/animation/animations";
import serviceConfig from "../config/servers";


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
                        contentType: item._source.attachment.content_type,
                        icon: (item => {
                            let contentType = item._source.attachment.content_type;
                            if (contentType.indexOf("word")>-1 || contentType.indexOf("doc")>-1 || contentType.indexOf("docx")>-1) {
                                return "file-word"
                            }
                            if (contentType.indexOf('text/plain')>-1) {
                                return "file-text"
                            }
                            if (contentType.indexOf("sheet")>-1 || contentType.indexOf("excel")>-1) {
                                return "file-excel"
                            }
                            if (contentType === 'application/pdf') {
                                return "file-pdf"
                            }
                            if (contentType.indexOf('text/html')>-1) {
                                return "file"
                            }
                            if (contentType.indexOf("powerpoint")>-1 || contentType.indexOf("ppt")>-1) {
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
                "_source": [ "filename", "fileSize", "time","attachment.author","attachment.content_type" ],
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
                        contentType: item._source.attachment.content_type,
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
        element.src = serviceConfig.nginxService + filename + "?target=download";
        element.style.display = "none";
        document.body.appendChild(element);
    }

    /*预览*/
    preview(filename,contentType){
        const element = window.document.createElement("a");
        if (contentType === 'application/pdf') {
            element.href = serviceConfig.nginxService + filename;
        }else{
            element.href = serviceConfig.officeService + "office/preview/" + filename;
        }
        element.target = "_blank";
        element.download=filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
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
            action: serviceConfig.uploadService + "upload",
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
                const isWord = (file.type.indexOf("word") > -1 || file.type.indexOf("doc") > -1 || file.type.indexOf("docx") > -1);
                const isPPT = (file.type.indexOf("powerpoint")>-1 || file.type.indexOf("ppt")>-1);
                const isExcel = (file.type.indexOf("sheet")>-1 || file.type.indexOf("excel")>-1);
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
                            actions={[<a onClick={()=>this.preview(item.title,item.contentType)}>预览</a>, <a onClick={()=>this.download(item.title)}>下载</a>]}
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
                                        actions={[<IconText type="eye-o" text="预览" func={()=>{this.preview(item.filename,item.contentType)}}/>, <IconText type="download" text="下载" func={()=>{this.download(item.filename)}}/>, <IconText type="delete" text="删除" func={()=>{this.delete(item.id)}}/>]}
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