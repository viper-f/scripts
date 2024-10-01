class WriterTop {
    constructor(forums, startDate, endDate = null) {
        this.forumIds = forums;
        this.startDate = this.toTimestamp(startDate);
        this.endDate = endDate ? this.toTimestamp(endDate) : null;
        this.users = {};
        this.posts = {};
    }

    toTimestamp = (strDate) => {
        const dt = Date.parse(strDate);
        return dt / 1000;
    };


    dateFormat(timestamp) {
        var a = new Date(timestamp * 1000);
      //  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year = a.getFullYear();
        var month = ("00"+(a.getMonth() +1)).slice(-2);
        var date = ("00"+a.getDate()).slice(-2);
        var hour = ("00"+a.getHours()).slice(-2);
        var min = ("00"+a.getMinutes()).slice(-2);
        var sec = ("00"+a.getSeconds()).slice(-2);
        return year + '-' + month + '-' + date + ' ' + hour + ':' + min + ':' + sec ;
    }

    async execute(div_id, total_id) {
        await this.processTopics();
        document.getElementById(div_id).innerHTML = this.render();
        document.getElementById(total_id).innerHTML = this.posts.length;
    }

    render() {
        let html = '';
        const users = Object.values(this.users);
        users.sort((a, b) => {
            if (a.count < b.count) return 1;
            if (a.count > b.count) return -1;
            if (a.count === b.count) return 0;
        })
        let total = 0
        users.forEach((user) => {
            const userPosts = this.posts[user['user_id']];
            html += `<div class="writer-item__container"><span class="writer-item__username">${user['user_name']}</span><span class="writer-item__numb">${user['count']}</span><span class="writer-item__details"><ul class="writer-item__details-list">`;
            userPosts.forEach((post) => {
                html += `<li><a href="/viewtopic.php?pid=${post['post_id']}#p${post['post_id']}">${post['subject']}</a> (${this.dateFormat(post['posted'])})</li>`
            })
            html += `</ul></span></div>`
        })
        return html;
    }

    async processTopics() {
        let topicData = await Promise.all(this.forumIds.map(async (forumId) => {
            return await this.apiCall('topic.get', {"forum_id": forumId}, ["id", "init_post", "last_post_date"], 'last_post', 'desc')
        }))
        topicData =  await topicData.flat(1)

        topicData = topicData.filter((topic) => {return parseInt(topic['last_post_date']) > this.startDate})

        await Promise.all(topicData.map(async (topicDatum) => {
            const result = await this.findPosts(topicDatum['id'], topicDatum['init_post']);
        }))
    }

    async findPosts(topicId, initPostId) {
        const postData = await this.apiCall('post.get', {"topic_id": topicId},
            ["id", "user_id", "username", "subject", "posted"], 'posted', 'desc');
        let c = true;
        let i = 0;
        while (c && i < postData.length) {
            const postDatum = postData[i];
            postDatum['posted'] = parseInt(postDatum['posted'])
            if (postDatum['posted'] >= this.startDate && postDatum['id'] !== initPostId) {
                if(this.endDate && postDatum['posted'] > this.endDate) {
                     i+=1;
                    continue;
                }
                if (!this.users[postDatum['user_id']]) {
                    this.users[postDatum['user_id']] = {
                        "user_id": postDatum['user_id'],
                        "user_name": postDatum['username'],
                        "count": 0
                    };
                    this.posts[postDatum['user_id']] = [];
                }
                this.users[postDatum['user_id']].count += 1;
                this.posts[postDatum['user_id']].push({
                    "post_id": postDatum['id'],
                    "user_id": postDatum['user_id'],
                    "subject": postDatum['subject'],
                    "posted": postDatum['posted']
                })
                i += 1;
            } else {
                c = false;
            }
        }
        return true
    }

    /**
     *
     * @returns {Promise<void>}
     * @param method - string
     * @param filters - object
     * @param fields - array
     * @param sortBy = string
     */
    async apiCall(method, filters = null, fields = [], sortBy = null, sortDir = null) {
        const response = await fetch(this.combineUrl(method, filters, fields, sortBy, sortDir))
        const j = await response.json()
        return j['response']
        //  return response.json()
    }

    combineUrl(method, filters = null, fields = [], sortBy = null, sortDir = null)
    {
        let url = '/api.php?method='+method;
        if (filters) {
            for (const [key, value] of Object.entries(filters)) {
                url += '&' + key + '=' + value;
            }
        }
        if (fields.length) {
            url += '&fields=' + fields.join(',')
        }

        if (sortBy) {
            url += '&sort_by='+sortBy;
        }

        if (sortDir) {
            url += '&sort_dir='+sortDir;
        }
        return url;
    }

}

if (typeof exports !== 'undefined') {
    module.exports =  WriterTop;
}
