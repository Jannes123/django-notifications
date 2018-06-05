var notify_badge_class;
var notify_menu_class;
var notify_api_url;
var notify_fetch_count;
var notify_unread_url;
var notify_mark_all_unread_url;
var notify_refresh_period = 15000;
var consecutive_misfires = 0;
var registered_functions = [];
var csrftoken;
JLINK = XMLHttpRequest;
var jl = new JLINK();
var r = new XMLHttpRequest();

function fill_notification_badge(data) {
    var badges = document.getElementsByClassName(notify_badge_class);
    if (badges) {
        for(var i = 0; i < badges.length; i++){
            badges[i].innerHTML = data.unread_count;
        }
    }
}

function fill_notification_list(data) {
    var menus = document.getElementsByClassName(notify_menu_class);
    if (menus) {
        var messages = data.unread_list.map(function (item) {
            var message = "";
            if(typeof item.actor !== 'undefined'){
                message = item.actor;
            }
            if(typeof item.verb !== 'undefined'){
                message = message + " " + item.verb;
            }
            if(typeof item.target !== 'undefined'){
                message = message + " " + item.target;
            }
            if(typeof item.timestamp !== 'undefined'){
                message = message + " " + item.timestamp;
            }
            message = '<div class="row"><a>' + message + '</a>'
            message = message + '<a class="btn btn-primary" onclick="do_post_call(\'' + origin + item.deleter + '\');' + '" role="button">Del</a></div>';
            return message
        }).join('')

        for (var i = 0; i < menus.length; i++){
            menus[i].innerHTML = messages;
        }
    }
}

function register_notifier(func) {
    registered_functions.push(func);
}

function fetch_api_data(reset_notify_period = false) {
    if (registered_functions.length > 0) {
        //only fetch data if a function is setup
        r.addEventListener('readystatechange', function(event){
            if (this.readyState === 4){
                if (this.status === 200){
                    consecutive_misfires = 0;
                    var data = JSON.parse(r.responseText);
                    registered_functions.forEach(function (func) { func(data); });
                    this.abort();
                    this.
                    r = null;
                    r = new XMLHttpRequest();
                }else{
                    console.log('-MISFIRE-');
                    consecutive_misfires++;
                }
            }
        });
        r.open("GET", notify_api_url+'?max='+notify_fetch_count, true);
        r.send();
    }
    if (consecutive_misfires < 10 || reset_notify_period) {
        //setTimeout(fetch_api_data,notify_refresh_period);
        console.log('connection lost');
    } else {
        var badges = document.getElementsByClassName(notify_badge_class);
        if (badges) {
            for (var i = 0; i < badges.length; i++){
                badges[i].innerHTML = "!";
                badges[i].title = "Connection lost!"
            }
        }
    }
}



function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


function do_post_call(bullet) {
    var jtoken = getCookie('csrftoken');
    method = 'POST';
    jl.open(method, bullet, true);
    jl.setRequestHeader("X-CSRFToken", jtoken);
    jl.addEventListener('readystatechange', function(event){
            if (this.readyState === 4){
                if (this.status === 200){
                    consecutive_misfires = 0;
                    fetch_api_data(reset_notify_period = true);
            }
        }
    });
    jl.send('delete');
}

setInterval(fetch_api_data, notify_refresh_period);
