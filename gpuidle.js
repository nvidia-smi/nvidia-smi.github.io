window.addEventListener('load', () => {
    if ($('.masonry').length > 0) {
        var container = $( '.masonry' );
        container.masonry( {
            itemSelector: '.masonry-item',
            columnWidth: '.masonry-sizer',
            percentPosition: true,
        } );
    }
});

var i18n_set = {
    'en': {
        seconds: 's ago',
        minutes: 'mins ago',
        hours: 'hours ago',
        days: 'days ago',
        now: 'just now',
    }
}

var { Query, User } = AV;
if (getQueryVariable('username')) {
    AV.init(getQueryVariable('username'), getQueryVariable('password'));
}
else {
    window.location.href="signin.html";
}

var cql = 'select * from GPU_ order by -is_idle, load, hostname';

AV.Query.doCloudQuery(cql, []).then(function (data) {
    var results = data.results;
    var onl_num = 0;
    var hostnames = [];
    var hostnames_avail = [];
    results.forEach(g => {
        $('#gpu-table').append(`<tr>
                        <td>${timeDelta(g.get('updatedAt')) > 1200 ? '<span class="badge bgc-red-50 c-red-700 p-10 lh-0 tt-c badge-pill">offline</span>' : (g.get('is_idle') ? '<span class="badge bgc-green-50 c-green-700 p-10 lh-0 tt-c badge-pill">idle</span>' : '<span class="badge bgc-orange-50 c-orange-700 p-10 lh-0 tt-c badge-pill">running</span>')}</td>
                        <td>(#${g.get('device_id')})${g.get('name').split("GeForce ").pop()}</td>
                        <td>${Math.floor(g.get('load')* 100)}%</td>
                        <td>
                        <small class="fw-600 c-grey-700">${Math.round((g.get('memory_total') - g.get('memory_free')) / 1000)}GB / ${Math.round(g.get('memory_total') / 1000)}GB </small><div class="progress mT-10">
                        <div class="progress-bar ${ g.get('memory_free') / g.get('memory_total') > 0.7 ? 'bgc-green-500' : (g.get('memory_free') / g.get('memory_total') > 0.5 ? 'bgc-orange-500' : 'bgc-red-500')}" role="progressbar" aria-valuenow="50"
                          aria-valuemin="0" aria-valuemax="100" style="width:${100 - g.get('memory_free') / g.get('memory_total') * 100}%"><span class="sr-only">50%
                            Complete</span></div>
                      </div></td>
                        <td>${g.get('temperature')}℃</td>
                        <td>${g.get('hostname')}: ${g.get('ip')}${g.get('note') ? ', ' + g.get('note'):''}</td>
                        <td>${timeAgo(g.get('updatedAt'), i18n_set['en'])}</td>
                        </tr>`)
        if (timeDelta(g.get('updatedAt')) <= 1200) {
            onl_num += 1;
            hostnames_avail.push(g.get('hostname'));
        }
        hostnames.push(g.get('hostname'));        
    });
    $('#gpu-avail').html(`${onl_num} / ${results.length}`);
    hostnames = hostnames.filter((v, i, a) => a.indexOf(v) === i);
    hostnames_avail = hostnames_avail.filter((v, i, a) => a.indexOf(v) === i);
    $('#hosts-online').html(`${hostnames_avail.length} / ${hostnames.length}`);

    if ($('.masonry').length > 0) {
        var container = $( '.masonry' );
        container.masonry( {
            itemSelector: '.masonry-item',
            columnWidth: '.masonry-sizer',
            percentPosition: true,
        } );
        $( container ).masonry( 'reloadItems' );
        $( container ).masonry( 'layout' );
    }

}, function (error) {
});

AV.Query.doCloudQuery('select * from Tips limit 5 order by -updatedAt').then(function (data){
    var results = data.results;
    results.forEach(t => {
        $('#tips').append(`<span class="d-ib lh-0 bdrs-10em pY-15">${t.get('content')}</span>`);
    });
}, function (error){

});

const timeDelta = (date) => {
    delta = new Date().getTime() - date.getTime();
    return Math.floor(delta / 1000)
}

function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}

const timeAgo = (date, i18n) => {
    try {
        var oldTime = date.getTime();
        var currTime = new Date().getTime();
        var diffValue = currTime - oldTime;

        var days = Math.floor(diffValue / (24 * 3600 * 1000));
        if (days === 0) {
            //计算相差小时数
            var leave1 = diffValue % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
            var hours = Math.floor(leave1 / (3600 * 1000));
            if (hours === 0) {
                //计算相差分钟数
                var leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
                var minutes = Math.floor(leave2 / (60 * 1000));
                if (minutes === 0) {
                    //计算相差秒数
                    var leave3 = leave2 % (60 * 1000); //计算分钟数后剩余的毫秒数
                    var seconds = Math.round(leave3 / 1000);
                    return seconds + ' ' +  i18n['seconds'];
                }
                return minutes + ' ' + i18n['minutes'];
            }
            return hours + ' ' + i18n['hours'];
        }
        if (days < 0)
            return i18n['now'];
        else
            return days + ' ' + i18n['days'];
    } catch (error) {
        console.log(error)
    }
}