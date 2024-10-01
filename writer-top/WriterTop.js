class WriterTop {
    constructor(forums, startDate) {
        this.forumIds = forums;
        this.startDate = startDate;
        this.users = {}
        this.posts = {}
    }

    dateFormat(timestamp) {
        var a = new Date(timestamp * 1000);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
        return time;
    }

    async execute(div_id) {
        await this.processTopics();
        console.log(this)
        document.getElementById(div_id).innerHTML = this.render();
    }

    render() {
        let html = '';
        const users = Object.values(this.users);
        users.sort((a, b) => {
            if (a.count < b.count) return 1;
            if (a.count > b.count) return -1;
            if (a.count === b.count) return 0;
        })
        users.forEach((user) => {
            const userPosts = this.posts[user['user_id']];
            html += `<div><span>${user['user_name']}</span><span>${user['count']}</span><span><ul>`;
            userPosts.forEach((post) => {
                html += `<li><a href="/viewtopic.php?pid=${post['post_id']}">${post['subject']}</a> (${this.dateFormat(post['posted'])})</li>`
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
        console.log(topicData);

        await Promise.all(topicData.map(async (topicDatum) => {
            const result = await this.findPosts(topicDatum['id'], topicDatum['init_post']);
        }))
    }

    async findPosts(topicId, initPostId) {
        const postData = await this.apiCall('post.get', {"topic_id": topicId},
            ["id", "user_id", "username", "subject", "posted"], 'posted', 'desc');
        console.log(postData)
        let c = true;
        let i = 0;
        while (c && i < postData.length) {
            const postDatum = postData[i];
            postDatum['posted'] = parseInt(postDatum['posted'])
            if (postDatum['posted'] >= this.startDate && postDatum['id'] !== initPostId) {
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