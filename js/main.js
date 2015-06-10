G = function() {};
G.ajax = function(conf) {

    var type     = conf.type || 'GET';
    var url      = conf.url || '';
    var data     = conf.data || ''; 
    var dataType = conf.dataType || 'TEXT';
    var success  = conf.success || function() {};
    var jsonp    = conf.jsonp || function() {};

    if (type == null){
        type = "get";
    }
    if (dataType == null){
        dataType = "text";
    }

    var xhr = new XMLHttpRequest();
    xhr.open(type, url, true);

    // 发送
    if (type == "GET" || type == "get") {
        xhr.send(null);
    } else if (type == "POST" || type == "post") {
        var parame = '';
        for(var item in data) {
            parame += item + '=' + data[item] + '&';
        }
        parame = parame.substring(0, parame.length - 1);

        xhr.setRequestHeader("content-type","application/x-www-form-urlencoded");
        xhr.send(parame);
    } else if(type == 'jsonp') {
        eval("window." + jsonp + "=" + success);
        var script = document.createElement('script');
        script.setAttribute('src', url);
        document.getElementsByTagName('head')[0].appendChild(script);
    }

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            if(dataType == "text" || dataType=="TEXT") {
                if (success != null){
                    //普通文本
                    success(xhr.responseText);
                }
            } else if(dataType == "xml" || dataType == "XML") {
                if (success != null){
                    //接收xml文档    
                    success(xhr.responseXML);
                }  
            } else if(dataType == "json" || dataType == "JSON") {
                if (success != null){
                    //将json字符串转换为js对象  
                    success(eval("(" + xhr.responseText + ")"));
                }
            } 
        }
    };
}

var info = {
    title : 'Gecmt',
    description : '树のReact留言板'
};

var CmtHeader = React.createClass({
    displayName : 'cmtHeader',
    render : function() {
        return (
            <header className="logo">
                <h1>{this.props.data.title}</h1>
                <div className="description">
                    {this.props.data.description}
                </div>
            </header>
        );
    }
});

var CmtList = React.createClass({
    displayName : 'cmtList',
        render : function() {
        var cmts = this.props.data.map(function(comment) {
            return (
                <article className = "items">
                    <div className = "name">Name: {comment.name}</div>
                    <div className = "email">Email: {comment.email}</div>
                    <div className = "content">{comment.content}</div>
                </article>
            );
        });

        return (
            <div className="main">
                {cmts}
            </div>
        );
    }
});

var CmtForm = React.createClass({
    displayName : 'cmtForm',
    formSubmit : function(e) {
        e.preventDefault();
        //alert('aaa');
        var name    = this.refs.nickname.getDOMNode().value.trim();
        var email   = this.refs.email.getDOMNode().value.trim();
        var content = this.refs.content.getDOMNode().value.trim();

        if(!name || !email || !content || /\w+@\w+\.\w+/.test(email)) {
            this.refs.nickname.getDOMNode().value    = '';
            this.refs.email.getDOMNode().value   = '';
            this.refs.content.getDOMNode().value = '';

            sendData = {
                "name" : name,
                "email" : email,
                "content" : content
            };
            this.props.send(sendData);                   
        }
    },
    render : function() {
        return (
            <div id="add">
                <form method="post" onSubmit={this.formSubmit}>
                    <div className="name">
                        <p>昵称</p>
                        <input name="name" type="text" ref="nickname" />
                    </div>
                    <div className="email">
                        <p>Email</p>
                        <input name="email" type="text" ref="email" />
                    </div>
                    <div className="input-content">
                        <textarea name="content" ref="content"></textarea>
                    </div>
                    <button className="btn btn-default" type="submit" id="submit">提交</button>
                </form>
            </div>
        );
    }
});

var CmtBody = React.createClass({
    displayName : 'cmtBody',
    getInitialState : function() {
        return {data : []};
    },
    loadComments : function() {
        G.ajax({
            /*url : 'comments.php',*/
            url : 'comments_db.php',
            dataType : 'json',
            success : function(data) {
                this.setState({data : data});
            }.bind(this)
        });
    },
    sendData : function(data) {
        var comments    = this.state.data;
        var newComments = comments.concat([data]);
        this.setState({data: newComments});
        G.ajax({
            /*url      : 'comments.php',*/
            url      : 'comments_db.php',
            type     : 'post',
            data     : data,
            dataType : 'json',
            success  : function(data) {

            }.bind(this)
        });
    },
    componentDidMount : function() {
        this.loadComments();
        setInterval(this.loadComments, 5000);
    },
    render : function() {
        return (
            <div id="wrap">
                <CmtHeader data={info} />
                <CmtList data={this.state.data} />
                <CmtForm send={this.sendData} />
            </div>
        );
    }
});


React.render(
    React.createElement(CmtBody, null),
    document.getElementsByTagName('body')[0]
);