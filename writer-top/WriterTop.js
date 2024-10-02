class WriterTop {
    constructor(forums, startDate, endDate = null) {
        this.forumIds = forums;
        this.startDate = this.toTimestamp(startDate);
        this.endDate = endDate ? this.toTimestamp(endDate) : null;
        this.users = {};
        this.posts = {};
        this.topics = [];
        this.total = 0;
    }

    toTimestamp = (strDate) => {
        const dt = Date.parse(strDate);
        return dt / 1000;
    };


    dateFormat(timestamp) {
        var a = new Date(timestamp * 1000);
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
        document.getElementById(total_id).innerHTML = this.total;
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
            html += `<div class="writer-item__container"><span class="writer-item__username">${user['user_name']}</span><span class="writer-item__numb">${user['count']}</span><span class="writer-item__details"><ul class="writer-item__details-list">`;
            userPosts.forEach((post) => {
                html += `<li><a href="/viewtopic.php?pid=${post['post_id']}#p${post['post_id']}">${post['subject']}</a> (${this.dateFormat(post['posted'])})</li>`
            })
            html += `</ul></span></div>`
        })
        return html;
    }

    async processTopics() {

        let result = true
        let offset_topics = 0
        let limit = 100

        while(result) {
            result = await this.findTopics(this.forumIds.join(','), limit, offset_topics);
            offset_topics += limit
        }

        let n = 0
        while (n < this.topics.length) {
            let postCount = 0
            let initPosts = {}
            let topicIds = []


            while(postCount < 1000 && n < this.topics.length) {
                postCount += (1 + parseInt(this.topics[n]['num_replies']))
                initPosts[this.topics[n]['id']] = this.topics[n]['init_id'];
                topicIds.push(this.topics[n]['id']);
                n += 1
            }

            result = true
            let offset_posts = 0
            while (result) {
                result = await this.findPosts(topicIds.join(','), initPosts, limit, offset_posts);
                offset_posts += limit
            }
        }
    }

    async findTopics(forumIds, limit, offset) {
        const topicData = await this.apiCall('topic.get', {"forum_id": forumIds},
            ["id", "init_post", "last_post_date", "num_replies"], 'last_post', 'desc', offset, limit);
        if (topicData.length === 0) {
            return false;
        }
        let i = 0;
        while (i < topicData.length) {
            const topicDatum = topicData[i];
            topicDatum['last_post_date'] = parseInt(topicDatum['last_post_date'])
            if (topicDatum['last_post_date'] >= this.startDate) {
                if (topicDatum['num_replies'] !== 0) {
                    if (this.endDate && topicDatum['last_post_date'] > this.endDate) {
                        i += 1;
                        continue;
                    }
                    this.topics.push(topicDatum)
                    this.total += 1;
                    i += 1;
                }
            } else {
                return false
            }
        }
        if (topicData.length < limit) {
            return false
        } else {
            return true
        }
    }

    async findPosts(topicIds, initPosts, limit, offset) {
        const postData = await this.apiCall('post.get', {"topic_id": topicIds},
            ["id", "user_id", "topic_id", "username", "subject", "posted"], 'posted', 'desc', offset, limit);
        if (postData.length === 0) {
            return false;
        }

        let i = 0;
        while (i < postData.length) {
            const postDatum = postData[i];
            postDatum['posted'] = parseInt(postDatum['posted'])
            if (postDatum['posted'] >= this.startDate) {
                if(this.endDate && postDatum['posted'] > this.endDate || postDatum['id'] === initPosts[postDatum['topic_id']]) {
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
                this.total += 1;
                i += 1;
            } else {
                return false;
            }
        }
        if (postData.length < limit) {
            return false
        } else {
            return true
        }
    }

    /**
     *
     * @returns {Promise<void>}
     * @param method - string
     * @param filters - object
     * @param fields - array
     * @param sortBy - string
     * @param sortDir - ASC/DESC
     * @param skip - number, max 1000
     * @param limit - number, default 50, max 100
     */
    async apiCall(method, filters = null, fields = [], sortBy = null, sortDir = null, skip = null, limit = null) {
        const response = await fetch(this.combineUrl(method, filters, fields, sortBy, sortDir, skip, limit))
        const j = await response.json()
        return j['response']
        //  return response.json()
    }

    combineUrl(method, filters = null, fields = [], sortBy = null, sortDir = null, skip = null, limit = null)
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

        if (sortBy != null) {
            url += '&sort_by='+sortBy;
        }

        if (sortDir != null) {
            url += '&sort_dir='+sortDir;
        }
        if (skip !== null) {
            url += '&skip='+skip;
        }
        if (limit !== null) {
            url += '&limit='+limit;
        }
        return url;
    }

}

if (typeof exports !== 'undefined') {
    module.exports =  WriterTop;
}