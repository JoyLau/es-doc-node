## ElasticSearch 环境准备
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