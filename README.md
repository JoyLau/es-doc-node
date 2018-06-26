## ElasticSearch 环境准备

![IdiomsDictionary](http://image.joylau.cn/blog/IdiomsDictionary.gif)
![IdiomsDictionary](http://image.joylau.cn/blog/idioms.gif)

图片太大 ： http://image.joylau.cn/blog/attachment.gif

## 中文分词实现

1. 安装插件 https://github.com/medcl/elasticsearch-analysis-ik
2. 测试分词：

	ik_max_word会将文本做最细粒度的拆分； 
	ik_smart 会做最粗粒度的拆分。
	
	
``` json
    http://192.168.10.74:9200/_analyze/ POST
    	{
    	  "analyzer": "ik_max_word",
    	  "text": "绝地求生是最好玩的游戏"
    	}
    	
    	和
    	{
    	  "analyzer": "ik_smart",
    	  "text": "绝地求生是最好玩的游戏"
    	}
    	
    	和
    	{
    	  "analyzer": "standard",
    	  "text": "绝地求生是最好玩的游戏"
    	}
```
	
3. 创建索引

	http://192.168.10.74:9200/ik-index  PUT
	指定使用 ik_max_word 分词器
	
``` json
    {
        "settings" : {
            "analysis" : {
                "analyzer" : {
                    "ik" : {
                        "tokenizer" : "ik_max_word"
                    }
                }
            }
        },
        "mappings" : {
            "article" : {
                "dynamic" : true,
                "properties" : {
                    "subject" : {
                        "type" : "string",
                        "analyzer" : "ik_max_word"
                    },
                    "content" : {
                        "type" : "string",
                        "analyzer" : "ik_max_word"
                    }
                }
            }
        }
    }
```
	
		
	

4. 添加数据
	略

5. 查询：
	http://192.168.10.74:9200/index/_search    POST
``` json
    {
      "query": {
        "match": {
          "subject": "合肥送餐冲突"
        }
      },
      "highlight": {
        "pre_tags": ["<span style = 'color:red'>"],
        "post_tags": ["</span>"],
        "fields": {"subject": {}}
      }
    }
```
	
	
6. 热更新
	IKAnalyzer.cfg.xml
	
	<entry key="remote_ext_dict">http://localhost/hotload.dic</entry>
	
	放入到 静态资源服务器下面
	
	
	
7. 同义词配置
	http://192.168.10.74:9200/synonyms-ik-index  PUT
	
``` json
    {
    	  "settings": {
    		"analysis": {
    		  "analyzer": {
    			"by_smart": {
    			  "type": "custom",
    			  "tokenizer": "ik_smart",
    			  "filter": [
    				"by_tfr",
    				"by_sfr"
    			  ],
    			  "char_filter": [
    				"by_cfr"
    			  ]
    			},
    			"by_max_word": {
    			  "type": "custom",
    			  "tokenizer": "ik_max_word",
    			  "filter": [
    				"by_tfr",
    				"by_sfr"
    			  ],
    			  "char_filter": [
    				"by_cfr"
    			  ]
    			}
    		  },
    		  "filter": {
    			"by_tfr": {
    			  "type": "stop",
    			  "stopwords": [
    				" "
    			  ]
    			},
    			"by_sfr": {
    			  "type": "synonym",
    			  "synonyms_path": "synonyms.dic"
    			}
    		  },
    		  "char_filter": {
    			"by_cfr": {
    			  "type": "mapping",
    			  "mappings": [
    				"| => |"
    			  ]
    			}
    		  }
    		}
    	  },
    	  "mappings": {
    		"article": {
    		  "dynamic": true,
    		  "properties": {
    			"subject": {
    			  "type": "string",
    			  "analyzer": "by_max_word",
    			  "search_analyzer": "by_smart"
    			},
    			"content": {
    			  "type": "string",
    			  "analyzer": "by_max_word",
    			  "search_analyzer": "by_smart"
    			}
    		  }
    		}
    	  }
    	}
```
	
	
8. 测试同义词

	http://192.168.10.74:9200/synonyms-ik-index/_analyze  POST

``` json
    {
      "analyzer": "by_smart",
      "text": "绝地求生是最好玩的游戏"
    }
```

9. 查询同义词
	http://192.168.10.74:9200/synonyms-ik-index/_search  POST
	
``` json
    	{
    	  "query": {
    		"match": {
    		  "subject": "吃鸡"
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
    		  "subject": {}
    		}
    	  }
    	}
```

数据导入/导出 ： [elasticdump](https://github.com/taskrabbit/elasticsearch-dump)


## 文件搜索实现
1. 文档地址： https://www.elastic.co/guide/en/elasticsearch/plugins/5.3/using-ingest-attachment.html

2. 安装插件 
   ./bin/elasticsearch-plugin install ingest-attachment

3. 创建管道single_attachment
    http://192.168.10.74:9200/_ingest/pipeline/single_attachment  PUT

``` json
    {
      "description": "Extract single attachment information",
      "processors": [
        {
          "attachment": {
            "field": "data",
            "indexed_chars": -1,
            "ignore_missing": true
          }
        }
      ]
    }
```

4. 创建索引
    http://192.168.10.74:9200/file_attachment/  PUT
    
``` json
    {
      "settings": {
        "analysis": {
          "analyzer": {
            "ik": {
              "tokenizer": "ik_max_word"
            }
          }
        }
      },
      "mappings": {
        "attachment": {
          "properties": {
            "filename": {
              "type": "text",
              "search_analyzer": "ik_max_word",
              "analyzer": "ik_max_word"
            },
            "data": {
              "type": "text"
            },
            "time": {
              "type": "string"
            },
            "attachment.content": {
              "type": "text",
              "search_analyzer": "ik_max_word",
              "analyzer": "ik_max_word"
            }
          }
        }
      }
    }
```

5. 添加数据
    http://192.168.10.74:9200/file_attachment/attachment/1?pipeline=single_attachment&refresh=true&pretty=1/  POST

``` json
    {
      "filename": "测试文档.txt",
      "time": "2018-06-13 15:14:00",
      "data": "6L+Z5piv56ys5LiA5Liq55So5LqO5rWL6K+V5paH5pys6ZmE5Lu255qE5YaF5a6577yb5paH5Lu25qC85byP5Li6dHh0LOaWh+acrOS4uuS4reaWhw=="
    }
```

6. 文档查询
    http://192.168.10.74:9200/file_attachment/_search POST

``` json
    {
      "query": {
        "match": {
          "attachment.content": "测试"
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
          "attachment.content": {}
        }
      }
    }
```

注意： 使用 nginx 的静态资源目录作为 文件的存放，那么在下载文件时，想要 txt ,html ,pdf 等文件直接被下载而不被浏览器打开时，可在 nginx 的配置文件加入以下配置

``` bash
    server {
            listen       80;
            server_name  localhost;
    
            #charset koi8-r;
    
            #access_log  logs/host.access.log  main;
    
            location / {
                root   html;
    			if ($request_filename ~* ^.*?.(txt|doc|pdf|rar|gz|zip|docx|exe|xlsx|ppt|pptx|jpg|png|html|xml)$){
                            add_header Content-Disposition attachment; 
                            add_header Content-Type 'APPLICATION/OCTET-STREAM';                 
                     } 
                index  index.html index.htm;
            }
    
            #error_page  404              /404.html;
    
            # redirect server error pages to the static page /50x.html
            #
            error_page   500 502 503 504  /50x.html;
            location = /50x.html {
                root   html;
            }
    
            # proxy the PHP scripts to Apache listening on 127.0.0.1:80
            #
            #location ~ \.php$ {
            #    proxy_pass   http://127.0.0.1;
            #}
    
            # pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
            #
            #location ~ \.php$ {
            #    root           html;
            #    fastcgi_pass   127.0.0.1:9000;
            #    fastcgi_index  index.php;
            #    fastcgi_param  SCRIPT_FILENAME  /scripts$fastcgi_script_name;
            #    include        fastcgi_params;
            #}
    
            # deny access to .htaccess files, if Apache's document root
            # concurs with nginx's one
            #
            #location ~ /\.ht {
            #    deny  all;
            #}
        }
```

重点是 : 
if ($request_filename ~* ^.*?.(txt|doc|pdf|rar|gz|zip|docx|exe|xlsx|ppt|pptx|jpg|png|html|xml)$){
      add_header Content-Disposition attachment;  
      add_header Content-Type 'APPLICATION/OCTET-STREAM';                
   } 
或者也可以这样处理：
if ($args ~* "target=download") {
      add_header Content-Disposition 'attachment';
      add_header Content-Type 'APPLICATION/OCTET-STREAM';
 }

这样的话只要在 get请求加上 target=download 参数就可以下载了。